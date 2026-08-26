import { Privilegio, NivelPermiso, RolPrivilegioDetalle, AsignacionPrivilegioRequest, Rol, CrearRolFormData } from '../types/rol';
import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';
import { auditoriaService } from './auditoriaService';

interface RolBackendDto {
  id: string;
  nombre: string;
  descripcion?: string;
  esSistema: boolean;
  activo: boolean;
  personasAsignadas: number;
  permisos: string[];
}

export const NIVELES_POR_DEFECTO: NivelPermiso[] = [
  { id: '11111111-1111-1111-1111-111111111101', codigo: 'C', nombre: 'Crear', orden: 1, estado: true },
  { id: '11111111-1111-1111-1111-111111111102', codigo: 'L', nombre: 'Lectura', orden: 2, estado: true },
  { id: '11111111-1111-1111-1111-111111111103', codigo: 'A', nombre: 'Actualizar', orden: 3, estado: true },
  { id: '11111111-1111-1111-1111-111111111104', codigo: 'B', nombre: 'Borrar', orden: 4, estado: true },
  { id: '11111111-1111-1111-1111-111111111105', codigo: 'E', nombre: 'Escritura', orden: 5, estado: true },
  { id: '11111111-1111-1111-1111-111111111106', codigo: 'T', nombre: 'Total', orden: 6, estado: true },
];

export const PRIVILEGIOS_POR_DEFECTO: Privilegio[] = [
  { id: '22222222-2222-2222-2222-222222222201', codigo: 'ACC', nombre: 'Control de Accesos', modulo: 'Accesos', estado: true },
  { id: '22222222-2222-2222-2222-222222222202', codigo: 'OPE', nombre: 'Operaciones y Préstamos', modulo: 'Operaciones', estado: true },
  { id: '22222222-2222-2222-2222-222222222203', codigo: 'PER', nombre: 'Gestión de Personas', modulo: 'Personas', estado: true },
  { id: '22222222-2222-2222-2222-222222222204', codigo: 'ITM', nombre: 'Gestión de Ítems e Inventario', modulo: 'Inventario', estado: true },
  { id: '22222222-2222-2222-2222-222222222205', codigo: 'TIP', nombre: 'Tipos de Ítems y Categorías', modulo: 'Catálogos', estado: true },
  { id: '22222222-2222-2222-2222-222222222206', codigo: 'EST', nombre: 'Configuración de Estaciones', modulo: 'Estaciones', estado: true },
  { id: '22222222-2222-2222-2222-222222222207', codigo: 'ROL', nombre: 'Gestión de Roles y Permisos', modulo: 'Seguridad', estado: true },
  { id: '22222222-2222-2222-2222-222222222208', codigo: 'USU', nombre: 'Gestión de Usuarios', modulo: 'Seguridad', estado: true },
  { id: '22222222-2222-2222-2222-222222222209', codigo: 'AUD', nombre: 'Auditoría y Bitácora', modulo: 'Auditoría', estado: true },
  { id: '22222222-2222-2222-2222-222222222210', codigo: 'REP', nombre: 'Reportes y Estadísticas', modulo: 'Reportes', estado: true },
  { id: '22222222-2222-2222-2222-222222222211', codigo: 'EMP', nombre: 'Configuración de Empresas', modulo: 'Configuración', estado: true },
];

export const rolService = {
  getRoles: async (): Promise<Rol[]> => {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<RolBackendDto[]>>('/roles');
      if (response.data && Array.isArray(response.data.datos)) {
        return response.data.datos.map((r) => ({
          id: r.id,
          nombre: r.nombre,
          descripcion: r.descripcion || '',
          personasAsignadas: r.personasAsignadas,
          permisos: r.permisos,
          activo: r.activo,
          esSistema: r.esSistema,
        }));
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
    return [];
  },

  getPrivilegios: async (): Promise<Privilegio[]> => {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<Privilegio[]>>('/privilegios');
      if (response.data && Array.isArray(response.data.datos) && response.data.datos.length > 0) {
        return response.data.datos;
      }
    } catch (error) {
      console.error('Error fetching privilegios from API, using defaults:', error);
    }
    return [...PRIVILEGIOS_POR_DEFECTO];
  },

  crearPrivilegio: async (data: { codigo: string; nombre: string; modulo: string }): Promise<Privilegio> => {
    const response = await apiClient.post<RespuestaEnvuelta<Privilegio>>('/privilegios', data);
    if (response.data?.datos) {
      await auditoriaService.registrarEvento({
        tipo: 'Seguridad',
        actor: 'Administrador',
        descripcion: `Nuevo privilegio creado: [${data.codigo}] ${data.nombre} en módulo ${data.modulo}`,
        origen: 'Panel',
        estacion: '—',
      });
      return response.data.datos;
    }
    throw new Error('No se pudo crear el privilegio');
  },

  getNivelesPermiso: async (): Promise<NivelPermiso[]> => {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<NivelPermiso[]>>('/niveles-permiso');
      if (response.data && Array.isArray(response.data.datos) && response.data.datos.length > 0) {
        return response.data.datos.sort((a, b) => a.orden - b.orden);
      }
    } catch (error) {
      console.error('Error fetching niveles de permiso from API, using defaults:', error);
    }
    return [...NIVELES_POR_DEFECTO];
  },

  getPrivilegiosRol: async (rolId: string): Promise<RolPrivilegioDetalle[]> => {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<RolPrivilegioDetalle[]>>(`/roles/${rolId}/privilegios`);
      if (response.data && Array.isArray(response.data.datos)) {
        return response.data.datos;
      }
    } catch (error) {
      console.error(`Error fetching privilegios for role ${rolId}:`, error);
    }
    return [];
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
      
      await auditoriaService.registrarEvento({
        tipo: 'Configuración',
        actor: 'Administrador',
        descripcion: `Creación de nuevo rol "${nuevoBackend.nombre}"`,
        origen: 'Panel',
        estacion: '—',
      });

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

      await auditoriaService.registrarEvento({
        tipo: 'Configuración',
        actor: 'Administrador',
        descripcion: `Actualización del rol "${actBackend.nombre}"`,
        origen: 'Panel',
        estacion: '—',
      });

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
      await auditoriaService.registrarEvento({
        tipo: 'Seguridad',
        actor: 'Administrador',
        descripcion: `Matriz de privilegios actualizada para el rol (${asignaciones.length} asignaciones)`,
        origen: 'Panel',
        estacion: '—',
      });
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

    await auditoriaService.registrarEvento({
      tipo: 'Seguridad',
      actor: 'Administrador',
      descripcion: `Rol "${response.nombre}" ${response.activo ? 'activado' : 'desactivado'}`,
      origen: 'Panel',
      estacion: '—',
    });

    return response;
  },

  eliminarRol: async (rolId: string): Promise<boolean> => {
    const response = await apiClient.delete<RespuestaEnvuelta<boolean>>(`/roles/${rolId}`);
    
    if (response.data?.exitoso) {
      await auditoriaService.registrarEvento({
        tipo: 'Seguridad',
        actor: 'Administrador',
        descripcion: `Eliminación de un rol`,
        origen: 'Panel',
        estacion: '—',
      });
      return true;
    }
    return false;
  },
};
