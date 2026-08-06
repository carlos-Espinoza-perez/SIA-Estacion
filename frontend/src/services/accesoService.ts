import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';
import { ResultadoAcceso } from '../components/atoms/ResultadoBadge/ResultadoBadge';

export interface AccesoRow {
  id: string;
  fechaHora: string;
  persona: string;
  carnet: string;
  estacion: string;
  direccion: string;
  validacion: string;
  resultado: ResultadoAcceso;
  fotoUrl?: string;
}

export interface FiltrosAcceso {
  busqueda?: string;
  estacion?: string;
  resultado?: string;
  fecha?: string;
}

interface ReporteAccesoBackendDto {
  fechaHora: string;
  personaNombre: string;
  codigoEstudiantil: string;
  estacionNombre: string;
  direccion: string;
  modoValidacion: string;
  resultado: string;
  esOffline: boolean;
  fotoEvidenciaUrl?: string;
}

export const MOCK_ACCESOS: AccesoRow[] = [
  { id: '1',  fechaHora: '28/07/2026 08:12', persona: 'Ana Morales',    carnet: '22-A0200-0056', estacion: 'Entrada principal', direccion: 'Ingreso', validacion: 'QR + Facial', resultado: 'Concedido' },
  { id: '2',  fechaHora: '28/07/2026 08:14', persona: 'Luis Herrera',   carnet: '21-A0134-0012', estacion: 'Entrada principal', direccion: 'Ingreso', validacion: 'QR + Facial', resultado: 'Concedido' },
  { id: '3',  fechaHora: '28/07/2026 08:19', persona: 'María López',    carnet: '23-A0311-0087', estacion: 'Laboratorio A',    direccion: 'Ingreso', validacion: 'QR',           resultado: 'Concedido' },
  { id: '4',  fechaHora: '28/07/2026 08:23', persona: 'Carlos Ruiz',    carnet: '22-A0200-0057', estacion: 'Entrada principal', direccion: 'Ingreso', validacion: 'QR + Facial', resultado: 'Denegado'  },
  { id: '5',  fechaHora: '28/07/2026 08:31', persona: 'Sofía Méndez',   carnet: '20-A0098-0104', estacion: 'Biblioteca',       direccion: 'Ingreso', validacion: 'QR',           resultado: 'Concedido' },
  { id: '6',  fechaHora: '28/07/2026 08:47', persona: 'Diego Vargas',   carnet: '23-A0311-0088', estacion: 'Taller',           direccion: 'Ingreso', validacion: 'QR + Facial', resultado: 'Concedido' },
  { id: '7',  fechaHora: '28/07/2026 09:02', persona: 'Ana Morales',    carnet: '22-A0200-0056', estacion: 'Entrada principal', direccion: 'Egreso',  validacion: 'QR + Facial', resultado: 'Concedido' },
  { id: '8',  fechaHora: '28/07/2026 09:15', persona: 'No identificado',carnet: '22-A0200-0061', estacion: 'Salida norte',     direccion: 'Ingreso', validacion: 'QR',           resultado: 'Denegado'  },
  { id: '9',  fechaHora: '28/07/2026 09:28', persona: 'Luis Herrera',   carnet: '21-A0134-0012', estacion: 'Cafetería',        direccion: 'Ingreso', validacion: 'QR',           resultado: 'Offline'   },
  { id: '10', fechaHora: '28/07/2026 09:33', persona: 'María López',    carnet: '23-A0311-0087', estacion: 'Cafetería',        direccion: 'Ingreso', validacion: 'QR',           resultado: 'Offline'   },
  { id: '11', fechaHora: '28/07/2026 09:41', persona: 'Carlos Ruiz',    carnet: '22-A0200-0057', estacion: 'Biblioteca',       direccion: 'Egreso',  validacion: 'QR + Facial', resultado: 'Concedido' },
  { id: '12', fechaHora: '28/07/2026 09:56', persona: 'Sofía Méndez',   carnet: '20-A0098-0104', estacion: 'Entrada principal', direccion: 'Egreso',  validacion: 'QR + Facial', resultado: 'Concedido' },
];

function mapResultado(res: string, esOffline: boolean): ResultadoAcceso {
  if (esOffline) return 'Offline';
  switch (res) {
    case 'Concedido':
    case 'Permitido':
      return 'Concedido';
    case 'Denegado':
    case 'Rechazado':
      return 'Denegado';
    case 'Pendiente':
      return 'Pendiente';
    default:
      return 'Concedido';
  }
}

export const accesoService = {
  async getAccesos(filtros?: FiltrosAcceso): Promise<AccesoRow[]> {
    try {
      const hoy = new Date();
      const hace30Dias = new Date();
      hace30Dias.setDate(hoy.getDate() - 30);

      const params = new URLSearchParams({
        desde: hace30Dias.toISOString(),
        hasta: hoy.toISOString(),
      });

      const response = await apiClient.get<RespuestaEnvuelta<ReporteAccesoBackendDto[]>>(
        `/reportes/accesos?${params.toString()}`
      );

      if (response.data.datos && response.data.datos.length > 0) {
        return response.data.datos.map((a, idx) => ({
          id: `acc-${idx}-${new Date(a.fechaHora).getTime()}`,
          fechaHora: new Date(a.fechaHora).toLocaleString('es-NI', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          persona: a.personaNombre || 'No identificado',
          carnet: a.codigoEstudiantil || '—',
          estacion: a.estacionNombre || 'Entrada principal',
          direccion: a.direccion === 'Ingreso' || a.direccion === 'Entrada' ? 'Ingreso' : 'Egreso',
          validacion: a.modoValidacion || 'QR + Facial',
          resultado: mapResultado(a.resultado, a.esOffline),
          fotoUrl: a.fotoEvidenciaUrl,
        }));
      }
    } catch {
      // Fallback local a MOCK_ACCESOS
    }

    let resultado = [...MOCK_ACCESOS];
    if (filtros?.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (r) =>
          r.persona.toLowerCase().includes(q) ||
          r.carnet.toLowerCase().includes(q)
      );
    }
    if (filtros?.estacion) {
      resultado = resultado.filter((r) => r.estacion === filtros.estacion);
    }
    if (filtros?.resultado) {
      resultado = resultado.filter((r) => r.resultado === filtros.resultado);
    }

    return resultado;
  },

  async getPresenciaActual() {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<any>>('/reportes/presencia');
      return response.data.datos;
    } catch {
      return null;
    }
  },
};
