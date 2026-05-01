import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation, MapPin, Footprints, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { blocks, edges, findRoute, routeDistance, walkingTime, type CampusBlock } from "@/data/campus";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const typeColors: Record<CampusBlock["type"], string> = {
  academico: "fill-primary/15 stroke-primary/40",
  biblioteca: "fill-amber-200/60 stroke-amber-500/60",
  cafeteria: "fill-orange-200/60 stroke-orange-500/60",
  deportes: "fill-emerald-200/60 stroke-emerald-500/60",
  auditorio: "fill-purple-200/60 stroke-purple-500/60",
  entrada: "fill-slate-200 stroke-slate-400",
  plaza: "fill-emerald-100/70 stroke-emerald-400/50",
};

export default function Mapa() {
  const [params] = useSearchParams();
  const [origin, setOrigin] = useState<string>("ENT");
  const [dest, setDest] = useState<string>(params.get("to") || "D");
  const [route, setRoute] = useState<string[]>([]);

  // Auto-trace if destination came from URL
  useEffect(() => {
    if (params.get("to")) {
      const r = findRoute(origin, params.get("to")!);
      setRoute(r);
    }
  }, []); // eslint-disable-line

  const handleTrace = () => {
    const r = findRoute(origin, dest);
    setRoute(r);
  };

  const meters = useMemo(() => routeDistance(route), [route]);
  const minutes = walkingTime(meters);

  const nodeMap = new Map(blocks.map(b => [b.id, b]));
  const routePoints = route.map(id => nodeMap.get(id)!).filter(Boolean);
  const pathD = routePoints.length > 1
    ? routePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.nx} ${p.ny}`).join(" ")
    : "";

  const stepsText = routePoints.map((b, i) => {
    if (i === 0) return `Sal de ${b.shortName}`;
    if (i === routePoints.length - 1) return `Llega a ${b.shortName}`;
    return `Cruza por ${b.shortName}`;
  });

  const hasRoute = route.length > 1;

  return (
    <div className="flex min-h-[calc(100vh-5.5rem)] flex-col">
      <PageHeader title="Mapa del campus" subtitle="Encuentra tu camino" />

      {/* Selectores */}
      <div className="space-y-2 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <MapPin className="h-4 w-4" />
          </div>
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger className="h-10 flex-1 rounded-xl">
              <SelectValue placeholder="Origen" />
            </SelectTrigger>
            <SelectContent>
              {blocks.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.emoji} {b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
            <Navigation className="h-4 w-4" />
          </div>
          <Select value={dest} onValueChange={setDest}>
            <SelectTrigger className="h-10 flex-1 rounded-xl">
              <SelectValue placeholder="Destino" />
            </SelectTrigger>
            <SelectContent>
              {blocks.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.emoji} {b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleTrace} className="h-10 w-full rounded-xl font-semibold">
          Trazar ruta
        </Button>
      </div>

      {/* Mapa */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-muted/40",
          hasRoute ? "h-[220px] flex-shrink-0" : "min-h-[360px] flex-1"
        )}
      >
        <svg viewBox="0 0 400 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          {/* Fondo del campus */}
          <rect x="10" y="10" width="380" height="480" rx="20" className="fill-background stroke-border" strokeWidth="1.5" />

          {/* Aristas (caminos peatonales) */}
          {edges.map(({ a, b }, i) => {
            const A = nodeMap.get(a)!;
            const B = nodeMap.get(b)!;
            return (
              <line
                key={i}
                x1={A.nx} y1={A.ny} x2={B.nx} y2={B.ny}
                className="stroke-muted-foreground/30"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Bloques */}
          {blocks.map(b => (
            <g key={b.id}>
              <rect
                x={b.x} y={b.y} width={b.w} height={b.h}
                rx={10}
                className={cn("transition-all", typeColors[b.type])}
                strokeWidth="1.5"
              />
              <text
                x={b.x + b.w / 2}
                y={b.y + b.h / 2 - 4}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-bold"
                style={{ fontSize: 11 }}
              >
                {b.shortName}
              </text>
              <text
                x={b.x + b.w / 2}
                y={b.y + b.h / 2 + 12}
                textAnchor="middle"
                style={{ fontSize: 14 }}
              >
                {b.emoji}
              </text>
            </g>
          ))}

          {/* Ruta trazada */}
          {pathD && (
            <path
              key={pathD}
              d={pathD}
              className="stroke-primary"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray="1000"
              style={{ animation: "draw-route 1.2s ease-out forwards" }}
            />
          )}

          {/* Marcadores origen / destino */}
          {route.length > 0 && (
            <>
              <circle cx={routePoints[0].nx} cy={routePoints[0].ny} r="8" className="fill-primary stroke-background" strokeWidth="3" />
              <circle cx={routePoints[routePoints.length - 1].nx} cy={routePoints[routePoints.length - 1].ny} r="8" className="fill-success stroke-background" strokeWidth="3" />
            </>
          )}
        </svg>
      </div>

      {/* Tarjeta de resumen (debajo del mapa, en flujo) */}
      {hasRoute && (
        <div className="mx-3 mt-3 mb-4 rounded-2xl border border-border bg-card p-4 shadow-card animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Ruta recomendada</p>
              <p className="mt-0.5 text-sm font-semibold">
                {nodeMap.get(route[0])?.shortName} → {nodeMap.get(route[route.length - 1])?.shortName}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2 py-1 font-semibold text-primary">
                <Footprints className="h-3.5 w-3.5" /> {meters} m
              </span>
              <span className="flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 font-semibold text-success">
                <Clock className="h-3.5 w-3.5" /> {minutes} min
              </span>
            </div>
          </div>
          <ol className="mt-3 space-y-1.5 text-xs">
            {stepsText.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
