# Campus Dataset - Documentación Técnica

## Resumen Ejecutivo

Dataset completo de campus universitario **FICTICIO pero realista** con:
- **31 edificios** organizados en 8 categorías funcionales
- **47 rutas** (aristas) con distancias y duración estimada
- **Coordenadas normalizadas** a rango [0, 1000] para fácil visualización
- **Estructura geográfica coherente** inspirada en campus reales

## Arquitectura del Campus

### Distribución por Zonas

**Zona Norte (850-1000 latitud)**
- RES-A01, RES-B01, RES-C01: Residencias estudiantiles

**Zona Noreste (600-800 latitud, 800-1000 longitud)**
- GYM-001, AUD-DEP-001, PSC-001: Instalaciones deportivas

**Zona Centro-Este (400-800 latitud, 200-650 longitud)**
- ACA-A01 a ACA-G01: Edificios académicos (7 facultades)

**Zona Centro (350-600 latitud, 350-650 longitud) ⭐ CORAZÓN**
- PLZ-001: Plaza Central (HUB principal con 10 conexiones)
- LIB-001, LIB-002: Biblioteca y recursos
- SRV-CAF-001, SRV-CAF-002: Cafeterías
- ENT-001: Entrada principal

**Zona Oeste (200-400 latitud, 200-600 longitud)**
- LAB-COMP-001, LAB-COMP-002: Laboratorios de computación
- LAB-CHEM-001, LAB-PHYS-001: Laboratorios especializados

**Zona Sur (0-350 latitud, 200-900 longitud)**
- ADM-001, SRV-SEC-001: Administración central
- HSP-001, HSP-002: Salud y bienestar
- SRV-COM-001: Comedor universitario
- PAR-001: Estacionamiento
- ENT-002: Entrada secundaria
- MAT-001: Centro de mantenimiento

## Categorías de Edificios

| Categoría | Cantidad | Prefijo | Color | Icono |
|-----------|----------|---------|-------|-------|
| Academic | 7 | ACA-* | #3b82f6 | ⚙️📖🔬💼⚖️🩺🎨 |
| Library | 2 | LIB-* | #06b6d4 | 📚💾 |
| Service | 4 | LAB-*, MAT-* | #ec4899 | 💻⌨️🧪⚛️ |
| Residence | 3 | RES-* | #a855f7 | 🏠🏢🏛️ |
| Sports | 3 | GYM-*, AUD-*, PSC-* | #06b6d4 | 💪⚽🏊 |
| Health | 2 | HSP-* | #ef4444 | ⚕️🧠 |
| Admin | 2 | ADM-*, SRV-SEC-* | #8b5cf6 | 🏛️📋 |
| Food | 3 | SRV-CAF-*, SRV-COM-* | #f59e0b | ☕🍜🍽️ |
| Entrance | 2 | ENT-* | #64748b | 🚪🚗 |

## Estadísticas de Rutas

### Distribución por Tipo
- **Walking**: 41 rutas (87%) - Caminos peatonales principales
- **Covered**: 2 rutas (4%) - Pasajes techados (para lluvia)
- **Shortcuts**: 4 rutas (9%) - Atajos entre zonas

### Métricas de Distancia
- **Rango**: 50-500 metros
- **Media**: ~200 metros
- **Duración promedio**: 2-3 minutos
- **Velocidad estimada**: 1.5 m/s (5.4 km/h, paso normal)

### Nodos HUB (Puntos Centrales)
1. **PLZ-001** (Plaza Central): 10 conexiones ⭐⭐⭐⭐⭐
2. **LIB-001** (Biblioteca Central): 6 conexiones ⭐⭐⭐⭐
3. **ACA-A01** (Ing. - Edificio A): 6 conexiones ⭐⭐⭐⭐
4. **RES-B01** (Residencia B): 5 conexiones ⭐⭐⭐
5. **ADM-001** (Administración): 4 conexiones ⭐⭐

## Flujos de Navegación Típicos

### Estudiante Nuevo (Primer Día)
```
Entrada (ENT-001)
  → Plaza Central (PLZ-001) [5 min]
  → Biblioteca (LIB-001) [1 min]
  → Clase en Edificio A (ACA-A01) [3 min]
  → Cafetería (SRV-CAF-001) [2 min]
```

### Residente Estudiantil
```
Mañana:
  Residencia (RES-B01) → Clase (ACA-A01) [5 min]
  Clase → Almuerzo (SRV-COM-001) [2 min]
Tarde:
  Residencia → Gimnasio (GYM-001) [3 min]
Noche:
  Comedor (SRV-COM-001) → Residencia [2 min]
```

### Administración
```
Entrada → Oficinas Admin (ADM-001) [6 min]
  → Secretaría (SRV-SEC-001) [1 min]
  → Rectoría → Plaza [4 min]
```

### Acceso a Laboratorios
```
Facultad Ingeniería (ACA-A01) → Lab Comp-1 (LAB-COMP-001) [4 min]
Facultad Ciencias (ACA-C01) → Lab Química (LAB-CHEM-001) [4 min]
                            → Lab Física (LAB-PHYS-001) [4 min]
```

## Validaciones Confirmadas ✅

### Integridad de Datos
- ✅ Todos los `from_id` y `to_id` existen en buildings
- ✅ 0 rutas duplicadas o inversas conflictivas
- ✅ 0 referencias inválidas

