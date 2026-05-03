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
  const backgroundRef = useRef<HTMLImageElement | null>(null);
  const zoom = 1;
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [mapSize, setMapSize] = useState({ width: 1000, height: 900 });
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [lastCoord, setLastCoord] = useState<{ x: number; y: number } | null>(
    null,
  );

  const nodes = useMemo(() => {
    return buildings.map((b) => ({
      id: b.id,
      x: b.latitude * mapSize.width,
      y: b.longitude * mapSize.height,
      radius: selectedBuilding === b.id ? 18 : 12,
      data: b,
    }));
  }, [buildings, mapSize, selectedBuilding]);

  useEffect(() => {
    const image = new Image();
    image.src = "/mapa-poblado.jpg";
    image.onload = () => {
      backgroundRef.current = image;
      setMapSize({ width: image.naturalWidth, height: image.naturalHeight });
    };
  }, []);

  useEffect(() => {
    if (!centerCoords) return;
    setPan({ x: 0, y: 0 });
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

  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    const image = backgroundRef.current;
    if (image) {
      ctx.drawImage(image, 0, 0, width, height);
      return;
    }

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);
  };

  const drawRoutes = (ctx: CanvasRenderingContext2D) => {
    routes.forEach((route) => {
      const from = nodes.find((n) => n.id === route.from_id);
      const to = nodes.find((n) => n.id === route.to_id);
      if (!from || !to) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle =
        route.type === "recommended"
          ? "rgba(37, 99, 235, 0.55)"
          : route.type === "shuttle"
            ? "rgba(15, 23, 42, 0.42)"
            : "rgba(100, 116, 139, 0.35)";
      ctx.lineWidth =
        route.type === "covered" || route.type === "shuttle" ? 3 : 2;
      ctx.setLineDash(
        route.type === "shortcuts" || route.type === "recommended"
          ? [6, 6]
          : [],
      );
      ctx.stroke();
      ctx.setLineDash([]);
    });
  };

  const drawBuildings = (ctx: CanvasRenderingContext2D) => {
    nodes.forEach((node) => {
      const isSelected = selectedBuilding === node.id;
      const isHovered = hovered === node.id;

      ctx.beginPath();
      ctx.fillStyle = "rgba(15, 23, 42, 0.15)";
      ctx.arc(node.x + 2, node.y + 2, node.radius + 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = node.data.color || "#3b82f6";
      ctx.arc(
        node.x,
        node.y,
        node.radius + (isHovered ? 2 : 0),
        0,
        Math.PI * 2,
      );
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
      .map((id) => nodes.find((n) => n.id === id))
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
    const canvas = canvasRef.current;
    if (!rect) return { x: 0, y: 0 };
    const scaleX = canvas ? canvas.width / rect.width : 1;
    const scaleY = canvas ? canvas.height / rect.height : 1;
    const x = ((clientX - rect.left) * scaleX - pan.x) / zoom;
    const y = ((clientY - rect.top) * scaleY - pan.y) / zoom;
    return { x, y };
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToCanvas(event.clientX, event.clientY);
    if (calibrationMode) {
      setLastCoord({
        x: Math.max(0, Math.min(1, x / mapSize.width)),
        y: Math.max(0, Math.min(1, y / mapSize.height)),
      });
      return;
    }
    const hit = nodes.find(
      (node) => Math.hypot(x - node.x, y - node.y) <= node.radius + 4,
    );
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
    const hit = nodes.find(
      (node) => Math.hypot(x - node.x, y - node.y) <= node.radius + 6,
    );
    setHovered(hit ? hit.id : null);
    if (calibrationMode) {
      setLastCoord({
        x: Math.max(0, Math.min(1, x / mapSize.width)),
        y: Math.max(0, Math.min(1, y / mapSize.height)),
      });
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragOrigin({ x: event.clientX - pan.x, y: event.clientY - pan.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full rounded-2xl border border-border bg-muted/40"
    >
      <canvas
        ref={canvasRef}
        width={mapSize.width}
        height={mapSize.height}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="h-full w-full rounded-2xl"
      />
      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold shadow-card">
        <button
          type="button"
          onClick={() => setCalibrationMode((prev) => !prev)}
          className="rounded-full border border-border px-2 py-0.5"
        >
          {calibrationMode ? "Calibrando" : "Calibrar"}
        </button>
        {lastCoord && (
          <span className="font-mono">
            x:{lastCoord.x.toFixed(3)} y:{lastCoord.y.toFixed(3)}
          </span>
        )}
      </div>
      {hovered && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-background px-3 py-1 text-xs font-semibold shadow-card">
          {nodes.find((n) => n.id === hovered)?.data.name}
        </div>
      )}
    </div>
  );
}
