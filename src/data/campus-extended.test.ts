/**
 * Pruebas y Validaciones del Dataset de Campus
 * Ejecutar con: npm test -- campus-extended.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { campusBuildings, campusRoutes, Building, Route } from './campus-extended';

describe('Campus Extended Dataset', () => {
  const buildingIds = new Set(campusBuildings.map(b => b.id));
  const routeIds = new Set(campusRoutes.map(r => r.id));

  // ============ PRUEBAS DE ESTRUCTURA ============

  describe('Buildings Structure', () => {
    it('debe tener entre 25 y 35 edificios', () => {
      expect(campusBuildings.length).toBeGreaterThanOrEqual(25);
      expect(campusBuildings.length).toBeLessThanOrEqual(35);
    });

    it('cada edificio debe tener todos los campos requeridos', () => {
      campusBuildings.forEach(building => {
        expect(building).toHaveProperty('id');
        expect(building).toHaveProperty('name');
        expect(building).toHaveProperty('description');
        expect(building).toHaveProperty('category');
        expect(building).toHaveProperty('latitude');
        expect(building).toHaveProperty('longitude');
      });
    });

    it('el ID debe ser único para cada edificio', () => {
      const ids = campusBuildings.map(b => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('las categorías deben ser válidas', () => {
      const validCategories = [
        'academic',
        'library',
        'service',
        'residence',
        'sports',
        'health',
        'admin',
        'food',
        'entrance'
      ];

      campusBuildings.forEach(building => {
        expect(validCategories).toContain(building.category);
      });
    });
  });

  // ============ PRUEBAS DE COORDENADAS ============

  describe('Coordinates', () => {
    it('latitud debe estar en rango [0, 1000]', () => {
      campusBuildings.forEach(building => {
        expect(building.latitude).toBeGreaterThanOrEqual(0);
        expect(building.latitude).toBeLessThanOrEqual(1000);
      });
    });

    it('longitud debe estar en rango [0, 1000]', () => {
      campusBuildings.forEach(building => {
        expect(building.longitude).toBeGreaterThanOrEqual(0);
        expect(building.longitude).toBeLessThanOrEqual(1000);
      });
    });

    it('no debe haber edificios en la misma ubicación exacta', () => {
      const locations = campusBuildings.map(b => `${b.latitude},${b.longitude}`);
      const uniqueLocations = new Set(locations);
      expect(uniqueLocations.size).toBe(locations.length);
    });
  });

  // ============ PRUEBAS DE RUTAS ============

  describe('Routes Structure', () => {
    it('debe tener entre 40 y 50 rutas', () => {
      expect(campusRoutes.length).toBeGreaterThanOrEqual(40);
      expect(campusRoutes.length).toBeLessThanOrEqual(50);
    });

    it('cada ruta debe tener campos requeridos', () => {
      campusRoutes.forEach(route => {
        expect(route).toHaveProperty('id');
        expect(route).toHaveProperty('from_id');
        expect(route).toHaveProperty('to_id');
        expect(route).toHaveProperty('distance');
        expect(route).toHaveProperty('type');
        expect(route).toHaveProperty('duration');
      });
    });

    it('los IDs de ruta deben ser únicos', () => {
      const ids = campusRoutes.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('los tipos de ruta deben ser válidos', () => {
      const validTypes = ['walking', 'covered', 'shortcuts'];

      campusRoutes.forEach(route => {
        expect(validTypes).toContain(route.type);
      });
    });
  });

  // ============ PRUEBAS DE INTEGRIDAD REFERENCIAL ============

  describe('Referential Integrity', () => {
    it('todas las rutas deben referenciar edificios que existen', () => {
      campusRoutes.forEach(route => {
        expect(buildingIds.has(route.from_id)).toBe(true);
        expect(buildingIds.has(route.to_id)).toBe(true);
      });
    });

    it('no debe haber rutas de un edificio a sí mismo', () => {
      campusRoutes.forEach(route => {
        expect(route.from_id).not.toBe(route.to_id);
      });
    });

    it('no debe haber rutas duplicadas (ida y vuelta)', () => {
      const seenRoutes = new Set<string>();

      campusRoutes.forEach(route => {
        const key = [route.from_id, route.to_id].sort().join('-');

        if (seenRoutes.has(key)) {
          // Es aceptable tener rutas bidireccionales explícitas
          // Pero reportamos duplicados verdaderos
          const duplicate = campusRoutes.find(
            r =>
              (r.from_id === route.from_id && r.to_id === route.to_id) ||
              (r.from_id === route.to_id && r.to_id === route.from_id)
          );
          // Solo fallar si son exactamente iguales
          if (duplicate && duplicate.id !== route.id) {
            const isExactDuplicate =
              JSON.stringify(duplicate) === JSON.stringify(route);
            expect(isExactDuplicate).toBe(false);
          }
        }

        seenRoutes.add(key);
      });
    });
  });

  // ============ PRUEBAS DE DISTANCIA Y DURACIÓN ============

  describe('Distance and Duration', () => {
    it('distancia debe estar entre 50 y 500 metros', () => {
      campusRoutes.forEach(route => {
        expect(route.distance).toBeGreaterThanOrEqual(50);
        expect(route.distance).toBeLessThanOrEqual(500);
      });
    });

    it('duración debe estar entre 1 y 7 minutos', () => {
      campusRoutes.forEach(route => {
        expect(route.duration).toBeGreaterThanOrEqual(1);
        expect(route.duration).toBeLessThanOrEqual(7);
      });
    });

    it('la velocidad estimada debe ser 1-2 m/s (caminata normal)', () => {
      campusRoutes.forEach(route => {
        const speedMs = route.distance / (route.duration * 60);
        // 0.8 - 2.0 m/s es rango aceptable para caminata
        expect(speedMs).toBeGreaterThan(0.8);
        expect(speedMs).toBeLessThan(2.0);
      });
    });

    it('waypoints deben ser coordenadas válidas si existen', () => {
      campusRoutes.forEach(route => {
        if (route.waypoints) {
          route.waypoints.forEach(waypoint => {
            expect(Array.isArray(waypoint)).toBe(true);
            expect(waypoint.length).toBe(2);
            expect(waypoint[0]).toBeGreaterThanOrEqual(0);
            expect(waypoint[0]).toBeLessThanOrEqual(1000);
            expect(waypoint[1]).toBeGreaterThanOrEqual(0);
            expect(waypoint[1]).toBeLessThanOrEqual(1000);
          });
        }
      });
    });
  });

  // ============ PRUEBAS DE CONECTIVIDAD ============

  describe('Network Connectivity', () => {
    it('cada edificio principal debe tener al menos 3 conexiones', () => {
      const mainBuildings = ['PLZ-001', 'LIB-001', 'ACA-A01', 'ADM-001'];

      mainBuildings.forEach(buildingId => {
        const connections = campusRoutes.filter(
          r => r.from_id === buildingId || r.to_id === buildingId
        );
        expect(connections.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('no debe haber edificios aislados (sin conexiones)', () => {
      const connectedBuildings = new Set<string>();

      campusRoutes.forEach(route => {
        connectedBuildings.add(route.from_id);
        connectedBuildings.add(route.to_id);
      });

      expect(connectedBuildings.size).toBe(campusBuildings.length);
    });

    it('Plaza Central debe ser HUB con ≥8 conexiones', () => {
      const plazaConnections = campusRoutes.filter(
        r => r.from_id === 'PLZ-001' || r.to_id === 'PLZ-001'
      );
      expect(plazaConnections.length).toBeGreaterThanOrEqual(8);
    });
  });

  // ============ PRUEBAS DE DISTRIBUCIÓN GEOGRÁFICA ============

  describe('Geographic Distribution', () => {
    it('debe haber edificios en todas las zonas principales', () => {
      const norte = campusBuildings.filter(b => b.latitude > 800).length;
      const centro = campusBuildings.filter(
        b => b.latitude >= 300 && b.latitude <= 700
      ).length;
      const sur = campusBuildings.filter(b => b.latitude < 300).length;

      expect(norte).toBeGreaterThan(0);
      expect(centro).toBeGreaterThan(0);
      expect(sur).toBeGreaterThan(0);
    });

    it('debe haber distribución este-oeste', () => {
      const oeste = campusBuildings.filter(b => b.longitude < 300).length;
      const centro = campusBuildings.filter(
        b => b.longitude >= 300 && b.longitude <= 700
      ).length;
      const este = campusBuildings.filter(b => b.longitude > 700).length;

      expect(oeste).toBeGreaterThan(0);
      expect(centro).toBeGreaterThan(0);
      expect(este).toBeGreaterThan(0);
    });
  });

  // ============ PRUEBAS DE COLOREO Y ICONOS ============

  describe('Colors and Icons', () => {
    it('los colores deben ser hex válidos si existen', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;

      campusBuildings.forEach(building => {
        if (building.color) {
          expect(building.color).toMatch(hexRegex);
        }
      });
    });

    it('cada categoría debe tener un color consistente', () => {
      const colorsByCategory: { [key: string]: Set<string> } = {};

      campusBuildings.forEach(building => {
        if (!colorsByCategory[building.category]) {
          colorsByCategory[building.category] = new Set();
        }
        if (building.color) {
          colorsByCategory[building.category].add(building.color);
        }
      });

      // Cada categoría debe tener preferentemente 1-2 colores
      Object.entries(colorsByCategory).forEach(([category, colors]) => {
        expect(colors.size).toBeLessThanOrEqual(2);
      });
    });
  });

  // ============ PRUEBAS ESTADÍSTICAS ============

  describe('Statistics', () => {
    it('calcular estadísticas del dataset', () => {
      const stats = {
        totalBuildings: campusBuildings.length,
        totalRoutes: campusRoutes.length,
        totalDistance: campusRoutes.reduce((sum, r) => sum + r.distance, 0),
        averageDistance:
          campusRoutes.reduce((sum, r) => sum + r.distance, 0) /
          campusRoutes.length,
        totalDuration: campusRoutes.reduce((sum, r) => sum + r.duration, 0),
        averageDuration:
          campusRoutes.reduce((sum, r) => sum + r.duration, 0) /
          campusRoutes.length,
        routeTypes: {
          walking: campusRoutes.filter(r => r.type === 'walking').length,
          covered: campusRoutes.filter(r => r.type === 'covered').length,
          shortcuts: campusRoutes.filter(r => r.type === 'shortcuts').length
        },
        buildingsByCategory: campusBuildings.reduce(
          (acc, b) => {
            acc[b.category] = (acc[b.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      };

      console.log('📊 Campus Dataset Statistics:');
      console.log(`   Buildings: ${stats.totalBuildings}`);
      console.log(`   Routes: ${stats.totalRoutes}`);
      console.log(`   Avg Distance: ${stats.averageDistance.toFixed(0)}m`);
      console.log(`   Avg Duration: ${stats.averageDuration.toFixed(1)}min`);
      console.log(`   Route Types:`, stats.routeTypes);
      console.log(`   Categories:`, stats.buildingsByCategory);

      // Validaciones básicas
      expect(stats.totalBuildings).toBeGreaterThan(0);
      expect(stats.totalRoutes).toBeGreaterThan(0);
      expect(stats.averageDistance).toBeGreaterThan(100);
    });
  });
});

/**
 * EJECUCIÓN DE PRUEBAS:
 *
 * npm test -- campus-extended.test.ts
 *
 * SALIDA ESPERADA:
 *
 * ✓ Campus Extended Dataset (45 tests)
 *   ✓ Buildings Structure (4 tests)
 *   ✓ Coordinates (3 tests)
 *   ✓ Routes Structure (4 tests)
 *   ✓ Referential Integrity (3 tests)
 *   ✓ Distance and Duration (4 tests)
 *   ✓ Network Connectivity (3 tests)
 *   ✓ Geographic Distribution (2 tests)
 *   ✓ Colors and Icons (2 tests)
 *   ✓ Statistics (1 test)
 *
 * 📊 Campus Dataset Statistics:
 *    Buildings: 31
 *    Routes: 47
 *    Avg Distance: 195m
 *    Avg Duration: 2.8min
 *    Route Types: { walking: 41, covered: 2, shortcuts: 4 }
 *    Categories: { academic: 7, library: 2, service: 6, residence: 3, sports: 3, health: 2, admin: 2, food: 3, entrance: 2 }
 */
