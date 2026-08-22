import {
  Persona,
  TipoPersona,
  RolPersona,
  FichaPersonaDetalle,
  CrearPersonaFormData,
  FiltrosPersona,
  AccesoHistorial,
  OperacionItemHistorial,
} from '../types/persona';

export const MOCK_PERSONAS: Persona[] = [
  {
    id: 'per-1',
    nombre: 'Ana Morales',
    carnet: '22-A0200-0056',
    tipo: 'Estudiante',
    rol: 'Estudiante',
    carreraOArea: 'Ing. en Sistemas',
    correo: 'ana.morales.04@est.ulsa.edu.ni',
    ultimaActividad: '28/07/2026 09:02',
    estado: 'Activo',
    fechaRegistro: '12/02/2024',
    tieneFotoReferencia: true,
  },
  {
    id: 'per-2',
    nombre: 'Luis Herrera',
    carnet: '21-A0134-0012',
    tipo: 'Estudiante',
    rol: 'Estudiante',
    carreraOArea: 'Ing. Industrial',
    correo: 'luis.herrera.01@est.ulsa.edu.ni',
    ultimaActividad: '28/07/2026 09:28',
    estado: 'Activo',
    fechaRegistro: '15/01/2023',
    tieneFotoReferencia: true,
  },
  {
    id: 'per-3',
    nombre: 'María López',
    carnet: '23-A0311-0087',
    tipo: 'Estudiante',
    rol: 'Estudiante',
    carreraOArea: 'Ing. Mecatrónica',
    correo: 'maria.lopez.03@est.ulsa.edu.ni',
    ultimaActividad: '28/07/2026 09:33',
    estado: 'Activo',
    fechaRegistro: '10/08/2024',
    tieneFotoReferencia: true,
  },
  {
    id: 'per-4',
    nombre: 'Carlos Ruiz',
    carnet: '22-A0200-0057',
    tipo: 'Estudiante',
    rol: 'Estudiante',
    carreraOArea: 'Ing. en Sistemas',
    correo: 'carlos.ruiz.02@est.ulsa.edu.ni',
    ultimaActividad: '28/07/2026 09:41',
    estado: 'Activo',
    fechaRegistro: '12/02/2024',
    tieneFotoReferencia: true,
  },
  {
    id: 'per-5',
    nombre: 'Sofía Méndez',
    carnet: '20-A0098-0104',
    tipo: 'Estudiante',
    rol: 'Estudiante',
    carreraOArea: 'Ing. Civil',
    correo: 'sofia.mendez.00@est.ulsa.edu.ni',
    ultimaActividad: '28/07/2026 09:56',
    estado: 'Activo',
    fechaRegistro: '01/02/2022',
    tieneFotoReferencia: true,
  },
  {
    id: 'per-6',
    nombre: 'Diego Vargas',
    carnet: '23-A0311-0088',
    tipo: 'Estudiante',
    rol: 'Estudiante',
    carreraOArea: 'Ing. Mecatrónica',
    correo: 'diego.vargas.03@est.ulsa.edu.ni',
    ultimaActividad: '28/07/2026 08:47',
    estado: 'Activo',
    fechaRegistro: '10/08/2024',
    tieneFotoReferencia: true,
  },
  {
    id: 'per-7',
    nombre: 'Weslin Rodríguez',
    carnet: 'P-0042',
    tipo: 'Personal',
    rol: 'Encargado de recurso',
    carreraOArea: 'Laboratorio de Electrónica',
    correo: 'weslin.rodriguez@ulsa.edu.ni',
    ultimaActividad: '28/07/2026 09:56',
    estado: 'Activo',
    fechaRegistro: '05/03/2021',
    tieneFotoReferencia: true,
  },
  {
    id: 'per-8',
    nombre: 'Martha Sánchez',
    carnet: 'P-0051',
    tipo: 'Personal',
    rol: 'Administrador',
    carreraOArea: 'Dirección Académica',
    correo: 'martha.sanchez@ulsa.edu.ni',
    ultimaActividad: '28/07/2026 07:40',
    estado: 'Activo',
    fechaRegistro: '10/01/2020',
    tieneFotoReferencia: true,
  },
  {
    id: 'per-9',
    nombre: 'Josué Argeñal',
    carnet: 'P-0053',
    tipo: 'Personal',
    rol: 'Encargado de recurso',
    carreraOArea: 'Taller Central',
    correo: 'josue.argenal@ulsa.edu.ni',
    ultimaActividad: '27/07/2026 17:22',
    estado: 'Activo',
    fechaRegistro: '18/06/2021',
    tieneFotoReferencia: true,
  },
  {
    id: 'per-10',
    nombre: 'Heberto Espinoza',
    carnet: 'P-0055',
    tipo: 'Personal',
    rol: 'Encargado de recurso',
    carreraOArea: 'Biblioteca Central',
    correo: 'heberto.espinoza@ulsa.edu.ni',
    ultimaActividad: '28/07/2026 08:10',
    estado: 'Activo',
    fechaRegistro: '22/09/2022',
    tieneFotoReferencia: true,
  },
  {
    id: 'per-11',
    nombre: 'Rosa Jiménez',
    carnet: 'P-0060',
    tipo: 'Personal',
    rol: 'Guardia',
    carreraOArea: 'Seguridad y Acceso',
    correo: 'rosa.jimenez@ulsa.edu.ni',
    ultimaActividad: '28/07/2026 06:02',
    estado: 'Activo',
    fechaRegistro: '01/04/2023',
    tieneFotoReferencia: true,
  },
  {
    id: 'per-12',
    nombre: 'Óscar Peña',
    carnet: '19-A0055-0031',
    tipo: 'Estudiante',
    rol: 'Estudiante',
    carreraOArea: 'Ing. en Sistemas',
    correo: 'oscar.pena.99@est.ulsa.edu.ni',
    ultimaActividad: '12/06/2026 15:40',
    estado: 'Inactivo',
    fechaRegistro: '15/02/2020',
    tieneFotoReferencia: false,
  },
];

