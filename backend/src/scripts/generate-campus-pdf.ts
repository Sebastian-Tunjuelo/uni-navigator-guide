/**
 * Script: generate-campus-pdf.ts
 * Genera el PDF con información del campus universitario.
 * Ejecutar: npx ts-node -r tsconfig-paths/register src/scripts/generate-campus-pdf.ts
 */

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '../../data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'campus-guide.pdf');

// ── Helpers de formato ────────────────────────────────────────────────────────

function section(doc: PDFKit.PDFDocument, title: string) {
  doc
    .moveDown(1)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(title)
    .moveDown(0.4)
    .fontSize(11)
    .font('Helvetica');
}

function subsection(doc: PDFKit.PDFDocument, title: string) {
  doc
    .moveDown(0.6)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(title)
    .moveDown(0.3)
    .fontSize(11)
    .font('Helvetica');
}

function body(doc: PDFKit.PDFDocument, text: string) {
  doc.fontSize(11).font('Helvetica').text(text, { align: 'justify' }).moveDown(0.4);
}

// ─────────────────────────────────────────────────────────────────────────────

function generateCampusPDF() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(OUTPUT_FILE);
  doc.pipe(stream);

  // ── Portada ──────────────────────────────────────────────────────────────
  doc
    .fontSize(26)
    .font('Helvetica-Bold')
    .text('Guía del Campus Universitario', { align: 'center' })
    .moveDown(0.5)
    .fontSize(14)
    .font('Helvetica')
    .text('Universidad Nacional de Tecnología e Innovación (UNTI)', { align: 'center' })
    .moveDown(0.3)
    .text('Edición 2026 — Para estudiantes de primer semestre', { align: 'center' })
    .moveDown(2);

  // ── 1. Información General ────────────────────────────────────────────────
  section(doc, '1. Información General');
  body(doc, `La Universidad Nacional de Tecnología e Innovación (UNTI) fue fundada en 1985 y cuenta con más de 15,000 estudiantes activos. El campus principal está ubicado en la Avenida Universitaria 1200, Ciudad Académica. El campus tiene una extensión de 45 hectáreas y alberga 12 bloques académicos, 3 residencias estudiantiles, 2 cafeterías, una biblioteca central y múltiples zonas verdes.`);

  // ── 2. Bloques y Edificios ────────────────────────────────────────────────
  section(doc, '2. Bloques y Edificios Principales');

  subsection(doc, 'Bloque A — Ciencias Básicas');
  body(doc, `Ubicado en la entrada principal del campus. Contiene aulas de matemáticas, física y química. Horario de acceso: lunes a viernes de 6:00 a 22:00, sábados de 7:00 a 14:00. Tiene 3 laboratorios de física, 2 laboratorios de química y 20 aulas de clase. El bloque A también alberga la oficina de admisiones en el primer piso.`);

  subsection(doc, 'Bloque B — Humanidades y Bienestar');
  body(doc, `El Bloque B está en el centro del campus, frente a la plaza principal. En el primer piso se encuentran las aulas de humanidades, idiomas y comunicación. En el segundo piso está el Centro de Bienestar Estudiantil, que ofrece atención psicológica gratuita, orientación vocacional y talleres de manejo del estrés. Horario de bienestar: lunes a viernes de 8:00 a 18:00. No se requiere cita previa para la primera consulta.`);

  subsection(doc, 'Bloque C — Ingeniería y Tecnología');
  body(doc, `El Bloque C es el más grande del campus, con 5 pisos. Contiene los laboratorios de computación, electrónica y robótica. En el sótano hay un fab-lab con impresoras 3D disponibles para todos los estudiantes con carné vigente. Horario del fab-lab: lunes a viernes de 9:00 a 20:00. Para usar las impresoras 3D debes reservar turno en el portal estudiantil con al menos 24 horas de anticipación.`);

  subsection(doc, 'Bloque D — Administración y Rectoría');
  body(doc, `El Bloque D alberga las oficinas administrativas, la rectoría, la vicerrectoría académica y la dirección financiera. Aquí se realizan trámites de matrícula, certificados, paz y salvo y solicitudes de beca. Horario de atención: lunes a viernes de 8:00 a 16:00. Se recomienda llegar temprano los días de inicio de semestre.`);

  subsection(doc, 'Bloque E — Ciencias de la Salud');
  body(doc, `El Bloque E está en el extremo norte del campus. Contiene los programas de medicina, enfermería y nutrición. Tiene una clínica universitaria en el primer piso que atiende urgencias menores para estudiantes de forma gratuita. Horario de la clínica: lunes a viernes de 7:00 a 19:00, sábados de 8:00 a 13:00.`);

  // ── 3. Biblioteca Central ─────────────────────────────────────────────────
  section(doc, '3. Biblioteca Central');
  body(doc, `La Biblioteca Central está ubicada entre los bloques A y C, en un edificio independiente de 4 pisos. Cuenta con más de 80,000 títulos físicos y acceso a 15 bases de datos académicas internacionales. Servicios disponibles: préstamo de libros (hasta 5 libros por 15 días), salas de estudio grupal (reserva en línea), cubículos individuales de silencio, computadores de acceso libre y escáner gratuito.

Horario de la biblioteca: lunes a viernes de 7:00 a 21:00, sábados de 8:00 a 17:00, domingos de 10:00 a 16:00 (solo sala de lectura). Para el préstamo de libros necesitas tu carné estudiantil vigente. Las multas por retraso son de $500 pesos por día por libro.`);

  // ── 4. Cafeterías y Alimentación ──────────────────────────────────────────
  section(doc, '4. Cafeterías y Alimentación');

  subsection(doc, 'Cafetería Principal');
  body(doc, `La Cafetería Principal está ubicada en la plaza central del campus, entre los bloques B y D. Ofrece desayuno, almuerzo y cena con menú estudiantil subsidiado. Precios del menú estudiantil: desayuno $2,500, almuerzo $5,000, cena $4,000. Horario: lunes a viernes de 6:30 a 20:00, sábados de 7:00 a 15:00. También tiene zona de snacks y bebidas disponible hasta las 21:00. Hay dispensadores de agua potable gratuita en la entrada.`);

  subsection(doc, 'Cafetería Norte');
  body(doc, `La Cafetería Norte está junto al Bloque E y el estadio. Es más pequeña y especializada en comida rápida saludable. Horario: lunes a viernes de 7:00 a 18:00. Acepta pagos con tarjeta y efectivo.`);

  subsection(doc, 'Máquinas Expendedoras');
  body(doc, `Hay máquinas expendedoras de snacks y bebidas en los pasillos de los bloques A, B, C y D, disponibles las 24 horas. También hay dispensadores de agua fría y caliente en cada piso de todos los bloques.`);

  // ── 5. Servicios Estudiantiles ────────────────────────────────────────────
  section(doc, '5. Servicios Estudiantiles');

  subsection(doc, 'Secretaría Académica');
  body(doc, `La Secretaría Académica está en el Bloque D, primer piso, ventanilla 3. Aquí puedes solicitar: certificados de estudio, constancias de notas, paz y salvo académico, cambios de grupo y adiciones/cancelaciones de materias. Horario: lunes a viernes de 8:00 a 16:00. Muchos trámites también están disponibles en el portal estudiantil en portal.unti.edu.co.`);

  subsection(doc, 'Oficina de Becas y Financiamiento');
  body(doc, `Ubicada en el Bloque D, segundo piso. Gestiona becas por mérito académico, becas socioeconómicas, créditos ICETEX y descuentos especiales. Para aplicar a una beca debes tener promedio mínimo de 3.8 y estar al día con los pagos. Las convocatorias abren en febrero y julio de cada año.`);

  subsection(doc, 'Centro de Idiomas');
  body(doc, `El Centro de Idiomas está en el Bloque B, tercer piso. Ofrece cursos de inglés, francés, alemán, mandarín y portugués. Los estudiantes de primer semestre tienen acceso gratuito al nivel básico de inglés. También hay laboratorios de idiomas con software de práctica disponibles de lunes a sábado.`);

  subsection(doc, 'Deportes y Recreación');
  body(doc, `Las instalaciones deportivas están en el extremo sur del campus. Incluyen: cancha de fútbol (reserva en línea), cancha de baloncesto (libre), piscina semiolímpica (horario de 6:00 a 20:00, costo $1,000 por sesión para estudiantes), gimnasio (membresía semestral $30,000), canchas de tenis y voleibol. Para usar la piscina y el gimnasio necesitas carné estudiantil vigente y examen médico del semestre.`);

  // ── 6. Transporte y Movilidad ─────────────────────────────────────────────
  section(doc, '6. Transporte y Movilidad');
  body(doc, `El campus tiene 3 entradas: Entrada Principal (Avenida Universitaria), Entrada Norte (Calle 45) y Entrada Sur (Carrera 12). El servicio de bus universitario opera desde las 5:30 hasta las 22:30 con rutas que cubren los principales barrios de la ciudad. El costo del bus universitario es de $800 por trayecto con carné estudiantil. Hay parqueadero gratuito para bicicletas en todos los bloques. El parqueadero de motos tiene costo de $2,000 por día. Hay ciclovía interna que conecta todos los bloques.`);

  // ── 7. Emergencias y Seguridad ────────────────────────────────────────────
  section(doc, '7. Emergencias y Seguridad');
  body(doc, `El campus cuenta con vigilancia las 24 horas. En caso de emergencia médica llama al 123 (emergencias nacionales) o al interno 9-1-1 desde cualquier teléfono del campus. La clínica universitaria en el Bloque E atiende urgencias menores. Hay puntos de encuentro en caso de evacuación señalizados con triángulos verdes en cada bloque. El número de seguridad del campus es 601-234-5678. Hay cámaras de seguridad en todos los accesos y zonas comunes.`);

  // ── 8. Portal Estudiantil y Recursos Digitales ───────────────────────────
  section(doc, '8. Portal Estudiantil y Recursos Digitales');
  body(doc, `El portal estudiantil está disponible en portal.unti.edu.co. Desde allí puedes: ver y descargar tu horario, consultar notas, pagar matrícula, solicitar certificados, reservar salas y laboratorios, acceder a las bases de datos académicas y comunicarte con tus profesores. El usuario es tu número de documento y la contraseña inicial es tu fecha de nacimiento en formato DDMMAAAA. Se recomienda cambiar la contraseña en el primer acceso. El correo institucional es tuNúmeroDeDocumento@estudiantes.unti.edu.co.`);

  // ── 9. Calendario Académico 2026 ──────────────────────────────────────────
  section(doc, '9. Calendario Académico 2026');
  body(doc, `Primer semestre 2026:
- Inicio de clases: 26 de enero de 2026
- Semana de inducción: 19 al 23 de enero de 2026
- Primer parcial: semana del 2 al 6 de marzo
- Semana de receso: 6 al 10 de abril
- Segundo parcial: semana del 27 de abril al 1 de mayo
- Exámenes finales: 25 de mayo al 6 de junio
- Publicación de notas finales: 13 de junio
- Inicio de vacaciones: 14 de junio

Segundo semestre 2026:
- Inicio de clases: 27 de julio de 2026
- Exámenes finales: 23 de noviembre al 5 de diciembre`);

  // ── 10. Consejos para Primer Semestre ─────────────────────────────────────
  section(doc, '10. Consejos para Estudiantes de Primer Semestre');
  body(doc, `1. Activa tu correo institucional el primer día — muchas comunicaciones importantes llegan ahí.
2. Descarga el mapa del campus desde el portal estudiantil para orientarte las primeras semanas.
3. El Centro de Bienestar (Bloque B, piso 2) ofrece talleres gratuitos de técnicas de estudio y manejo de ansiedad — muy recomendados.
4. La biblioteca tiene tutoriales de inducción los primeros viernes del semestre a las 10:00 AM.
5. Guarda el número de seguridad del campus: 601-234-5678.
6. El menú estudiantil de la cafetería es la opción más económica y nutritiva del campus.
7. Únete a los grupos de WhatsApp de tu programa — los coordinadores los comparten en la semana de inducción.
8. Si tienes dudas académicas, cada departamento tiene horas de tutoría gratuita publicadas en el portal.`);

  doc.end();

  stream.on('finish', () => {
    console.log(`✅ PDF generado exitosamente: ${OUTPUT_FILE}`);
  });
}

generateCampusPDF();
