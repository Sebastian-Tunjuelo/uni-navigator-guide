/**
 * GUÍA DE USO - Dataset de Campus Extendido
 * 
 * Este archivo documenta cómo integrar el dataset en tu aplicación
 * y proporciona ejemplos de uso común.
 */

// ============================================
// 1. IMPORTAR EL DATASET
// ============================================

import { campusBuildings, campusRoutes, Building, Route } from '@/data/campus-extended';

// ============================================
// 2. BÚSQUEDAS BÁSICAS
// ============================================

// Buscar un edificio por ID
const biblioteca = campusBuildings.find(b => b.id === 'LIB-001');
console.log(`📚 ${biblioteca?.name} - ${biblioteca?.description}`);

// Buscar todos los edificios de una categoría
const academicBuildings = campusBuildings.filter(
  b => b.category === 'academic'
);
console.log(`🎓 Facultades: ${academicBuildings.map(b => b.name).join(', ')}`);

// Buscar servicios de comida
const foodServices = campusBuildings.filter(b => b.category === 'food');
console.log(`🍽️  Opciones de comida: ${foodServices.length}`);

// ============================================
// 3. ANÁLISIS DE RUTAS
// ============================================

// Obtener todas las rutas desde un edificio
function getRoutesFrom(buildingId: string): Route[] {
  return campusRoutes.filter(r => r.from_id === buildingId);
}

// Obtener todas las rutas hacia un edificio
function getRoutesTo(buildingId: string): Route[] {
  return campusRoutes.filter(r => r.to_id === buildingId);
}

// Obtener todos los destinos desde un edificio
function getConnectedBuildings(buildingId: string): Building[] {
  const routeIds = new Set<string>();

  campusRoutes.forEach(route => {
    if (route.from_id === buildingId) {
      routeIds.add(route.to_id);
    }
    if (route.to_id === buildingId) {
      routeIds.add(route.from_id);
    }
  });

  return Array.from(routeIds)
    .map(id => campusBuildings.find(b => b.id === id)!)
    .filter(Boolean);
}

// Ejemplo de uso
const connectedToPlaza = getConnectedBuildings('PLZ-001');
console.log(
  `🏟️  Desde Plaza Central puedes ir a: ${connectedToPlaza.map(b => b.name).join(', ')}`
);

// ============================================
// 4. CÁLCULO DE DISTANCIAS
// ============================================

// Encontrar la ruta más corta entre dos edificios (Dijkstra)
interface PathResult {
  path: string[];
  totalDistance: number;
  totalDuration: number;
  routes: Route[];
}

function dijkstraPath(
  from: string,
  to: string,
  maxDepth: number = 10
): PathResult | null {
  if (from === to) {
    return { path: [from], totalDistance: 0, totalDuration: 0, routes: [] };
  }

  const distances: { [key: string]: number } = {};
  const durations: { [key: string]: number } = {};
  const previous: { [key: string]: string | null } = {};
  const visited = new Set<string>();

  // Inicializar
  campusBuildings.forEach(b => {
    distances[b.id] = Infinity;
    durations[b.id] = Infinity;
    previous[b.id] = null;
  });
  distances[from] = 0;
  durations[from] = 0;

  // Dijkstra
  for (let i = 0; i < maxDepth; i++) {
    let current: string | null = null;
    let minDistance = Infinity;

    // Encontrar nodo no visitado con menor distancia
    for (const buildingId in distances) {
      if (!visited.has(buildingId) && distances[buildingId] < minDistance) {
        current = buildingId;
        minDistance = distances[buildingId];
      }
    }

    if (current === null || current === to) break;

    visited.add(current);

    // Revisar vecinos
    campusRoutes.forEach(route => {
      let neighbor: string | null = null;
      let distance = 0;
      let duration = 0;

      if (route.from_id === current) {
        neighbor = route.to_id;
        distance = route.distance;
        duration = route.duration;
      } else if (route.to_id === current) {
        neighbor = route.from_id;
        distance = route.distance;
        duration = route.duration;
      }

      if (neighbor && !visited.has(neighbor)) {
        const newDistance = distances[current!] + distance;
        const newDuration = durations[current!] + duration;

        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          durations[neighbor] = newDuration;
          previous[neighbor] = current;
        }
      }
    });
  }

  // Reconstruir camino
  const path: string[] = [];
  let current: string | null = to;

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  if (path[0] !== from) {
    return null; // No hay camino
  }

  // Obtener rutas
  const routes: Route[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const route = campusRoutes.find(
      r =>
        (r.from_id === path[i] && r.to_id === path[i + 1]) ||
        (r.to_id === path[i] && r.from_id === path[i + 1])
    );
    if (route) routes.push(route);
  }

  return {
    path,
    totalDistance: distances[to],
    totalDuration: durations[to],
    routes
  };
}

