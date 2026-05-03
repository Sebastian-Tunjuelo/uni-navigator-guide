# Tareas Mapa 2D - Virtual University Concierge

## Objetivo

Implementar un mapa interactivo 2D del campus universitario mostrando edificios como nodos y caminos/rutas como aristas, con capacidad de búsqueda, navegación y overlay de imagen del campus.

---

## FASE 1: Diseño y Estructuras de Datos

### Tarea 1.1: Definir estructura de datos del campus

- [ ] Crear tipos TypeScript para:

  ```typescript
  interface Building {
    id: string;
    name: string;
    description: string;
    category: "academic" | "service" | "residence" | "sport";
    latitude: number; // coordenadas relativas al mapa (0-1000px)
    longitude: number;
    icon?: string;
    color?: string; // color del nodo
    floor?: number;
  }

  interface Route {
    id: string;
    from_id: string; // building id
    to_id: string;
    distance: number; // metros
    type: "walking" | "shuttle" | "recommended";
    duration: number; // minutos
    waypoints?: [number, number][]; // puntos intermedios
  }

  interface MapNode {
    id: string;
    x: number; // píxeles en canvas
    y: number;
    radius: number; // tamaño del nodo
    data: Building;
  }

  interface MapEdge {
    source: MapNode;
    target: MapNode;
    data: Route;
  }
  ```

### Tarea 1.2: Crear archivo seed de campus

- [ ] Crear `src/data/campus-data.ts` con:
  - Array de 20-30 edificios
  - Array de rutas entre edificios
  - Coordenadas realistas (o normalizadas 0-1000)
- [ ] Ejemplo:

  ```typescript
  export const campusBuildings: Building[] = [
    {
      id: "lib-001",
      name: "Biblioteca Central",
      description: "Edificio principal con 5 pisos de libros",
      category: "service",
      latitude: 250,
      longitude: 300,
      color: "#3b82f6",
    },
    // ... más edificios
  ];

  export const campusRoutes: Route[] = [
    {
      id: "route-001",
      from_id: "lib-001",
      to_id: "aca-001",
      distance: 150,
      duration: 3,
    },
    // ... más rutas
  ];
  ```

### Tarea 1.3: Preparar imagen del campus

- [ ] Obtener/crear imagen del campus (plano 2D)
- [ ] Guardar en `public/campus-map.png`
- [ ] Redimensionar a 1000x1000px (o similar)
- [ ] Anotar coordenadas de edificios sobre la imagen

---

## FASE 2: Componente React del Mapa

### Tarea 2.1: Crear componente principal `CampusMap`

- [ ] Crear `src/components/CampusMap.tsx`:
  - Canvas o SVG para renderizar
  - Props: buildings, routes, selectedBuilding, onBuildingSelect
  - Estado local: zoom, pan, hovered node

**Estructura base:**

```typescript
interface CampusMapProps {
  buildings: Building[];
  routes: Route[];
  selectedBuilding?: string;
  onBuildingSelect?: (buildingId: string) => void;
  centerCoords?: [number, number];
}

export function CampusMap({
  buildings,
  routes,
  selectedBuilding,
  onBuildingSelect
}: CampusMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (canvasRef.current) {
      drawMap();
    }
  }, [zoom, pan, buildings, routes]);

  const drawMap = () => {
    // Renderizar fondo + nodos + aristas
  };

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={1000}
      onWheel={handleZoom}
      onMouseDown={handlePan}
    />
  );
}
```

### Tarea 2.2: Renderizar imagen de fondo

- [ ] En canvas, dibujar imagen del campus
- [ ] Usar `drawImage()` de canvas
- [ ] Aplicar transformaciones (zoom/pan)

**Pseudocódigo:**

```typescript
const drawMap = () => {
  const ctx = canvasRef.current?.getContext("2d");
  if (!ctx) return;

  // Limpiar canvas
  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

  // Aplicar transformaciones
  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.scale(zoom, zoom);

  // Dibujar imagen de fondo
  if (mapImage) {
    ctx.drawImage(mapImage, 0, 0);
  }

  // Dibujar aristas (rutas)
  drawRoutes(ctx);

  // Dibujar nodos (edificios)
  drawBuildings(ctx);

  ctx.restore();
};
```

### Tarea 2.3: Renderizar aristas (rutas)

- [ ] Dibujar líneas entre nodos
- [ ] Color según tipo de ruta (walking, shuttle, etc.)
- [ ] Espesor según importancia
- [ ] Opcional: mostrar distancia en la línea

**Pseudocódigo:**

```typescript
const drawRoutes = (ctx: CanvasRenderingContext2D) => {
  routes.forEach((route) => {
    const fromNode = nodes[route.from_id];
    const toNode = nodes[route.to_id];

    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.strokeStyle = getRouteColor(route.type);
    ctx.lineWidth = 2;
    ctx.stroke();
  });
};
```

