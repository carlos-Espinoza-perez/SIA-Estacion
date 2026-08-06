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

export const MOCK_ROLES: Rol[] = [
  {
    id: 'rol-1',
    nombre: 'Estudiante',
    descripcion: 'Solicita préstamos y accede al recinto',
    personasAsignadas: 248,
    permisos: ['acceso.validar', 'item.solicitar'],
    activo: true,
    esSistema: true,
  },
  {
    id: 'rol-2',
    nombre: 'Encargado de recurso',
    descripcion: 'Aprueba y entrega ítems de su Estación',
    personasAsignadas: 5,
    permisos: [
      'acceso.validar',
      'acceso.consultar',
      'item.solicitar',
      'item.aprobar',
      'item.entregar',
      'item.registrar',
      'auditoria.consultar',
      'reporte.ver',
    ],
    activo: true,
    esSistema: true,
  },
  {
    id: 'rol-3',
    nombre: 'Guardia',
    descripcion: 'Consulta accesos en el punto de ingreso',
    personasAsignadas: 2,
    permisos: ['acceso.validar', 'acceso.consultar', 'auditoria.consultar'],
    activo: true,
    esSistema: true,
  },
  {
    id: 'rol-4',
    nombre: 'Administrador',
    descripcion: 'Configura Estaciones, roles y catálogos',
    personasAsignadas: 1,
    permisos: [
      'acceso.validar',
      'acceso.consultar',
      'item.solicitar',
      'item.aprobar',
      'item.entregar',
      'item.registrar',
      'tipoitem.gestionar',
      'estacion.configurar',
      'persona.gestionar',
      'rol.gestionar',
      'foto.administrar',
      'auditoria.consultar',
      'reporte.ver',
    ],
    activo: true,
    esSistema: true,
  },
];

import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';
import { auditoriaService } from './auditoriaService';

interface RolBackendDto {
  id: string;
  nombre: string;
  descripcion?: string;
  esSistema: boolean;
  activo?: boolean;
}

export const rolService = {
  getRoles: async (): Promise<Rol[]> => {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<RolBackendDto[]>>('/roles');
      if (response.data.datos && response.data.datos.length > 0) {
        return response.data.datos.map((r) => {
          const matchMock = MOCK_ROLES.find(
            (m) => m.id === r.id || m.nombre.toLowerCase() === r.nombre.toLowerCase()
          );
          return {
            id: r.id,
            nombre: r.nombre,
            descripcion: r.descripcion || matchMock?.descripcion || '',
            personasAsignadas: matchMock?.personasAsignadas || 0,
            permisos: matchMock?.permisos || ['acceso.validar'],
            activo: r.activo ?? true,
            esSistema: r.esSistema,
          };
        });
      }
    } catch {
      // Fallback
    }
    return [...MOCK_ROLES];
  },

  getPermisos: async (): Promise<PermisoDef[]> => {
    return [...PERMISOS_SISTEMA];
  },

  crearRol: async (formData: CrearRolFormData): Promise<Rol> => {
    try {
      const response = await apiClient.post<RespuestaEnvuelta<RolBackendDto>>('/roles', {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
      });

      if (response.data.datos) {
        const nuevoBackend = response.data.datos;
        const nuevoRol: Rol = {
          id: nuevoBackend.id,
          nombre: nuevoBackend.nombre,
          descripcion: nuevoBackend.descripcion || formData.descripcion,
          personasAsignadas: 0,
          permisos: formData.permisos,
          activo: formData.activo,
          esSistema: nuevoBackend.esSistema,
        };
        MOCK_ROLES.push(nuevoRol);
        return nuevoRol;
      }
    } catch {
      // Fallback local
    }

    const nuevoRol: Rol = {
      id: `rol-${Date.now()}`,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      personasAsignadas: 0,
      permisos: formData.permisos,
      activo: formData.activo,
      esSistema: false,
    };
    MOCK_ROLES.push(nuevoRol);

    await auditoriaService.registrarEvento({
      tipo: 'Configuración',
      actor: 'Administrador',
      descripcion: `Creación de nuevo rol "${nuevoRol.nombre}" con ${nuevoRol.permisos.length} permisos`,
      origen: 'Panel',
      estacion: '—',
    });

    return nuevoRol;
  },

  actualizarRol: async (rolId: string, data: Partial<Rol>): Promise<Rol> => {
    try {
      if (data.nombre) {
        await apiClient.put(`/roles/${rolId}`, {
          nombre: data.nombre,
          descripcion: data.descripcion,
        });
      }
    } catch {
      // Fallback local
    }

    const index = MOCK_ROLES.findIndex((r) => r.id === rolId);
    if (index === -1) throw new Error('Rol no encontrado');

    MOCK_ROLES[index] = { ...MOCK_ROLES[index], ...data };

    await auditoriaService.registrarEvento({
      tipo: 'Configuración',
      actor: 'Administrador',
      descripcion: `Actualización del rol "${MOCK_ROLES[index].nombre}"`,
      origen: 'Panel',
      estacion: '—',
    });

    return MOCK_ROLES[index];
  },

  actualizarPermisosRol: async (rolId: string, permisos: string[]): Promise<Rol> => {
    try {
      // Formato matriz o privilegios
      await apiClient.put(`/roles/${rolId}/privilegios`, {
        privilegios: permisos.map((p) => ({
          moduloCodigo: p.split('.')[0]?.toUpperCase() || 'ACC',
          tipoPermiso: 'LecturaEscritura',
        })),
      });
    } catch {
      // Fallback local
    }

    const index = MOCK_ROLES.findIndex((r) => r.id === rolId);
    if (index !== -1) {
      MOCK_ROLES[index].permisos = permisos;
      await auditoriaService.registrarEvento({
        tipo: 'Seguridad',
        actor: 'Administrador',
        descripcion: `Permisos del rol "${MOCK_ROLES[index].nombre}" actualizados (${permisos.length} permisos)`,
        origen: 'Panel',
        estacion: '—',
      });
      return MOCK_ROLES[index];
    }
    throw new Error('Rol no encontrado');
  },

  toggleEstadoRol: async (rolId: string): Promise<Rol> => {
    const index = MOCK_ROLES.findIndex((r) => r.id === rolId);
    if (index === -1) throw new Error('Rol no encontrado');

    MOCK_ROLES[index].activo = !MOCK_ROLES[index].activo;

    await auditoriaService.registrarEvento({
      tipo: 'Seguridad',
      actor: 'Administrador',
      descripcion: `Rol "${MOCK_ROLES[index].nombre}" ${MOCK_ROLES[index].activo ? 'activado' : 'desactivado'}`,
      origen: 'Panel',
      estacion: '—',
    });

    return MOCK_ROLES[index];
  },

  eliminarRol: async (rolId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/roles/${rolId}`);
    } catch {
      // Fallback local
    }

    const index = MOCK_ROLES.findIndex((r) => r.id === rolId);
    if (index === -1) return false;
    if (MOCK_ROLES[index].esSistema) {
      throw new Error('No se pueden eliminar roles protegidos del sistema');
    }

    const [eliminado] = MOCK_ROLES.splice(index, 1);

    await auditoriaService.registrarEvento({
      tipo: 'Seguridad',
      actor: 'Administrador',
      descripcion: `Eliminación del rol personalizado "${eliminado.nombre}"`,
      origen: 'Panel',
      estacion: '—',
    });

    return true;
  },
};
