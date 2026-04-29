// Mapa del campus: bloques (nodos) y caminos (aristas)
// Coordenadas en un viewBox de 400x500

export interface CampusBlock {
  id: string;
  name: string;
  shortName: string;
  type: "academico" | "biblioteca" | "cafeteria" | "deportes" | "auditorio" | "entrada" | "plaza";
  // Polígono o rectángulo
  x: number;
  y: number;
  w: number;
  h: number;
  // Nodo de conexión (centro o entrada del bloque)
  nx: number;
  ny: number;
  emoji: string;
}

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

// Aristas: conexiones peatonales entre nodos
export const edges: { a: string; b: string }[] = [
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

// Dijkstra simple
export function findRoute(originId: string, destinationId: string): string[] {
  if (originId === destinationId) return [originId];
  const nodes = new Map(blocks.map(b => [b.id, b]));
  const adj = new Map<string, { id: string; cost: number }[]>();
  blocks.forEach(b => adj.set(b.id, []));
  const dist = (a: CampusBlock, b: CampusBlock) => Math.hypot(a.nx - b.nx, a.ny - b.ny);

  edges.forEach(({ a, b }) => {
    const A = nodes.get(a)!;
    const B = nodes.get(b)!;
    const c = dist(A, B);
    adj.get(a)!.push({ id: b, cost: c });
    adj.get(b)!.push({ id: a, cost: c });
  });

  const distances = new Map<string, number>();
  const prev = new Map<string, string | null>();
  blocks.forEach(b => {
    distances.set(b.id, Infinity);
    prev.set(b.id, null);
  });
  distances.set(originId, 0);
  const visited = new Set<string>();
  const queue = [...blocks.map(b => b.id)];

  while (queue.length) {
    queue.sort((x, y) => (distances.get(x)! - distances.get(y)!));
    const u = queue.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === destinationId) break;
    for (const { id: v, cost } of adj.get(u) || []) {
      if (visited.has(v)) continue;
      const alt = distances.get(u)! + cost;
      if (alt < distances.get(v)!) {
        distances.set(v, alt);
        prev.set(v, u);
      }
    }
  }

  const path: string[] = [];
  let cur: string | null = destinationId;
  while (cur) {
    path.unshift(cur);
    cur = prev.get(cur) || null;
  }
  if (path[0] !== originId) return [];
  return path;
}

export function routeDistance(path: string[]): number {
  const nodes = new Map(blocks.map(b => [b.id, b]));
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = nodes.get(path[i])!;
    const b = nodes.get(path[i + 1])!;
    total += Math.hypot(a.nx - b.nx, a.ny - b.ny);
  }
  // 1 unidad SVG ~ 0.6 m aprox (para que se sienta realista)
  return Math.round(total * 0.6);
}

export function walkingTime(meters: number): number {
  // 80 m/min caminando relajado
  return Math.max(1, Math.round(meters / 80));
}
