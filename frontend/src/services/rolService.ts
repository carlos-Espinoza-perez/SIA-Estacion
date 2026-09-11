import { Privilegio, NivelPermiso, RolPrivilegioDetalle, AsignacionPrivilegioRequest, Rol, CrearRolFormData } from '../types/rol';
import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';

interface RolBackendDto {
  id: string;
  nombre: string;
  descripcion?: string;
  esSistema: boolean;
  activo: boolean;
  personasAsignadas: number;
  permisos: string[];
}

export const rolService = {
  // Nota: estas llamadas dejan que el error se propague (sin catch interno). Si se
  // silenciaba aqui con datos por defecto, la pagina de Roles se veia funcional
  // aunque la API estuviera caida — riesgoso en una pantalla que asigna permisos.
  // El try/catch que muestra el toast de error vive en RolesPage.
  getRoles: async (): Promise<Rol[]> => {
    const response = await apiClient.get<RespuestaEnvuelta<RolBackendDto[]>>('/roles');
    if (!response.data || !Array.isArray(response.data.datos)) {
      throw new Error('La API no devolvio la lista de roles.');
    }
    return response.data.datos.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion || '',
      personasAsignadas: r.personasAsignadas,
      permisos: r.permisos,
      activo: r.activo,
      esSistema: r.esSistema,
    }));
  },

  getPrivilegios: async (): Promise<Privilegio[]> => {
    const response = await apiClient.get<RespuestaEnvuelta<Privilegio[]>>('/privilegios');
    if (!response.data || !Array.isArray(response.data.datos)) {
      throw new Error('La API no devolvio la lista de privilegios.');
    }
    return response.data.datos;
  },

  crearPrivilegio: async (data: { codigo: string; nombre: string; modulo: string }): Promise<Privilegio> => {
    const response = await apiClient.post<RespuestaEnvuelta<Privilegio>>('/privilegios', data);
    if (response.data?.datos) {
      return response.data.datos;
    }
    throw new Error('No se pudo crear el privilegio');
  },

  getNivelesPermiso: async (): Promise<NivelPermiso[]> => {
    const response = await apiClient.get<RespuestaEnvuelta<NivelPermiso[]>>('/niveles-permiso');
    if (!response.data || !Array.isArray(response.data.datos)) {
      throw new Error('La API no devolvio los niveles de permiso.');
    }
    return response.data.datos.sort((a, b) => a.orden - b.orden);
  },

  getPrivilegiosRol: async (rolId: string): Promise<RolPrivilegioDetalle[]> => {
    const response = await apiClient.get<RespuestaEnvuelta<RolPrivilegioDetalle[]>>(`/roles/${rolId}/privilegios`);
    if (!response.data || !Array.isArray(response.data.datos)) {
      throw new Error('La API no devolvio los privilegios del rol.');
    }
    return response.data.datos;
  },

  crearRol: async (formData: CrearRolFormData): Promise<Rol> => {
    const response = await apiClient.post<RespuestaEnvuelta<RolBackendDto>>('/roles', {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      activo: formData.activo,
      esSistema: false,
    });

    if (response.data?.datos) {
      const nuevoBackend = response.data.datos;

      return {
        id: nuevoBackend.id,
        nombre: nuevoBackend.nombre,
        descripcion: nuevoBackend.descripcion || '',
        personasAsignadas: nuevoBackend.personasAsignadas,
        permisos: nuevoBackend.permisos,
        activo: nuevoBackend.activo,
        esSistema: nuevoBackend.esSistema,
      };
    }
    throw new Error('No se pudo crear el rol');
  },

  actualizarRol: async (rolId: string, data: Partial<Rol>): Promise<Rol> => {
    const response = await apiClient.put<RespuestaEnvuelta<RolBackendDto>>(`/roles/${rolId}`, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      activo: data.activo,
    });

    if (response.data?.datos) {
      const actBackend = response.data.datos;

      return {
        id: actBackend.id,
        nombre: actBackend.nombre,
        descripcion: actBackend.descripcion || '',
        personasAsignadas: actBackend.personasAsignadas,
        permisos: actBackend.permisos,
        activo: actBackend.activo,
        esSistema: actBackend.esSistema,
      };
    }
    throw new Error('No se pudo actualizar el rol');
  },

  reemplazarMatrizPrivilegios: async (rolId: string, asignaciones: AsignacionPrivilegioRequest[]): Promise<boolean> => {
    const response = await apiClient.put<RespuestaEnvuelta<boolean>>(`/roles/${rolId}/privilegios`, {
      asignaciones,
    });

    if (response.status === 204 || response.status === 200 || response.data?.exitoso) {
      return true;
    }
    throw new Error('No se pudo actualizar la matriz de privilegios');
  },

  actualizarPermisosRol: async (rolId: string, asignaciones: AsignacionPrivilegioRequest[]): Promise<Rol> => {
    await rolService.reemplazarMatrizPrivilegios(rolId, asignaciones);
    const roles = await rolService.getRoles();
    return roles.find((r) => r.id === rolId)!;
  },

  toggleEstadoRol: async (rolId: string): Promise<Rol> => {
    const roles = await rolService.getRoles();
    const rolActual = roles.find((r) => r.id === rolId);
    if (!rolActual) throw new Error('Rol no encontrado');

    const response = await rolService.actualizarRol(rolId, {
      ...rolActual,
      activo: !rolActual.activo,
    });

    return response;
  },

  eliminarRol: async (rolId: string): Promise<boolean> => {
    const response = await apiClient.delete<RespuestaEnvuelta<boolean>>(`/roles/${rolId}`);
    return !!response.data?.exitoso;
  },
};
