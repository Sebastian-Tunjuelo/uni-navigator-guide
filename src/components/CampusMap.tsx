import { useEffect, useMemo, useRef, useState } from "react";
import type { Building, Route } from "@/types/campus";

interface CampusMapProps {
  buildings: Building[];
  routes: Route[];
  selectedBuilding?: string;
  selectedRoute?: string[];
  onBuildingSelect?: (buildingId: string) => void;
  centerCoords?: [number, number];
}

const MIN_ZOOM = 0.65;
const MAX_ZOOM = 2.3;

export default function CampusMap({
  buildings,
  routes,
  selectedBuilding,
  selectedRoute,
  onBuildingSelect,
  centerCoords,
}: CampusMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });

  const nodes = useMemo(() => {
    return buildings.map(b => ({
      id: b.id,
      x: b.latitude,
      y: b.longitude,
      radius: selectedBuilding === b.id ? 18 : 12,
      data: b,
    }));
  }, [buildings, selectedBuilding]);

  useEffect(() => {
    if (!centerCoords) return;
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [centerCoords]);

  useEffect(() => {
    drawMap();
  }, [nodes, routes, selectedBuilding, selectedRoute, hovered, zoom, pan]);

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    drawBackground(ctx, width, height);
    drawRoutes(ctx);
    drawBuildings(ctx);
    drawSelectedRoute(ctx);

    ctx.restore();
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(80, 70, width - 160, height - 140);

    ctx.strokeStyle = "#cbd5f5";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(80, 70, width - 160, height - 140);
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(16, 185, 129, 0.18)";
    ctx.beginPath();
    ctx.ellipse(500, 420, 220, 140, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawRoutes = (ctx: CanvasRenderingContext2D) => {
    routes.forEach(route => {
      const from = nodes.find(n => n.id === route.from_id);
      const to = nodes.find(n => n.id === route.to_id);
      if (!from || !to) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = "rgba(100, 116, 139, 0.35)";
      ctx.lineWidth = route.type === "covered" ? 3 : 2;
      ctx.setLineDash(route.type === "shortcuts" ? [6, 6] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  };

  const drawBuildings = (ctx: CanvasRenderingContext2D) => {
    nodes.forEach(node => {
      const isSelected = selectedBuilding === node.id;
      const isHovered = hovered === node.id;

      ctx.beginPath();
      ctx.fillStyle = "rgba(15, 23, 42, 0.15)";
      ctx.arc(node.x + 2, node.y + 2, node.radius + 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = node.data.color || "#3b82f6";
      ctx.arc(node.x, node.y, node.radius + (isHovered ? 2 : 0), 0, Math.PI * 2);
      ctx.fill();

      if (isSelected || isHovered) {
        ctx.strokeStyle = isSelected ? "#0f172a" : "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = "#0f172a";
      ctx.font = "12px ui-sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(node.data.shortName, node.x, node.y - node.radius - 6);

      ctx.fillStyle = "#1e293b";
      ctx.font = "14px ui-sans-serif";
      if (node.data.icon) {
        ctx.fillText(node.data.icon, node.x, node.y + 5);
      }
    });
  };

  const drawSelectedRoute = (ctx: CanvasRenderingContext2D) => {
    if (!selectedRoute || selectedRoute.length < 2) return;
    const points = selectedRoute
      .map(id => nodes.find(n => n.id === id))
      .filter(Boolean) as typeof nodes;
    if (points.length < 2) return;

    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const screenToCanvas = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToCanvas(event.clientX, event.clientY);
    const hit = nodes.find(node => Math.hypot(x - node.x, y - node.y) <= node.radius + 4);
    if (hit) onBuildingSelect?.(hit.id);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: event.clientX - dragOrigin.x,
        y: event.clientY - dragOrigin.y,
      });
      return;
    }
    const { x, y } = screenToCanvas(event.clientX, event.clientY);
    const hit = nodes.find(node => Math.hypot(x - node.x, y - node.y) <= node.radius + 6);
    setHovered(hit ? hit.id : null);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragOrigin({ x: event.clientX - pan.x, y: event.clientY - pan.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = -event.deltaY * 0.001;
    setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
  };

  return (
    <div ref={wrapperRef} className="relative h-full w-full rounded-2xl border border-border bg-muted/40">
      <canvas
        ref={canvasRef}
        width={1000}
        height={900}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="h-full w-full rounded-2xl"
      />
      {hovered && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-background px-3 py-1 text-xs font-semibold shadow-card">
          {nodes.find(n => n.id === hovered)?.data.name}
        </div>
      )}
    </div>
  );
}