### Tarea 2.4: Renderizar nodos (edificios)

- [ ] Dibujar círculos para edificios
- [ ] Color según categoría
- [ ] Tamaño dinámico si es seleccionado
- [ ] Icono o letra identificadora
- [ ] Hover effect

**Pseudocódigo:**

```typescript
const drawBuildings = (ctx: CanvasRenderingContext2D) => {
  buildings.forEach((building) => {
    const node = nodes[building.id];
    const isSelected = selectedBuilding === building.id;
    const radius = isSelected ? 20 : 15;

    // Sombra
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + 2, 0, Math.PI * 2);
    ctx.fill();

    // Círculo principal
    ctx.fillStyle = building.color || "#3b82f6";
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Borde si está seleccionado
    if (isSelected) {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
};
```

---

## FASE 3: Interactividad del Mapa

### Tarea 3.1: Click en nodos

- [ ] Detectar click en nodo
- [ ] Resaltar nodo seleccionado
- [ ] Mostrar información en sidebar
- [ ] Callback `onBuildingSelect`

**Pseudocódigo:**

```typescript
const handleCanvasClick = (e: React.MouseEvent) => {
  const rect = canvasRef.current?.getBoundingClientRect();
  const x = (e.clientX - rect!.left - pan.x) / zoom;
  const y = (e.clientY - rect!.top - pan.y) / zoom;

  // Verificar si clickeó en algún nodo
  buildings.forEach((building) => {
    const node = nodes[building.id];
    const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
    if (dist <= node.radius) {
      onBuildingSelect?.(building.id);
    }
  });
};
```

### Tarea 3.2: Hover en nodos

- [ ] Mostrar tooltip con nombre del edificio
- [ ] Cambiar cursor a pointer
- [ ] Highlight suave del nodo

### Tarea 3.3: Zoom y Pan

- [ ] Rueda del mouse para zoom
- [ ] Drag para pan/movimiento
- [ ] Límites de zoom (0.5x - 3x)
- [ ] Animación suave (opcional)

**Pseudocódigo:**

```typescript
const handleWheel = (e: React.WheelEvent) => {
  e.preventDefault();
  const newZoom = Math.max(0.5, Math.min(3, zoom - e.deltaY * 0.001));
  setZoom(newZoom);
};

const handleMouseDown = (e: React.MouseEvent) => {
  const startX = e.clientX - pan.x;
  const startY = e.clientY - pan.y;

  const handleMouseMove = (moveE: MouseEvent) => {
    setPan({
      x: moveE.clientX - startX,
      y: moveE.clientY - startY,
    });
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", handleMouseMove);
  });
};
```

### Tarea 3.4: Búsqueda de edificios

- [ ] Input de búsqueda
- [ ] Filter por nombre/descripción
- [ ] Auto-centra mapa en resultado
- [ ] Destaca resultado

---

## FASE 4: Rutas y Navegación

### Tarea 4.1: Componente `RouteFinder`

- [ ] Input: "Desde" y "Hacia" (building selects)
- [ ] Botón calcular ruta
- [ ] Mostrar ruta en mapa (resaltar nodos + aristas)
- [ ] Mostrar distancia total y duración

**Pseudocódigo:**

```typescript
const handleFindRoute = async (fromId: string, toId: string) => {
  const response = await fetch(`/api/campus/routes/${fromId}/${toId}`);
  const route = await response.json();

  setSelectedRoute({
    path: route.waypoints,
    distance: route.distance,
    duration: route.duration,
  });
};
```

### Tarea 4.2: Renderizar ruta calculada

- [ ] Dibujar línea destacada en mapa
- [ ] Color diferenciado (e.g., amarillo)
- [ ] Mostrar números de pasos
- [ ] Animación opcional (seguimiento)

### Tarea 4.3: Dirección paso a paso

- [ ] Mostrar lista de pasos (giro a izquierda en edificio X, etc.)
- [ ] Highlight del siguiente paso
- [ ] Modo "siguiendo" (centra mapa en usuario)

---

## FASE 5: Sidebar de Información

### Tarea 5.1: Crear componente `BuildingInfo`

- [ ] Props: building info, route info
- [ ] Mostrar cuando hay nodo seleccionado:
  - Nombre del edificio
  - Descripción
  - Categoría
  - Horario/servicios
  - Botón "navegar aquí"
- [ ] Mostrar cuando hay ruta:
  - Distancia total
  - Tiempo estimado
  - Pasos de navegación

**Estructura:**

```typescript
<div className="sidebar">
  {selectedBuilding && <BuildingCard building={selectedBuilding} />}
  {selectedRoute && <RouteInfo route={selectedRoute} />}
</div>
```

