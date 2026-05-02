import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, Footprints } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { campusBuildings, campusRoutes } from "@/data/campus-extended";
import { findRoute, getRouteLength, estimateWalkingTime } from "@/utils/campus-helpers";
import CampusMap from "@/components/CampusMap";
import BuildingInfo from "@/components/BuildingInfo";
import RouteFinder from "@/components/RouteFinder";
import SearchBar from "@/components/SearchBar";

export default function Mapa() {
  const [params] = useSearchParams();
  const [origin, setOrigin] = useState<string>("ENT-001");
  const [dest, setDest] = useState<string>(params.get("to") || "P31");
  const [route, setRoute] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  // Auto-trace if destination came from URL
  useEffect(() => {
    if (params.get("to")) {
      const r = findRoute(campusBuildings, campusRoutes, origin, params.get("to")!);
      setRoute(r);
    }
  }, []); // eslint-disable-line

  const handleTrace = () => {
    const r = findRoute(campusBuildings, campusRoutes, origin, dest);
    setRoute(r);
  };

  const meters = useMemo(() => getRouteLength(campusBuildings, route, campusRoutes), [route]);
  const minutes = estimateWalkingTime(meters);

  const selectedBuildingData = campusBuildings.find(b => b.id === selectedBuilding);
  const hasRoute = route.length > 1;
  const stepsText = route
    .map((id, i) => {
      const b = campusBuildings.find(item => item.id === id);
      if (!b) return null;
      if (i === 0) return `Sal de ${b.shortName}`;
      if (i === route.length - 1) return `Llega a ${b.shortName}`;
      return `Cruza por ${b.shortName}`;
    })
    .filter(Boolean) as string[];

  const filteredBuildings = campusBuildings.filter(building => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      building.name.toLowerCase().includes(term) ||
      building.shortName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex min-h-[calc(100vh-5.5rem)] flex-col">
      <PageHeader title="Mapa del campus" subtitle="Navega por un campus 2D interactivo" />

      <div className="space-y-3 border-b border-border bg-background px-4 py-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar edificio" />
        <RouteFinder
          buildings={campusBuildings}
          origin={origin}
          destination={dest}
          onOriginChange={setOrigin}
          onDestinationChange={setDest}
          onTrace={handleTrace}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-3 py-4">
        <div className="min-h-[360px] flex-1">
          <CampusMap
            buildings={filteredBuildings}
            routes={campusRoutes}
            selectedBuilding={selectedBuilding}
            selectedRoute={route}
            onBuildingSelect={setSelectedBuilding}
          />
        </div>

        <BuildingInfo
          building={selectedBuildingData}
          onNavigate={() => {
            if (!selectedBuilding) return;
            setDest(selectedBuilding);
            const r = findRoute(campusBuildings, campusRoutes, origin, selectedBuilding);
            setRoute(r);
          }}
        />
      </div>

      {hasRoute && (
        <div className="mx-3 mb-4 rounded-2xl border border-border bg-card p-4 shadow-card animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Ruta recomendada</p>
              <p className="mt-0.5 text-sm font-semibold">
                {campusBuildings.find(b => b.id === route[0])?.shortName} →
                {" "}
                {campusBuildings.find(b => b.id === route[route.length - 1])?.shortName}
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
