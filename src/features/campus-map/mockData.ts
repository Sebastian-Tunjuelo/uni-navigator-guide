import type { CampusBlock, CampusEdge } from "./types";

export const blocks: CampusBlock[] = [
  { id: "ENT", name: "Entrada Principal", shortName: "Entrada", type: "entrada", x: 170, y: 460, w: 60, h: 30, nx: 200, ny: 460, emoji: "🚪" },
  { id: "PLAZA", name: "Plaza Central", shortName: "Plaza", type: "plaza", x: 160, y: 230, w: 80, h: 80, nx: 200, ny: 270, emoji: "⛲" },
  { id: "A", name: "Bloque A — Aulas", shortName: "Bloque A", type: "academico", x: 30, y: 340, w: 110, h: 90, nx: 85, ny: 340, emoji: "🅰️" },
  { id: "B", name: "Bloque B — Ciencias", shortName: "Bloque B", type: "academico", x: 30, y: 130, w: 110, h: 80, nx: 85, ny: 210, emoji: "🅱️" },
  { id: "C", name: "Bloque C — Laboratorios", shortName: "Bloque C", type: "academico", x: 260, y: 130, w: 110, h: 80, nx: 315, ny: 210, emoji: "🔬" },
  { id: "D", name: "Bloque D — Biblioteca", shortName: "Biblioteca", type: "biblioteca", x: 260, y: 340, w: 110, h: 90, nx: 315, ny: 340, emoji: "📚" },
  { id: "CAF", name: "Cafetería Central", shortName: "Cafetería", type: "cafeteria", x: 160, y: 350, w: 80, h: 60, nx: 200, ny: 380, emoji: "🍽️" },
  { id: "AUD", name: "Auditorio Mayor", shortName: "Auditorio", type: "auditorio", x: 160, y: 130, w: 80, h: 70, nx: 200, ny: 165, emoji: "🎭" },
  { id: "DEP", name: "Polideportivo", shortName: "Deportes", type: "deportes", x: 30, y: 30, w: 110, h: 70, nx: 85, ny: 65, emoji: "🏀" },
];

export const edges: CampusEdge[] = [
  { a: "ENT", b: "CAF" },
  { a: "CAF", b: "PLAZA" },
  { a: "CAF", b: "A" },
  { a: "CAF", b: "D" },
  { a: "PLAZA", b: "A" },
  { a: "PLAZA", b: "B" },
  { a: "PLAZA", b: "C" },
  { a: "PLAZA", b: "D" },
  { a: "PLAZA", b: "AUD" },
  { a: "B", b: "AUD" },
  { a: "C", b: "AUD" },
  { a: "B", b: "DEP" },
  { a: "A", b: "B" },
  { a: "C", b: "D" },
];
