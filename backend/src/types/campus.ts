// Tipos para el dominio del campus
export interface Building {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'service' | 'residence' | 'sport';
  latitude: number;
  longitude: number;
  icon?: string;
  color?: string;
  floor?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Route {
  id: string;
  from_id: string;
  to_id: string;
  distance: number;
  type: 'walking' | 'shuttle' | 'recommended';
  duration: number;
  waypoints?: [number, number][];
  created_at?: string;
  updated_at?: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  building_id: string;
  created_at?: string;
}
