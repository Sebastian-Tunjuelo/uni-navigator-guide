## Objetivo

Cuando se trace una ruta en `src/pages/Mapa.tsx`, el mapa debe encogerse a una altura fija (~220px) y la tarjeta de ruta debe mostrarse **debajo** del mapa (no superpuesta), garantizando que ambos sean visibles sin scroll horizontal y sin recortar bloques.

## Cambios en `src/pages/Mapa.tsx`

### 1. Layout responsivo del contenedor principal
Reemplazar el layout actual de altura fija (`h-[calc(100vh-5.5rem)]`) por un layout en flujo vertical scrollable verticalmente:

- Contenedor padre: `flex flex-col` sin altura fija forzada.
- Selectores de origen/destino: se mantienen arriba.
- Sección del mapa: altura dinámica.
  - **Sin ruta trazada**: el mapa ocupa el espacio disponible (`flex-1`, mínimo ~360px) como ahora.
  - **Con ruta trazada**: el mapa pasa a `h-[220px]` fijo (en móvil) y `md:h-[260px]` (en pantallas más anchas dentro del shell de 440px sigue siendo 220px; el breakpoint md aplicará si en el futuro se ensancha).

### 2. SVG siempre completo
- El `<svg>` ya usa `viewBox="0 0 400 500"` con `preserveAspectRatio="xMidYMid meet"`, lo que garantiza que todos los bloques se vean sin recortes al reducir altura.
- Añadir `w-full h-full` y un wrapper con `overflow-hidden` para evitar cualquier scroll horizontal.

### 3. Tarjeta de ruta como bloque en flujo (no absoluto)
Quitar el posicionamiento `absolute inset-x-3 bottom-3 ... backdrop-blur-md` de la tarjeta de resumen y convertirla en una sección normal **debajo** del mapa:

- Contenedor: `mx-3 mt-3 mb-4 rounded-2xl border border-border bg-card p-4 shadow-card animate-fade-in`.
- Mantiene el encabezado "RUTA RECOMENDADA", chips de metros/minutos y la lista numerada de pasos.
- Al estar fuera del SVG, no tapa ningún bloque del mapa.

### 4. Scroll vertical natural
- Quitar `h-[calc(100vh-5.5rem)]` del root del componente para que la página fluya naturalmente dentro del `MobileShell` (que ya maneja `pb-24` para el bottom nav).
- Resultado: el usuario ve el mapa compacto arriba y, al hacer scroll si es necesario, ve la tarjeta de ruta completa debajo. En la mayoría de pantallas ambos caben sin scroll.

### 5. Estructura final (pseudo-layout)

```text
┌─ PageHeader ────────────────────┐
├─ Selectores (origen/destino) ───┤
├─ Mapa SVG                       │
│   • sin ruta: flex-1 (~h alto)  │
│   • con ruta: h-[220px]         │
├─ Tarjeta de ruta (solo si hay) ─┤
│   RUTA RECOMENDADA              │
│   Entrada → Biblioteca          │
│   [120 m] [2 min]               │
│   1. Sal de Entrada             │
│   2. Cruza por Cafetería        │
│   3. Llega a Biblioteca         │
└─────────────────────────────────┘
```

## Notas técnicas

- No se modifican `campus.ts`, datos ni el algoritmo de Dijkstra.
- No se requieren nuevos componentes ni dependencias.
- El layout sigue siendo mobile-first dentro del shell de 440px; sigue siendo accesible (selects de shadcn ya manejan teclado/aria).
- Animación existente `draw-route` se conserva.
