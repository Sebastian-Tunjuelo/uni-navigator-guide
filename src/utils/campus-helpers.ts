import type { Building, Route } from "@/types/campus";

export function buildNodeMap(buildings: Building[]) {
  return new Map(buildings.map(b => [b.id, b]));
}

export function getRouteLength(buildings: Building[], route: string[]) {
  const nodeMap = buildNodeMap(buildings);
  let total = 0;
  for (let i = 0; i < route.length - 1; i += 1) {
    const a = nodeMap.get(route[i]);
    const b = nodeMap.get(route[i + 1]);
    if (!a || !b) continue;
    total += Math.hypot(a.latitude - b.latitude, a.longitude - b.longitude);
  }
  return Math.round(total * 0.45);
}

export function estimateWalkingTime(meters: number) {
  return Math.max(1, Math.round(meters / 80));
}

export function findRoute(buildings: Building[], routes: Route[], origin: string, destination: string) {
  if (origin === destination) return [origin];
  const nodeMap = buildNodeMap(buildings);
  const adj = new Map<string, { id: string; cost: number }[]>();
  buildings.forEach(b => adj.set(b.id, []));

  routes.forEach(route => {
    const A = nodeMap.get(route.from_id);
    const B = nodeMap.get(route.to_id);
    if (!A || !B) return;
    const c = Math.hypot(A.latitude - B.latitude, A.longitude - B.longitude);
    adj.get(A.id)?.push({ id: B.id, cost: c });
    adj.get(B.id)?.push({ id: A.id, cost: c });
  });

  const distances = new Map<string, number>();
  const prev = new Map<string, string | null>();
  buildings.forEach(b => {
    distances.set(b.id, Infinity);
    prev.set(b.id, null);
  });
  distances.set(origin, 0);

  const visited = new Set<string>();
  const queue = buildings.map(b => b.id);

  while (queue.length) {
    queue.sort((a, b) => distances.get(a)! - distances.get(b)!);
    const u = queue.shift();
    if (!u) break;
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === destination) break;
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
  let cur: string | null = destination;
  while (cur) {
    path.unshift(cur);
    cur = prev.get(cur) || null;
  }
  if (path[0] !== origin) return [];
  return path;
}
