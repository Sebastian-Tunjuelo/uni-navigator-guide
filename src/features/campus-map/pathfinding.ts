import { blocks, edges } from "./mockData";
import type { CampusBlock } from "./types";

export function findRoute(originId: string, destinationId: string): string[] {
  if (originId === destinationId) return [originId];
  const nodes = new Map(blocks.map((block) => [block.id, block]));
  const adj = new Map<string, { id: string; cost: number }[]>();
  blocks.forEach((block) => adj.set(block.id, []));
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
  blocks.forEach((block) => {
    distances.set(block.id, Infinity);
    prev.set(block.id, null);
  });
  distances.set(originId, 0);
  const visited = new Set<string>();
  const queue = [...blocks.map((block) => block.id)];

  while (queue.length) {
    queue.sort((x, y) => distances.get(x)! - distances.get(y)!);
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
  const nodes = new Map(blocks.map((block) => [block.id, block]));
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = nodes.get(path[i])!;
    const b = nodes.get(path[i + 1])!;
    total += Math.hypot(a.nx - b.nx, a.ny - b.ny);
  }
  return Math.round(total * 0.6);
}

export function walkingTime(meters: number): number {
  return Math.max(1, Math.round(meters / 80));
}
