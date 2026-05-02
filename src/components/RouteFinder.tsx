import type { Building } from "@/types/campus";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RouteFinderProps {
  buildings: Building[];
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onTrace: () => void;
}

export default function RouteFinder({
  buildings,
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onTrace,
}: RouteFinderProps) {
  return (
    <div className="space-y-2">
      <Select value={origin} onValueChange={onOriginChange}>
        <SelectTrigger className="h-10 w-full rounded-xl">
          <SelectValue placeholder="Origen" />
        </SelectTrigger>
        <SelectContent>
          {buildings.map(b => (
            <SelectItem key={b.id} value={b.id}>
              {b.icon} {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={destination} onValueChange={onDestinationChange}>
        <SelectTrigger className="h-10 w-full rounded-xl">
          <SelectValue placeholder="Destino" />
        </SelectTrigger>
        <SelectContent>
          {buildings.map(b => (
            <SelectItem key={b.id} value={b.id}>
              {b.icon} {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onTrace} className="h-10 w-full rounded-xl font-semibold">
        Trazar ruta
      </Button>
    </div>
  );
}
