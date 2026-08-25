import { PermisoDef, Rol, CrearRolFormData } from '../types/rol';

export const PERMISOS_SISTEMA: PermisoDef[] = [
  // ACCESOS
  {
    codigo: 'acceso.validar',
    nombre: 'acceso.validar',
    descripcion: 'Validar ingreso y egreso en una Estación',
    categoria: 'ACCESOS',
  },
  {
    codigo: 'acceso.consultar',
    nombre: 'acceso.consultar',
    descripcion: 'Ver la bitácora de accesos',
    categoria: 'ACCESOS',
  },

  // ÍTEMS
  {
    codigo: 'item.solicitar',
    nombre: 'item.solicitar',
    descripcion: 'Solicitar el préstamo de un ítem',
    categoria: 'ÍTEMS',
  },
  {
    codigo: 'item.aprobar',
    nombre: 'item.aprobar',
    descripcion: 'Aprobar o rechazar solicitudes pendientes',
    categoria: 'ÍTEMS',
  },
  {
    codigo: 'item.entregar',
    nombre: 'item.entregar',
    descripcion: 'Registrar la entrega y la devolución',
    categoria: 'ÍTEMS',
  },
  {
    codigo: 'item.registrar',
    nombre: 'item.registrar',
    descripcion: 'Dar de alta y editar ítems del inventario',
    categoria: 'ÍTEMS',
  },

  // CATÁLOGOS
  {
    codigo: 'tipoitem.gestionar',
    nombre: 'tipoitem.gestionar',
    descripcion: 'Crear y editar tipos de ítem',
    categoria: 'CATÁLOGOS',
  },
  {
    codigo: 'estacion.configurar',
    nombre: 'estacion.configurar',
    descripcion: 'Configurar Estaciones y su flujo',
    categoria: 'CATÁLOGOS',
  },

  // ADMINISTRACIÓN
  {
    codigo: 'persona.gestionar',
    nombre: 'persona.gestionar',
    descripcion: 'Alta, edición y baja de personas',
    categoria: 'ADMINISTRACIÓN',
  },
  {
    codigo: 'rol.gestionar',
    nombre: 'rol.gestionar',
    descripcion: 'Crear roles y asignar Claims',
    categoria: 'ADMINISTRACIÓN',
  },
  {
    codigo: 'foto.administrar',
    nombre: 'foto.administrar',
    descripcion: 'Ver y reemplazar fotografías de referencia',
    categoria: 'ADMINISTRACIÓN',
  },

  // AUDITORÍA
  {
    codigo: 'auditoria.consultar',
    nombre: 'auditoria.consultar',
    descripcion: 'Consultar la bitácora unificada',
    categoria: 'AUDITORÍA',
  },
  {
    codigo: 'reporte.ver',
    nombre: 'reporte.ver',
    descripcion: 'Ver reportes de desempeño',
    categoria: 'AUDITORÍA',
  },
];

// Mocks eliminados; Los datos ahora provienen exclusivamente del backend.
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

  getPermisos: async (): Promise<PermisoDef[]> => {
    return [...PERMISOS_SISTEMA];
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

  actualizarPermisosRol: async (rolId: string, permisos: string[]): Promise<Rol> => {
    // Obtenemos los permisos (mock o transformamos la lista de ids)
    // El backend espera una matriz de asignaciones. Asumiendo formato actual:
    const response = await apiClient.put<RespuestaEnvuelta<boolean>>(`/roles/${rolId}/privilegios`, {
      asignaciones: permisos.map((p) => ({
        privilegioId: p, 
        nivelPermisoId: '00000000-0000-0000-0000-000000000000'
      })),
    });

    if (response.data?.exitoso) {
      await auditoriaService.registrarEvento({
        tipo: 'Seguridad',
        actor: 'Administrador',
        descripcion: `Permisos del rol actualizado (${permisos.length} permisos)`,
        origen: 'Panel',
        estacion: '—',
      });
      // Devolver los roles recargados
      const roles = await rolService.getRoles();
      return roles.find(r => r.id === rolId)!;
    }
    throw new Error('No se pudo actualizar los permisos');
  },

  toggleEstadoRol: async (rolId: string): Promise<Rol> => {
    // Primero obtenemos el rol actual
    const roles = await rolService.getRoles();
    const rolActual = roles.find(r => r.id === rolId);
    if (!rolActual) throw new Error('Rol no encontrado');

    const response = await rolService.actualizarRol(rolId, {
      ...rolActual,
      activo: !rolActual.activo
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