### Rango de Valores
- ✅ Latitud: [0, 1000]
- ✅ Longitud: [0, 1000]
- ✅ Distancia: [50, 500] metros
- ✅ Duración: [1, 7] minutos

### Cobertura y Conectividad
- ✅ 31 edificios totales
- ✅ 47 rutas totales
- ✅ Cada edificio principal tiene ≥3 conexiones
- ✅ 0 edificios aislados

## Cálculo de Velocidad

La velocidad estimada se calcula usando:
```
Velocidad = Distancia / Duración
Ej: 280m / 4min = 70m/min = 1.17 m/s
```

Velocidad humana promedio:
- Caminata lenta: 1.0 m/s (3.6 km/h)
- Caminata normal: 1.4-1.5 m/s (5-5.5 km/h) ← Usado aquí
- Caminata rápida: 2.0 m/s (7.2 km/h)

## Estructura de Datos TypeScript

### Building Interface
```typescript
interface Building {
  id: string;              // ej: "LIB-001"
  name: string;            // ej: "Biblioteca Central"
  description: string;     // Funciones, servicios, horarios
  category: 'academic' | 'library' | 'service' | 'residence' | 'sports' | 'health' | 'admin' | 'food' | 'entrance';
  latitude: number;        // [0, 1000]
  longitude: number;       // [0, 1000]
  color?: string;          // Hex color para visualización
  icon?: string;           // Emoji o identificador
}
```

### Route Interface
```typescript
interface Route {
  id: string;              // ej: "route-001"
  from_id: string;         // Building.id
  to_id: string;           // Building.id
  distance: number;        // Metros
  type: 'walking' | 'covered' | 'shortcuts';
  duration: number;        // Minutos
  waypoints?: [number, number][]; // [lat, lon] puntos intermedios
}
```

## Uso en Frontend

### Importar Dataset
```typescript
import { campusBuildings, campusRoutes, Building, Route } from '@/data/campus-extended';
```

### Renderizar en Mapa 2D
```typescript
// Edificios como nodos
campusBuildings.forEach(building => {
  drawNode({
    x: building.longitude,
    y: building.latitude,
    radius: 8,
    fill: building.color,
    label: building.icon
  });
});

// Rutas como conexiones
campusRoutes.forEach(route => {
  const from = campusBuildings.find(b => b.id === route.from_id);
  const to = campusBuildings.find(b => b.id === route.to_id);
  
  drawLine(
    from.longitude, from.latitude,
    to.longitude, to.latitude,
    { stroke: getRouteColor(route.type), width: 2 }
  );
});
```

### Buscar Camino Más Corto
```typescript
import { dijkstra } from '@/utils/pathfinding';

const shortestPath = dijkstra(
  campusBuildings,
  campusRoutes,
  'ACA-A01',     // origen
  'LIB-001'      // destino
);

// Resultado: {
//   path: ['ACA-A01', 'PLZ-001', 'LIB-001'],
//   distance: 260,
//   duration: 4
// }
```

### Buscar Edificios por Categoría
```typescript
const academicBuildings = campusBuildings.filter(b => b.category === 'academic');
const residences = campusBuildings.filter(b => b.category === 'residence');
```

### Obtener Rutas desde un Edificio
```typescript
const routesFromLib = campusRoutes.filter(r => r.from_id === 'LIB-001');
const routesToLib = campusRoutes.filter(r => r.to_id === 'LIB-001');
const allConnections = [...routesFromLib, ...routesToLib];
```

## Extensiones Futuras Recomendadas

### Corto Plazo
1. **Horarios**: Agregar `opens_at`, `closes_at` a Building
2. **Accesibilidad**: Campos para discapacitados, elevadores, rampas
3. **Capacidad**: `capacity` para aulas y comedores

### Mediano Plazo
4. **Eventos**: Array de eventos por edificio
5. **Transporte**: Rutas de autobús, bicicleta
6. **POIs**: Puntos de interés dentro de edificios (aulas, oficinas)

### Largo Plazo (RAG)
7. **Descripciones RAG**: Detalles desde Supabase con LangChain
8. **Horarios Dinámicos**: Actualización en tiempo real
9. **Avisos de Acceso**: Cierre de edificios, eventos especiales
10. **Rutas Inteligentes**: Evitar zonas cerradas, edificios congestionados

## Notas de Diseño

### Decisiones Geográficas
- **Plaza Central como HUB**: Ubicada centralmente para máxima accesibilidad
- **Residencias al Norte**: Zona apartada pero conectada
- **Deportes al Noreste**: Cerca de residencias, acceso alternativo
- **Administración al Sur**: Centro de operaciones separado
- **Laboratorios al Oeste**: Aislados pero bien conectados

### Decisiones de Conectividad
- Cada edificio principal tiene ≥3 conexiones
- Plaza Central conecta la mayoría de destinos en <5 minutos
- Rutas cubiertas en zonas académicas densas
- Atajos entre zonas para rutas alternativas

## Créditos y Referencias

Dataset generado para: **Virtual University Concierge**
- Hackathon: EPAM 2026 (Challenge 3)
- Objetivo: Ayudar a estudiantes de primer semestre a navegar el campus
- Inspiración: Campus reales (Stanford, MIT, Berkeley, UNAM, etc.)

---

**Última actualización**: May 2026
**Version**: 1.0 (Inicial)
**Estado**: Pronto para producción
