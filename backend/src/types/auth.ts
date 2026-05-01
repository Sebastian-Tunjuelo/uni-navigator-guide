// Tipos para autenticación
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
  created_at?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  session?: {
    access_token: string;
    refresh_token?: string;
  };
}

export interface JWTPayload {
  sub: string;
  email: string;
  aud: string;
  iat: number;
  exp: number;
}
