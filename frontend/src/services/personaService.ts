import {
  Persona,
  TipoPersona,
  RolPersona,
  FichaPersonaDetalle,
  CrearPersonaFormData,
  FiltrosPersona,
} from '../types/persona';

import { apiClient } from './apiClient';
import { RespuestaEnvuelta, PaginacionMetadata } from '../types/api';

interface PersonaBackendDto {
  id: string;
  codigoEstudiantil: string;
  nombres: string;
  apellidos: string;
  tipoPersona: string;
  carreraOArea?: string;
  correo?: string;
  telefono?: string;
  estado: boolean;
  tieneFotoReferencia: boolean;
  fechaRegistro: string;
}

export const personaService = {
  getPersonas: async (filtros?: FiltrosPersona): Promise<{ data: Persona[]; paginacion?: PaginacionMetadata }> => {
    let url = '/personas?';
    const params = new URLSearchParams();
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros?.tipo) params.append('tipo', filtros.tipo);
    if (filtros?.rol) params.append('rol', filtros.rol);
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.pagina) params.append('pagina', filtros.pagina.toString());
    if (filtros?.limite) params.append('limite', filtros.limite.toString());
    
    url += params.toString();

    const response = await apiClient.get<RespuestaEnvuelta<PersonaBackendDto[]>>(url);
    const lista: Persona[] = (response.data?.datos || []).map((p) => ({
      id: p.id,
      nombre: `${p.nombres} ${p.apellidos}`.trim(),
      carnet: p.codigoEstudiantil,
      tipo: (p.tipoPersona === 'Estudiante' ? 'Estudiante' : 'Personal') as TipoPersona,
      rol: 'Estudiante' as RolPersona,
      carreraOArea: p.carreraOArea,
      correo: p.correo,
      ultimaActividad: p.fechaRegistro ? new Date(p.fechaRegistro).toLocaleDateString() : 'Hoy',
      estado: p.estado ? 'Activo' : 'Inactivo',
      tieneFotoReferencia: p.tieneFotoReferencia,
      fechaRegistro: p.fechaRegistro ? new Date(p.fechaRegistro).toLocaleDateString() : 'Hoy',
    }));

    return { data: lista, paginacion: response.data.paginacion };
  },

  getPersonaDetalle: async (id: string): Promise<FichaPersonaDetalle | null> => {
    const response = await apiClient.get<RespuestaEnvuelta<PersonaBackendDto>>(`/personas/${id}`);
    const p = response.data?.datos;
    if (!p) return null;

    return {
      id: p.id,
      nombre: `${p.nombres} ${p.apellidos}`.trim(),
      carnet: p.codigoEstudiantil,
      tipo: (p.tipoPersona === 'Estudiante' ? 'Estudiante' : 'Personal') as TipoPersona,
      rol: 'Estudiante' as RolPersona,
      carreraOArea: p.carreraOArea,
      correo: p.correo,
      ultimaActividad: new Date(p.fechaRegistro).toLocaleDateString(),
      estado: p.estado ? 'Activo' : 'Inactivo',
      tieneFotoReferencia: p.tieneFotoReferencia,
      fechaRegistro: new Date(p.fechaRegistro).toLocaleDateString(),
      fotoReferencia: p.tieneFotoReferencia
        ? {
            estado: 'Cifrada en reposo',
            fechaCaptura: new Date(p.fechaRegistro).toLocaleDateString(),
            fechaActualizacion: new Date().toLocaleDateString(),
            retencion: 'Se elimina al pasar a inactivo',
          }
        : undefined,
      historialAccesos: [],
      operacionesItems: [],
    };
  },

  crearPersona: async (data: CrearPersonaFormData): Promise<Persona> => {
    const parts = data.nombre.trim().split(' ');
    const nombres = parts.slice(0, Math.ceil(parts.length / 2)).join(' ') || data.nombre;
    const apellidos = parts.slice(Math.ceil(parts.length / 2)).join(' ') || '—';

    const response = await apiClient.post<RespuestaEnvuelta<PersonaBackendDto>>('/personas', {
      codigoEstudiantil: data.carnet,
      nombres,
      apellidos,
      tipoPersona: data.tipo,
      carreraOArea: data.carreraOArea,
      correo: data.correo,
    });

    const p = response.data.datos!;
    if (data.fotoArchivo) {
      const formData = new FormData();
      formData.append('foto', data.fotoArchivo);
      try {
        await apiClient.post(`/personas/${p.id}/foto`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (error) {
        console.error('Error al subir foto:', error);
      }
    }

    return {
      id: p.id,
      nombre: `${p.nombres} ${p.apellidos}`.trim(),
      carnet: p.codigoEstudiantil,
      tipo: data.tipo,
      rol: data.rol,
      carreraOArea: data.carreraOArea,
      correo: data.correo,
      ultimaActividad: new Date().toLocaleDateString(),
      estado: 'Activo',
      fechaRegistro: new Date().toLocaleDateString(),
      tieneFotoReferencia: !!data.fotoArchivo || !!data.fotoPreviewUrl,
      avatarUrl: data.fotoPreviewUrl,
    };
  },

  actualizarPersona: async (id: string, data: Partial<Persona>): Promise<Persona> => {
    let p: PersonaBackendDto | undefined;
    
    if (data.nombre) {
      const parts = data.nombre.trim().split(' ');
      const nombres = parts.slice(0, Math.ceil(parts.length / 2)).join(' ') || data.nombre;
      const apellidos = parts.slice(Math.ceil(parts.length / 2)).join(' ') || '—';

      const resp = await apiClient.put<RespuestaEnvuelta<PersonaBackendDto>>(`/personas/${id}`, {
        nombres,
        apellidos,
        tipoPersona: data.tipo || 'Estudiante',
        carreraOArea: data.carreraOArea,
        correo: data.correo,
        estado: data.estado === 'Activo',
      });
      p = resp.data.datos!;
    }

    if (!p) {
        const getResp = await apiClient.get<RespuestaEnvuelta<PersonaBackendDto>>(`/personas/${id}`);
        p = getResp.data.datos!;
    }

    if (!p) throw new Error('No data');

    return {
      id: p.id,
      nombre: `${p.nombres} ${p.apellidos}`.trim(),
      carnet: p.codigoEstudiantil,
      tipo: (p.tipoPersona === 'Estudiante' ? 'Estudiante' : 'Personal') as TipoPersona,
      rol: 'Estudiante',
      carreraOArea: p.carreraOArea,
      correo: p.correo,
      ultimaActividad: new Date(p.fechaRegistro).toLocaleDateString(),
      estado: p.estado ? 'Activo' : 'Inactivo',
      tieneFotoReferencia: p.tieneFotoReferencia,
      fechaRegistro: new Date(p.fechaRegistro).toLocaleDateString(),
    };
  },

  toggleEstadoPersona: async (id: string): Promise<Persona> => {
    const getResp = await apiClient.get<RespuestaEnvuelta<PersonaBackendDto>>(`/personas/${id}`);
    const actual = getResp.data.datos!;
    const nuevoEstado = !actual.estado;

    const resp = await apiClient.put<RespuestaEnvuelta<PersonaBackendDto>>(`/personas/${id}`, {
      nombres: actual.nombres,
      apellidos: actual.apellidos,
      tipoPersona: actual.tipoPersona,
      carreraOArea: actual.carreraOArea,
      correo: actual.correo,
      estado: nuevoEstado,
    });
    
    const p = resp.data.datos!;
    return {
      id: p.id,
      nombre: `${p.nombres} ${p.apellidos}`.trim(),
      carnet: p.codigoEstudiantil,
      tipo: (p.tipoPersona === 'Estudiante' ? 'Estudiante' : 'Personal') as TipoPersona,
      rol: 'Estudiante',
      carreraOArea: p.carreraOArea,
      correo: p.correo,
      ultimaActividad: new Date(p.fechaRegistro).toLocaleDateString(),
      estado: p.estado ? 'Activo' : 'Inactivo',
      tieneFotoReferencia: p.tieneFotoReferencia,
      fechaRegistro: new Date(p.fechaRegistro).toLocaleDateString(),
    };
  },

  eliminarPersona: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/personas/${id}`);
    return true;
  },
};
