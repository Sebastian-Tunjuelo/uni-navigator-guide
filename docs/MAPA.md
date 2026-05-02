# Mapa Interactivo del Campus — Documentación

Documentación técnica del mapa 2D interactivo del campus universitario.

---

## Visión General

El mapa es un canvas HTML5 que renderiza la imagen real del campus (`mapa-poblado.jpg`) con nodos interactivos superpuestos para cada edificio, y líneas de ruta para la navegación. Implementa el algoritmo de Dijkstra para calcular el camino más corto entre dos puntos.

---

## Arquitectura de Componentes

```
Mapa.tsx (página)
├── SearchBar          — Filtro de edificios por nombre
├── RouteFinder        — Selector de origen y destino
├── CampusMap          — Canvas 2D con la imagen y los nodos
└── BuildingInfo       — Panel de información del edificio seleccionado
```

---

## Componentes

### `CampusMap.tsx`
**Ruta:** `src/components/CampusMap.tsx`

El componente principal. Usa un `<canvas>` HTML5 para renderizar todo.

**Props:**
```typescript
interface CampusMapProps {
  buildings: Building[];        // Lista de edificios a mostrar
  routes: Route[];              // Conexiones entre edificios
  selectedBuilding?: string;    // ID del edificio seleccionado
  selectedRoute?: string[];     // Array de IDs que forman la ruta activa
  onBuildingSelect?: (id: string) => void;
  centerCoords?: [number, number];
}
```

**Capas de renderizado (en orden):**
1. `drawBackground()` — Imagen `mapa-poblado.jpg` o fondo gris si no carga
2. `drawRoutes()` — Líneas grises entre edificios conectados
3. `drawBuildings()` — Nodos circulares con sombra, color, nombre e ícono
4. `drawSelectedRoute()` — Línea azul gruesa sobre la ruta activa

**Interacciones:**
- **Click** → selecciona el edificio más cercano al cursor (radio + 4px de tolerancia)
- **Hover** → resalta el nodo y muestra tooltip con nombre completo
- **Drag** → pan del mapa (arrastra para mover la vista)
- **Botón Calibrar** → modo de calibración que muestra coordenadas normalizadas al hacer hover/click

**Sistema de coordenadas:**
Los edificios usan coordenadas normalizadas `[0, 1]` almacenadas en `latitude` y `longitude`:
```typescript
// Conversión a píxeles del canvas:
x = building.latitude * mapSize.width
y = building.longitude * mapSize.height
```
Esto hace que las posiciones sean independientes del tamaño del canvas.

### `BuildingInfo.tsx`
**Ruta:** `src/components/BuildingInfo.tsx`

Panel que muestra información del edificio seleccionado con botón "Navegar hasta aquí".

### `RouteFinder.tsx`
**Ruta:** `src/components/RouteFinder.tsx`

Selectores de origen y destino con botón "Trazar ruta".

### `SearchBar.tsx`
**Ruta:** `src/components/SearchBar.tsx`

Input de búsqueda que filtra `campusBuildings` por `name` o `shortName`.

---

## Datos del Campus

### Tipos
**Archivo:** `src/types/campus.ts`

```typescript
interface Building {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  latitude: number;    // Coordenada X normalizada [0, 1]
  longitude: number;   // Coordenada Y normalizada [0, 1]
  color?: string;      // Color del nodo (hex)
  icon?: string;       // Emoji del edificio
  category?: string;
}

interface Route {
  id: string;
  from_id: string;
  to_id: string;
  distance?: number;
  type?: 'covered' | 'open' | 'shortcuts';
}
```

### Dataset Principal
**Archivo:** `src/data/campus-extended.ts`

Contiene `campusBuildings` (array de `Building`) y `campusRoutes` (array de `Route`).

Las coordenadas fueron calibradas usando el modo de calibración del mapa sobre la imagen `mapa-poblado.jpg`.

### Dataset Alternativo (SVG simple)
**Archivo:** `src/data/campus.ts`

Dataset más simple con coordenadas en un viewBox de 400×500. Incluye su propio algoritmo Dijkstra. Usado para prototipado inicial.

---

## Algoritmo de Rutas (Dijkstra)

**Archivo:** `src/utils/campus-helpers.ts`

```typescript
findRoute(
  buildings: Building[],
  routes: Route[],
  originId: string,
  destinationId: string
): string[]
```

**Implementación:**
1. Construye grafo de adyacencia desde `routes`
2. El costo de cada arista es la distancia euclidiana entre los nodos
3. Dijkstra con cola de prioridad simple (array ordenado)
4. Retorna array de IDs en orden: `[origen, ...intermedios, destino]`

