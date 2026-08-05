export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginQrRequest {
  codigoQr: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresInMinutes: number;
}

export interface PrivilegioEfectivoDto {
  codigo: string;
  nombre: string;
  niveles: string[];
}

export interface PerfilResponse {
  userId: string;
  email: string;
  empresaId: string;
  personaId: string;
  nombreCompleto: string;
  roles: string[];
  privilegios: PrivilegioEfectivoDto[];
}

export interface AuthState {
  user: PerfilResponse | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
