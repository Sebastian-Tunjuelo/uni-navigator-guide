export interface CampusBlock {
  id: string;
  name: string;
  shortName: string;
  type: "academico" | "biblioteca" | "cafeteria" | "deportes" | "auditorio" | "entrada" | "plaza";
  x: number;
  y: number;
  w: number;
  h: number;
  nx: number;
  ny: number;
  emoji: string;
}

export interface CampusEdge {
  a: string;
  b: string;
}