**Funciones auxiliares:**
```typescript
getRouteLength(buildings, route, routes): number
// Suma las distancias entre nodos consecutivos de la ruta
// Escala: 1 unidad de coordenada normalizada ≈ metros reales

estimateWalkingTime(meters: number): number
// 80 m/min caminando relajado → Math.max(1, Math.round(meters / 80))
```

---

## Página `Mapa.tsx`

**Ruta:** `src/pages/Mapa.tsx`

Orquesta todos los componentes. Estado principal:

```typescript
const [origin, setOrigin] = useState<string>("ENT-001");  // Entrada principal
const [dest, setDest] = useState<string>(params.get("to") || "P31");
const [route, setRoute] = useState<string[]>([]);
const [selectedBuilding, setSelectedBuilding] = useState<string | undefined>();
const [search, setSearch] = useState("");
```

**Integración con URL:**
```
/mapa?to=BIBLIOTECA-001
```
Si hay parámetro `to` en la URL, calcula automáticamente la ruta desde la entrada principal al destino. Esto permite que el chatbot UniBot redirija al mapa con una ruta pre-calculada.

**Panel de ruta activa:**
Cuando hay una ruta calculada, muestra:
- Nombre origen → destino
- Distancia en metros
- Tiempo estimado en minutos
- Lista de pasos numerados (Sal de X → Cruza por Y → Llega a Z)

---

## Imagen de Fondo

**Archivo:** `public/mapa-poblado.jpg`

La imagen del campus real. El canvas se redimensiona automáticamente a las dimensiones naturales de la imagen (`image.naturalWidth × image.naturalHeight`).

Si la imagen no carga, el canvas muestra un fondo gris claro (`#f8fafc`).

---

## Modo de Calibración

El botón "Calibrar" en la esquina superior derecha del mapa activa el modo de calibración:

1. Al hacer hover o click sobre el canvas, muestra las coordenadas normalizadas `x:[0-1] y:[0-1]`
2. Estas coordenadas se usan para posicionar nuevos edificios en `campus-extended.ts`

**Proceso para agregar un edificio:**
1. Activar modo calibración
2. Hacer hover sobre la ubicación del edificio en la imagen
3. Anotar las coordenadas `x` e `y`
4. Agregar el edificio a `campusBuildings` en `campus-extended.ts`:
```typescript
{
  id: "NUEVO-001",
  name: "Nombre Completo del Edificio",
  shortName: "Nombre Corto",
  latitude: 0.xxx,   // coordenada x del calibrador
  longitude: 0.yyy,  // coordenada y del calibrador
  color: "#3b82f6",
  icon: "🏛️",
  category: "academico",
}
```
5. Agregar las rutas (conexiones) en `campusRoutes`

---

## Tipos de Rutas

| Tipo | Visualización | Uso |
|---|---|---|
| `covered` | Línea sólida gruesa (3px) | Pasillos techados |
| `open` | Línea sólida delgada (2px) | Caminos al aire libre |
| `shortcuts` | Línea punteada (6px, 6px gap) | Atajos o rutas secundarias |

---

## Integración con el Chatbot

UniBot puede redirigir al mapa con una ruta pre-calculada:

```typescript
// En BotChat.tsx o en la respuesta del backend:
navigate(`/mapa?to=${buildingId}`);
```

El parámetro `to` acepta cualquier `id` de `campusBuildings`. Si el ID no existe, la ruta queda vacía sin error.

---

## Rendimiento

- El canvas se re-renderiza en cada cambio de estado (nodos, rutas, hover, pan)
- `useMemo` en `nodes` evita recalcular posiciones si `buildings` no cambia
- La imagen de fondo se carga una sola vez en `useEffect` y se cachea en `backgroundRef`
- No hay animaciones de transición (el render es síncrono y rápido)

Para datasets grandes (>100 edificios), considerar:
- Usar `requestAnimationFrame` para el render
- Implementar culling (no dibujar nodos fuera del viewport)
- Agregar zoom con wheel event

---

## Extensiones Futuras

| Feature | Descripción | Complejidad |
|---|---|---|
| Zoom con scroll | `wheel` event + escala del canvas | Baja |
| Geolocalización | `navigator.geolocation` → nodo "Tú estás aquí" | Media |
| Rutas en tiempo real | WebSocket con posición de otros estudiantes | Alta |
| Filtro por categoría | Mostrar solo edificios académicos, servicios, etc. | Baja |
| Animación de ruta | Punto que recorre la ruta animado | Media |
| Touch/mobile | `touchstart`, `touchmove` para pan en móvil | Media |