// Ejemplo de uso
const pathFromACAtoLIB = dijkstraPath('ACA-A01', 'LIB-001');
if (pathFromACAtoLIB) {
  console.log(`\n🗺️  Camino más corto:`);
  console.log(
    `   Inicio: ${campusBuildings.find(b => b.id === pathFromACAtoLIB.path[0])?.name}`
  );
  pathFromACAtoLIB.path.slice(1, -1).forEach(id => {
    console.log(`   → ${campusBuildings.find(b => b.id === id)?.name}`);
  });
  console.log(
    `   Destino: ${campusBuildings.find(b => b.id === pathFromACAtoLIB.path[pathFromACAtoLIB.path.length - 1])?.name}`
  );
  console.log(`   Distancia: ${pathFromACAtoLIB.totalDistance}m`);
  console.log(`   Tiempo: ${pathFromACAtoLIB.totalDuration} minutos`);
}

// ============================================
// 5. FILTROS Y BÚSQUEDAS AVANZADAS
// ============================================

// Encontrar todos los edificios dentro de cierta distancia
function buildingsWithinDistance(
  fromId: string,
  maxDistance: number,
  maxHops: number = 2
): Building[] {
  const nearby = new Set<string>();

  function explore(currentId: string, remainingDistance: number, depth: number) {
    if (depth === 0 || remainingDistance <= 0) return;

    campusRoutes.forEach(route => {
      let next: string | null = null;
      let dist = 0;

      if (route.from_id === currentId) {
        next = route.to_id;
        dist = route.distance;
      } else if (route.to_id === currentId) {
        next = route.from_id;
        dist = route.distance;
      }

      if (next && !nearby.has(next) && remainingDistance - dist >= 0) {
        nearby.add(next);
        explore(next, remainingDistance - dist, depth - 1);
      }
    });
  }

  explore(fromId, maxDistance, maxHops);

  return Array.from(nearby)
    .map(id => campusBuildings.find(b => b.id === id)!)
    .filter(Boolean);
}

// Ejemplo: Qué hay cerca de la Residencia B en 300m?
const nearResB = buildingsWithinDistance('RES-B01', 300);
console.log(`\n🏠 Cerca de Residencia B (300m): ${nearResB.map(b => b.name).join(', ')}`);

// Buscar por tipo de servicio
function servicesByCategory(category: Building['category']): Building[] {
  return campusBuildings.filter(b => b.category === category);
}

const allLabs = servicesByCategory('service');
console.log(`\n🔬 Laboratorios disponibles: ${allLabs.length}`);

// ============================================
// 6. UTILIDADES PARA UI/VISUALIZACIÓN
// ============================================

// Obtener información visual de un edificio
interface BuildingInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
}

function getBuildingVisual(buildingId: string): BuildingInfo | null {
  const building = campusBuildings.find(b => b.id === buildingId);
  if (!building) return null;

  return {
    id: building.id,
    name: building.name,
    icon: building.icon || '🏢',
    color: building.color || '#64748b',
    category: building.category
  };
}

// Obtener información de una ruta
interface RouteInfo {
  from: string;
  to: string;
  distance: number;
  duration: number;
  type: string;
}