### Tarea 5.2: Favoritos/Bookmarks

- [ ] Botón "guardar favorito"
- [ ] Agregar a lista de favoritos del usuario
- [ ] Mostrar acceso rápido a favoritos
- [ ] API: POST `/api/campus/bookmark`

---

## FASE 6: Estilos y UX

### Tarea 6.1: Usar shadcn + Tailwind

- [ ] Integrar con componentes shadcn:
  - Input para búsqueda
  - Select para edificios
  - Button para acciones
  - Card para información
- [ ] Paleta de colores consistente

### Tarea 6.2: Responsive design

- [ ] Mapa responsive en mobile
- [ ] Sidebar colapsable en pantallas pequeñas
- [ ] Touch events para mapa en mobile

### Tarea 6.3: Dark mode

- [ ] Adaptación de colores a dark mode
- [ ] Contraste suficiente en canvas

---

## FASE 7: Optimizaciones

### Tarea 7.1: Rendimiento del canvas

- [ ] Caché de imágenes
- [ ] Redraw inteligente (solo cambios)
- [ ] RequestAnimationFrame para animaciones
- [ ] Lazy loading de ruta

### Tarea 7.2: Funciones avanzadas (opcional)

- [ ] Búsqueda de edificios cercanos (geolocalización)
- [ ] Vista satelital/3D (futuro)
- [ ] Planificación de clase a clase (cronograma)
- [ ] Compartir ruta (link/QR)

### Tarea 7.3: Accesibilidad

- [ ] Descripciones ARIA
- [ ] Navegación por teclado
- [ ] Alto contraste

---

## FASE 8: Testing

### Tarea 8.1: Unit tests

- [ ] Test cálculo de rutas
- [ ] Test detección de clicks en nodos
- [ ] Test rendering de componentes

### Tarea 8.2: E2E tests

- [ ] Test flujo completo: buscar edificio → ver ruta → navegar

---

## Arquitectura Final Recomendada

```
src/components/
├── CampusMap.tsx              # Canvas principal
├── BuildingInfo.tsx           # Sidebar con info
├── RouteFinder.tsx            # Búsqueda de rutas
├── SearchBar.tsx              # Input búsqueda
└── MapLegend.tsx              # Leyenda colores

src/hooks/
├── useCampusMap.ts            # Lógica del mapa
├── useMapZoom.ts              # Zoom/Pan
└── useRouteCalculation.ts     # Cálculo de rutas

src/utils/
├── canvas-utils.ts            # Funciones de dibujo
├── geometry.ts                # Cálculos distancia/puntos
└── campus-helpers.ts          # Lógica específica campus

src/data/
├── campus-extended.ts         # Edificios y rutas de respaldo
└── colors.ts                  # Paleta de colores

src/types/
├── campus.ts                  # Interfaces Building, Route, etc.
```

---

## Skills a Usar

1. **d3-viz** (davila7/claude-code-templates@d3-viz)
   - Para alternativa D3.js en lugar de canvas puro

2. **antv-g6-graph** (antvis/chart-visualization-skills@antv-g6-graph)
   - Para grafo interactivo avanzado si canvas es limitado

3. **frontend-design** (anthropics/skills@frontend-design)
   - Para patrones de diseño y UX

---

## Checklist de Finalización

- [ ] Estructura de datos definida (Building, Route, MapNode, MapEdge)
- [ ] Datos del campus creados (20-30 edificios, rutas)
- [ ] Imagen del campus lista
- [ ] Canvas renderiza imagen de fondo
- [ ] Nodos y aristas dibujados correctamente
- [ ] Click en nodos funciona
- [ ] Zoom y pan funcionan
- [ ] Búsqueda de edificios funciona
- [ ] Cálculo de rutas funciona
- [ ] Ruta resaltada en mapa
- [ ] Sidebar muestra información
- [ ] Favoritos guardan y cargan
- [ ] Responsive en mobile
- [ ] Dark mode funciona
- [ ] Tests pasando
- [ ] Integrado con backend (`/api/campus/*`) cuando la semilla esté disponible

---

## Referencia Técnica - Canvas Drawing

```typescript
// Contexto 2D del canvas
const ctx = canvas.getContext("2d");

// Dibujar línea
ctx.beginPath();
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.strokeStyle = "#000";
ctx.lineWidth = 2;
ctx.stroke();

// Dibujar círculo
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fillStyle = "#3b82f6";
ctx.fill();

// Dibujar texto
ctx.fillStyle = "#000";
ctx.font = "12px Arial";
ctx.fillText("Edificio", x, y);

// Transformaciones
ctx.translate(x, y); // Mover origen
ctx.scale(zoom, zoom); // Escalar
ctx.rotate(angle); // Rotar
```