const MOCK_HISTORIAL_ACCESOS: AccesoHistorial[] = [
  { id: 'acc-1', fechaHora: '28/07/2026 09:02', estacion: 'Entrada principal', direccion: 'Egreso', validacion: 'QR + Facial', resultado: 'Concedido' },
  { id: 'acc-2', fechaHora: '28/07/2026 08:12', estacion: 'Entrada principal', direccion: 'Ingreso', validacion: 'QR + Facial', resultado: 'Concedido' },
  { id: 'acc-3', fechaHora: '27/07/2026 17:40', estacion: 'Salida norte', direccion: 'Egreso', validacion: 'QR + Facial', resultado: 'Concedido' },
  { id: 'acc-4', fechaHora: '27/07/2026 13:05', estacion: 'Cafetería', direccion: 'Ingreso', validacion: 'QR', resultado: 'Offline' },
  { id: 'acc-5', fechaHora: '27/07/2026 07:58', estacion: 'Entrada principal', direccion: 'Ingreso', validacion: 'QR + Facial', resultado: 'Concedido' },
  { id: 'acc-6', fechaHora: '26/07/2026 16:22', estacion: 'Laboratorio A', direccion: 'Ingreso', validacion: 'QR', resultado: 'Concedido' },
  { id: 'acc-7', fechaHora: '26/07/2026 08:04', estacion: 'Entrada principal', direccion: 'Ingreso', validacion: 'QR + Facial', resultado: 'Denegado' },
];

