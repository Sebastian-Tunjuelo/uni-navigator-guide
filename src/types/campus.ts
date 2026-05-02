export type BuildingCategory =
  | "academic"
  | "library"
  | "service"
  | "residence"
  | "sports"
  | "health"
  | "admin"
  | "food"
  | "entrance";

export type RouteType = "walking" | "covered" | "shortcuts";

export interface Building {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: BuildingCategory;
  latitude: number;
  longitude: number;
  icon?: string;
  color?: string;
}

export interface Route {
  id: string;
  from_id: string;
  to_id: string;
  distance: number;
  type: RouteType;
  duration: number;
  waypoints?: [number, number][];
}

export interface MapNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  data: Building;
}

export interface MapEdge {
  source: MapNode;
  target: MapNode;
  data: Route;
}
