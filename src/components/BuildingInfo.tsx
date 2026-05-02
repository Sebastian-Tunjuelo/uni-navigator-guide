import type { Building } from "@/types/campus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BuildingInfoProps {
  building?: Building;
  onNavigate?: () => void;
}

const categoryLabels: Record<string, string> = {
  academic: "Académico",
  library: "Biblioteca",
  service: "Servicios",
  residence: "Residencias",
  sports: "Deportes",
  health: "Salud",
  admin: "Administración",
  food: "Comida",
  entrance: "Entrada",
};

export default function BuildingInfo({ building, onNavigate }: BuildingInfoProps) {
  if (!building) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
        Selecciona un edificio para ver su información y servicios.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{building.name}</p>
          <p className="text-xs text-muted-foreground">{building.shortName}</p>
        </div>
        <Badge variant="secondary" className="rounded-full text-xs">
          {categoryLabels[building.category] || building.category}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{building.description}</p>
      <Button
        onClick={onNavigate}
        className="mt-3 w-full rounded-xl"
      >
        Navegar aquí
      </Button>
    </div>
  );
}
