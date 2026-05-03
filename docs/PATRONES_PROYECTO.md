# PATRONES DEL PROYECTO UNINAVIGATOR

**Fecha:** 1 de mayo de 2026 | **Stack:** Vite + React + TypeScript + Tailwind + shadcn/ui

---

## 1. COMPONENTES SHADCN/UI (49 total)

Instalados: Button, Card, Select, Input, Label, Badge, Alert, Toast, Sidebar, Sheet, BottomNav (custom)

**CVA Pattern:** Todos usan variantes predefinidas

```
variant: { default, destructive, outline, secondary, ghost, link }
size: { default, sm, lg, icon }
```

---

## 2. PALETA DE COLORES (HSL)

PRIMARIOS:

- --primary: 222 83% 55% (Azul)
- --primary-soft: 222 83% 96% (Azul claro)

SECUNDARIOS:

- --secondary: 220 15% 96% (Gris claro)
- --background: 0 0% 100% (Blanco)
- --muted: 220 15% 96% (Gris claro)

SEMANTICOS:

- --success: 152 60% 42% (Verde)
- --warning: 38 92% 50% (Naranja)
- --destructive: 0 75% 55% (Rojo)

SOMBRAS: shadow-soft, shadow-card, shadow-elevated

GRADIENTES: gradient-primary, gradient-card

---

## 3. ESTRUCTURA Y CONVENCIONES

Carpetas:

- src/components/ui/ (shadcn - NO EDITAR)
- src/components/layout/ (PageHeader, MobileShell, BottomNav)
- src/pages/ (Home, Mapa, Carnet, Chats, Perfil, Login)
- src/lib/ (utils.ts, session.ts)
- src/data/ (mock.ts, campus-extended.ts)

Nombres:

- PascalCase: Componentes
- camelCase: Hooks
- kebab-case: Archivos

---

## 4. HOOKS Y ESTADO

React Hooks:

- useState: Estado local
- useEffect: Efectos (vacio = solo montar)
- useMemo: Memoizar calculos

React Router:

- useNavigate(): navigate(path)
- useLocation(): pathname
- useSearchParams(): params.get(key)

Session:

- getCurrentProfile()
- setCurrentProfile(id)

Campus Logic:

- findRoute(origin, dest): Dijkstra
- routeDistance(path): metros
- walkingTime(meters): minutos

---

## 5. RESPONSIVE DESIGN (440px max)

MobileShell:

- max-w-[440px] centrado
- bg-background adentro, bg-muted afuera
- main con pb-24

PageHeader:

- sticky top-0 z-20
- backdrop-blur-md
- Soporta: back, title, subtitle, action

BottomNav:

- fixed bottom-0, grid-cols-5
- pb-[env(safe-area-inset-bottom)]

Patrones:

- space-y-6: Espaciado vertical
- px-4 py-3: Padding
- gap-3: Horizontal spacing
- truncate / line-clamp-2: Texto
- overflow-x-auto scrollbar-hidden: Carrusel

---

## 6. ANIMACIONES

Keyframes:

- accordion-down: 0.2s
- accordion-up: 0.2s
- fade-in: 0.3s (opacity + slide)
- draw-route: 1.2s (SVG stroke)

Clases:

- animate-fade-in
- transition-colors, transition-all
- duration-300, ease-out
- hover:scale-105
- disabled:opacity-50

Utils:

- scrollbar-hidden
- label-eyebrow (etiqueta pequeña)

---

## CHECKLIST NUEVOS COMPONENTES

ESTRUCTURA:

- PascalCase.tsx
- Interface ComponentNameProps
- Export default

ESTILOS:

- className Tailwind
- cn() para condicionales
- Variables CSS index.css

HOOKS:

- useState, useEffect
- useNavigate/useSearchParams si necesita routing

SHADCN:

- Button, Card, Select, Input, Label
- Seguir patterns de variantes

RESPONSIVE:

- Mobile-first 440px
- truncate para textos
- gap-3, px-4, py-3

ANIMACIONES:

- animate-fade-in apariciones
- transition-colors cambios
- duration-300, ease-out timing

---

## EJEMPLO BASICO

```javascript
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MapBlock({ id, name, emoji, onClick }) {
  const [selected, setSelected] = useState(false);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all animate-fade-in",
        selected && "border-primary bg-primary-soft",
      )}
      onClick={() => {
        setSelected(!selected);
        onClick?.(id);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{id}</p>
          </div>
        </div>
        <Button className="w-full mt-3 rounded-xl">Seleccionar</Button>
      </CardContent>
    </Card>
  );
}
```

---

**Doc generada:** 1 mayo 2026 | **Proximos pasos:** Implementar mapa interactivo con estos patrones
