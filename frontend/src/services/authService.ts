import { apiClient } from './apiClient';
import {
  LoginRequest,
  LoginQrRequest,
  RefreshRequest,
  TokenResponse,
  PerfilResponse,
} from '../types/auth';
import { RespuestaEnvuelta } from '../types/api';

export const authService = {
  async login(credenciales: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<RespuestaEnvuelta<TokenResponse>>(
      '/auth/login',
      credenciales
    );
    if (!response.data.datos) {
      const errorMsg = response.data.errores?.[0]?.mensaje || 'Error al iniciar sesión';
      throw new Error(errorMsg);
    }
    return response.data.datos;
  },

  async loginQr(request: LoginQrRequest): Promise<TokenResponse> {
    const response = await apiClient.post<RespuestaEnvuelta<TokenResponse>>(
      '/auth/login-qr',
      request
    );
    if (!response.data.datos) {
      const errorMsg = response.data.errores?.[0]?.mensaje || 'Error al autenticar con QR';
      throw new Error(errorMsg);
    }
    return response.data.datos;
  },

  async refresh(request: RefreshRequest): Promise<TokenResponse> {
    const response = await apiClient.post<RespuestaEnvuelta<TokenResponse>>(
      '/auth/refresh',
      request
    );
    if (!response.data.datos) {
      throw new Error('Error al renovar la sesión');
    }
    return response.data.datos;
  },

  async getPerfil(): Promise<PerfilResponse> {
    const response = await apiClient.get<RespuestaEnvuelta<PerfilResponse>>('/auth/perfil');
    if (!response.data.datos) {
      throw new Error('Error al obtener el perfil de usuario');
    }
    return response.data.datos;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignorar errores en logout remoto si el token ya expiró
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },
};
