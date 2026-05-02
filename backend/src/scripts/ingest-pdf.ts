/**
 * Script: ingest-pdf.ts
 * Lee el PDF del campus, lo divide en chunks, genera embeddings con Gemini
 * y los sube a la tabla `documents` de Supabase.
 *
 * Ejecutar UNA SOLA VEZ:
 *   npx ts-node -r tsconfig-paths/register src/scripts/ingest-pdf.ts
 *
 * Requisitos previos:
 *   1. Haber ejecutado generate-campus-pdf.ts para crear data/campus-guide.pdf
 *   2. Haber ejecutado el SQL de setup en Supabase (ver docs/rag-setup.md)
 *   3. GEMINI_API_KEY configurada en .env.local
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// pdf-parse 1.1.1 exporta directamente como función CommonJS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> = require('pdf-parse');

import { createClient } from '@supabase/supabase-js';

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
// Para ingestión usamos service role key si está disponible, sino anon key
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMS = 768; // outputDimensionality reducido para compatibilidad con HNSW

const PDF_PATH = path.join(__dirname, '../../data/campus-guide.pdf');
const CHUNK_SIZE = 600;      // caracteres por chunk
const CHUNK_OVERLAP = 100;   // solapamiento entre chunks

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error('❌ Falta GEMINI_API_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Divide el texto en chunks con solapamiento para no perder contexto en los bordes.
 */
function splitIntoChunks(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) {   // descartar chunks muy cortos
      chunks.push(chunk);
    }
    start += size - overlap;
  }

  return chunks;
}

/**
 * Genera embedding de un texto usando gemini-embedding-001 con 768 dims.
 * Devuelve un array de 768 floats.
 */
async function embedText(text: string): Promise<number[] | null> {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent`,
      {
        model: `models/${GEMINI_EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: EMBEDDING_DIMS,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
      }
    );

    const embedding = response.data?.embedding?.values;
    if (!embedding || !Array.isArray(embedding)) {
      console.warn('⚠️  Gemini devolvió embedding vacío');
      return null;
    }
    return embedding as number[];
  } catch (err: any) {
    console.error(`❌ Error generando embedding: ${err?.response?.data?.error?.message || err}`);
    return null;
  }
}

/**
 * Extrae el título/sección del chunk buscando patrones como "1. Título" o "## Título"
 */
function extractTitle(chunk: string, index: number): string {
  const sectionMatch = chunk.match(/^(\d+\.\s+[^\n]+)/);
  if (sectionMatch) return sectionMatch[1].trim();

  const firstLine = chunk.split('\n')[0].trim();
  if (firstLine.length > 0 && firstLine.length < 80) return firstLine;

  return `Campus Guide — Chunk ${index + 1}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Iniciando ingestión del PDF del campus...\n');

  // 1. Leer PDF
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`❌ No se encontró el PDF en: ${PDF_PATH}`);
    console.error('   Ejecuta primero: npx ts-node -r tsconfig-paths/register src/scripts/generate-campus-pdf.ts');
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(PDF_PATH);
  const pdfData = await pdfParse(pdfBuffer);
  const rawText = pdfData.text;

  console.log(`📄 PDF leído: ${rawText.length} caracteres`);

  // 2. Dividir en chunks
  const chunks = splitIntoChunks(rawText, CHUNK_SIZE, CHUNK_OVERLAP);
  console.log(`✂️  Dividido en ${chunks.length} chunks (tamaño: ${CHUNK_SIZE}, overlap: ${CHUNK_OVERLAP})\n`);

  // 3. Limpiar documentos anteriores del mismo PDF (para re-ingestión limpia)
  console.log('🗑️  Limpiando documentos anteriores de campus-guide...');
  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('source', 'campus-guide.pdf');

  if (deleteError) {
    console.warn(`⚠️  No se pudo limpiar documentos anteriores: ${deleteError.message}`);
    console.warn('   (Puede que la tabla no exista aún — continúa de todas formas)\n');
  } else {
    console.log('✅ Documentos anteriores eliminados\n');
  }

  // 4. Generar embeddings e insertar en Supabase
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const title = extractTitle(chunk, i);

    process.stdout.write(`[${i + 1}/${chunks.length}] Embeddiendo: "${title.substring(0, 50)}..."  `);

    const embedding = await embedText(chunk);

    if (!embedding) {
      console.log('❌ SKIP (embedding falló)');
      errorCount++;
      continue;
    }

    const { error: insertError } = await supabase.from('documents').insert({
      title,
      content: chunk,
      embedding,
      source: 'campus-guide.pdf',
      category: detectCategory(chunk),
    });

    if (insertError) {
      console.log(`❌ ERROR: ${insertError.message}`);
      errorCount++;
    } else {
      console.log('✅');
      successCount++;
    }

    // Pequeña pausa para no saturar la API de Gemini (límite: 1500 req/min en free tier)
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   ✅ Insertados: ${successCount}`);
  console.log(`   ❌ Errores:    ${errorCount}`);
  console.log(`   📦 Total:      ${chunks.length}`);

  if (successCount > 0) {
    console.log('\n🎉 Ingestión completada. El chatbot ya puede usar esta información.');
  } else {
    console.log('\n⚠️  No se insertó ningún documento. Revisa los errores arriba.');
    console.log('   Asegúrate de haber ejecutado el SQL de setup en Supabase.');
  }
}

/**
 * Detecta la categoría del chunk según palabras clave
 */
function detectCategory(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('biblioteca')) return 'biblioteca';
  if (t.includes('cafetería') || t.includes('cafeteria') || t.includes('comida') || t.includes('menú')) return 'alimentacion';
  if (t.includes('bloque') || t.includes('edificio') || t.includes('laboratorio')) return 'instalaciones';
  if (t.includes('bienestar') || t.includes('psicológ') || t.includes('salud')) return 'bienestar';
  if (t.includes('beca') || t.includes('financiamiento') || t.includes('matrícula')) return 'financiero';
  if (t.includes('transporte') || t.includes('bus') || t.includes('parqueadero')) return 'transporte';
  if (t.includes('emergencia') || t.includes('seguridad') || t.includes('urgencia')) return 'seguridad';
  if (t.includes('portal') || t.includes('correo') || t.includes('digital')) return 'digital';
  if (t.includes('calendario') || t.includes('parcial') || t.includes('examen')) return 'calendario';
  if (t.includes('deporte') || t.includes('piscina') || t.includes('gimnasio')) return 'deportes';
  return 'general';
}

main().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