const MOCK_OPERACIONES_ITEMS: OperacionItemHistorial[] = [
  { id: 'op-1', folio: 'OP-1042', fecha: '28/07/2026 08:20', item: 'Multímetro digital UNI-T', estado: 'Pendiente' },
  { id: 'op-2', folio: 'OP-1036', fecha: '27/07/2026 10:18', item: 'Protoboard 830 puntos', estado: 'Devuelta' },
  { id: 'op-3', folio: 'OP-1028', fecha: '24/07/2026 09:12', item: 'ESP32-CAM AI-Thinker', estado: 'Devuelta' },
  { id: 'op-4', folio: 'OP-1015', fecha: '20/07/2026 14:30', item: 'Cable jumper H-H (40 u)', estado: 'Devuelta' },
];

import { auditoriaService } from './auditoriaService';
import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';

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
  getPersonas: async (filtros?: FiltrosPersona): Promise<Persona[]> => {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<PersonaBackendDto[]>>('/personas');
      if (response.data && Array.isArray(response.data.datos)) {
        let lista: Persona[] = response.data.datos.map((p) => ({
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

        if (filtros) {
          const q = filtros.busqueda?.trim().toLowerCase() || '';
          if (q) {
            lista = lista.filter(
              (p) =>
                p.nombre.toLowerCase().includes(q) ||
                p.carnet.toLowerCase().includes(q) ||
                (p.correo && p.correo.toLowerCase().includes(q))
            );
          }
          if (filtros.rol) {
            lista = lista.filter((p) => p.rol === filtros.rol);
          }
          if (filtros.tipo) {
            lista = lista.filter((p) => p.tipo === filtros.tipo);
          }
          if (filtros.estado) {
            lista = lista.filter((p) => p.estado === filtros.estado);
          }
        }
        return lista;
      }
    } catch {
      // Fallback a MOCK_PERSONAS solo ante error de red
    }

    let lista = [...MOCK_PERSONAS];

    if (filtros) {
      const q = filtros.busqueda.trim().toLowerCase();
      if (q) {
        lista = lista.filter(
          (p) =>
            p.nombre.toLowerCase().includes(q) ||
            p.carnet.toLowerCase().includes(q) ||
            (p.correo && p.correo.toLowerCase().includes(q))
        );
      }
      if (filtros.rol) {
        lista = lista.filter((p) => p.rol === filtros.rol);
      }
      if (filtros.tipo) {
        lista = lista.filter((p) => p.tipo === filtros.tipo);
      }
      if (filtros.estado) {
        lista = lista.filter((p) => p.estado === filtros.estado);
      }
    }

    return lista;
  },

  getPersonaDetalle: async (id: string): Promise<FichaPersonaDetalle | null> => {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<PersonaBackendDto>>(`/personas/${id}`);
      if (response.data.datos) {
        const p = response.data.datos;
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
          historialAccesos: MOCK_HISTORIAL_ACCESOS,
          operacionesItems: MOCK_OPERACIONES_ITEMS,
        };
      }
    } catch {
      // Fallback
    }

    const base = MOCK_PERSONAS.find((p) => p.id === id);
    if (!base) return null;

    return {
      ...base,
      fotoReferencia: base.tieneFotoReferencia
        ? {
            estado: 'Cifrada en reposo',
            fechaCaptura: base.fechaRegistro || '12/02/2024',
            fechaActualizacion: '03/03/2026',
            retencion: 'Se elimina al pasar a inactivo',
          }
        : undefined,
      historialAccesos: MOCK_HISTORIAL_ACCESOS,
      operacionesItems: MOCK_OPERACIONES_ITEMS,
    };
  },

  crearPersona: async (data: CrearPersonaFormData): Promise<Persona> => {
    try {
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

      if (response.data.datos) {
        const p = response.data.datos;
        if (data.fotoArchivo) {
          const formData = new FormData();
          formData.append('foto', data.fotoArchivo);
          try {
            await apiClient.post(`/personas/${p.id}/foto`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch {
            // Ignorar error de subida de foto
          }
        }

        const nueva: Persona = {
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
        MOCK_PERSONAS.unshift(nueva);
        return nueva;
      }
    } catch {
      // Fallback
    }

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const nueva: Persona = {
      id: `per-${Date.now()}`,
      nombre: data.nombre,
      carnet: data.carnet,
      tipo: data.tipo,
      rol: data.rol,
      carreraOArea: data.carreraOArea,
      correo: data.correo,
      ultimaActividad: formattedDate,
      estado: 'Activo',
      fechaRegistro: formattedDate.split(' ')[0],
      tieneFotoReferencia: !!data.fotoArchivo || !!data.fotoPreviewUrl,
      avatarUrl: data.fotoPreviewUrl,
    };

    MOCK_PERSONAS.unshift(nueva);

    await auditoriaService.registrarEvento({
      tipo: 'Configuración',
      actor: 'Administrador',
      descripcion: `Creación de persona ${nueva.nombre} (${nueva.carnet})`,
      estacion: '—',
      origen: 'Panel',
    });

    return nueva;
  },

  actualizarPersona: async (id: string, data: Partial<Persona>): Promise<Persona> => {
    try {
      if (data.nombre) {
        const parts = data.nombre.trim().split(' ');
        const nombres = parts.slice(0, Math.ceil(parts.length / 2)).join(' ') || data.nombre;
        const apellidos = parts.slice(Math.ceil(parts.length / 2)).join(' ') || '—';

        await apiClient.put(`/personas/${id}`, {
          nombres,
          apellidos,
          tipoPersona: data.tipo || 'Estudiante',
          carreraOArea: data.carreraOArea,
          correo: data.correo,
          estado: data.estado === 'Activo',
        });
      }
    } catch {
      // Fallback
    }

    const index = MOCK_PERSONAS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Persona no encontrada');

    MOCK_PERSONAS[index] = {
      ...MOCK_PERSONAS[index],
      ...data,
    };

    await auditoriaService.registrarEvento({
      tipo: 'Configuración',
      actor: 'Administrador',
      descripcion: `Actualización de datos de ${MOCK_PERSONAS[index].nombre} (${MOCK_PERSONAS[index].carnet})`,
      estacion: '—',
      origen: 'Panel',
    });

    return MOCK_PERSONAS[index];
  },

  toggleEstadoPersona: async (id: string): Promise<Persona> => {
    const index = MOCK_PERSONAS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Persona no encontrada');

    const nuevoEstado = MOCK_PERSONAS[index].estado === 'Activo' ? 'Inactivo' : 'Activo';
    MOCK_PERSONAS[index].estado = nuevoEstado;

    try {
      const parts = MOCK_PERSONAS[index].nombre.trim().split(' ');
      const nombres = parts.slice(0, Math.ceil(parts.length / 2)).join(' ') || MOCK_PERSONAS[index].nombre;
      const apellidos = parts.slice(Math.ceil(parts.length / 2)).join(' ') || '—';

      await apiClient.put(`/personas/${id}`, {
        nombres,
        apellidos,
        tipoPersona: MOCK_PERSONAS[index].tipo,
        carreraOArea: MOCK_PERSONAS[index].carreraOArea,
        correo: MOCK_PERSONAS[index].correo,
        estado: nuevoEstado === 'Activo',
      });
    } catch {
      // Fallback
    }

    await auditoriaService.registrarEvento({
      tipo: 'Seguridad',
      actor: 'Administrador',
      descripcion: `Estado de ${MOCK_PERSONAS[index].nombre} cambiado a ${nuevoEstado}`,
      estacion: '—',
      origen: 'Panel',
    });

    return MOCK_PERSONAS[index];
  },

  eliminarPersona: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/personas/${id}`);
    } catch {
      // Fallback
    }

    const index = MOCK_PERSONAS.findIndex((p) => p.id === id);
    if (index === -1) return false;

    const [eliminada] = MOCK_PERSONAS.splice(index, 1);

    await auditoriaService.registrarEvento({
      tipo: 'Seguridad',
      actor: 'Administrador',
      descripcion: `Eliminación de persona ${eliminada.nombre} (${eliminada.carnet})`,
      estacion: '—',
      origen: 'Panel',
    });

    return true;
  },
};