function getRouteInfo(routeId: string): RouteInfo | null {
  const route = campusRoutes.find(r => r.id === routeId);
  if (!route) return null;

  const from = campusBuildings.find(b => b.id === route.from_id);
  const to = campusBuildings.find(b => b.id === route.to_id);

  return {
    from: from?.name || route.from_id,
    to: to?.name || route.to_id,
    distance: route.distance,
    duration: route.duration,
    type: route.type
  };
}

// ============================================
// 7. ESTADÍSTICAS Y ANÁLISIS
// ============================================

interface CampusStats {
  totalBuildings: number;
  totalRoutes: number;
  averageDistance: number;
  averageDuration: number;
  mostConnectedBuilding: { id: string; name: string; connections: number };
  buildingsByCategory: Record<string, number>;
}

function getCampusStats(): CampusStats {
  // Contar conexiones por edificio
  const connections: Record<string, number> = {};

  campusRoutes.forEach(route => {
    connections[route.from_id] = (connections[route.from_id] || 0) + 1;
    connections[route.to_id] = (connections[route.to_id] || 0) + 1;
  });

  // Encontrar el más conectado
  let mostConnected = { id: '', connections: 0 };
  for (const [id, count] of Object.entries(connections)) {
    if (count > mostConnected.connections) {
      mostConnected = { id, connections: count };
    }
  }

  const mostConnectedBuilding = campusBuildings.find(
    b => b.id === mostConnected.id
  );

  // Contar por categoría
  const byCategory: Record<string, number> = {};
  campusBuildings.forEach(b => {
    byCategory[b.category] = (byCategory[b.category] || 0) + 1;
  });

  return {
    totalBuildings: campusBuildings.length,
    totalRoutes: campusRoutes.length,
    averageDistance:
      campusRoutes.reduce((sum, r) => sum + r.distance, 0) / campusRoutes.length,
    averageDuration:
      campusRoutes.reduce((sum, r) => sum + r.duration, 0) / campusRoutes.length,
    mostConnectedBuilding: {
      id: mostConnectedBuilding?.id || '',
      name: mostConnectedBuilding?.name || '',
      connections: mostConnected.connections
    },
    buildingsByCategory: byCategory
  };
}

const stats = getCampusStats();
console.log(`\n📊 Campus Statistics:`);
console.log(`   Total Buildings: ${stats.totalBuildings}`);
console.log(`   Total Routes: ${stats.totalRoutes}`);
console.log(`   Avg Distance: ${stats.averageDistance.toFixed(0)}m`);
console.log(`   Avg Duration: ${stats.averageDuration.toFixed(1)} min`);
console.log(
  `   Most Connected: ${stats.mostConnectedBuilding.name} (${stats.mostConnectedBuilding.connections} connections)`
);

// ============================================
// 8. EJEMPLOS DE CASOS DE USO
// ============================================

// Caso 1: Estudiante nuevo llega el primer día
console.log(`\n🎓 PRIMER DÍA - Itinerario sugerido:`);
const firstDayPath = dijkstraPath('ENT-001', 'PLZ-001');
if (firstDayPath) {
  console.log(`   1. Entrada → Plaza Central (${firstDayPath.totalDuration} min)`);
}

// Caso 2: Residente necesita comer
console.log(`\n🏠 ESTUDIANTE RESIDENTE - Opciones de comida cercanas:`);
const cafeteriaOptions = campusBuildings.filter(
  b => b.category === 'food' && b.latitude > 600
);
cafeteriaOptions.forEach(c => {
  console.log(`   - ${c.name}`);
});

// Caso 3: Estudiante de ingeniería
console.log(`\n⚙️  ESTUDIANTE DE INGENIERÍA - Campus map:`);
const engineeringBuilding = campusBuildings.find(b => b.id === 'ACA-A01');
const engLabs = buildingsWithinDistance('ACA-A01', 400);
console.log(`   Facultad: ${engineeringBuilding?.name}`);
console.log(`   Labs cercanos: ${engLabs.filter(l => l.category === 'service').map(l => l.name).join(', ')}`);

export {
  dijkstraPath,
  getConnectedBuildings,
  buildingsWithinDistance,
  servicesByCategory,
  getBuildingVisual,
  getRouteInfo,
  getCampusStats
};
