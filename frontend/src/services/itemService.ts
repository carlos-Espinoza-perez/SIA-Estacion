import {
  Item,
  EstadoItem,
  TipoItem,
  CrearItemFormData,
  CrearTipoItemFormData,
  FiltrosItem,
  FiltrosTipoItem,
} from '../types/item';

export const MOCK_ITEMS: Item[] = [
  {
    id: 'it-1',
    codigo: 'IT-0101',
    nombre: 'Multímetro digital UNI-T UT33D',
    tipo: 'Equipo de laboratorio',
    estacion: 'Laboratorio A',
    estado: 'Prestado',
    unidades: 1,
  },
  {
    id: 'it-2',
    codigo: 'IT-0102',
    nombre: 'Osciloscopio Rigol DS1054Z',
    tipo: 'Equipo de laboratorio',
    estacion: 'Taller',
    estado: 'Prestado',
    unidades: 1,
  },
  {
    id: 'it-3',
    codigo: 'IT-0103',
    nombre: 'Kit Arduino UNO R3',
    tipo: 'Componentes electrónicos',
    estacion: 'Laboratorio A',
    estado: 'Disponible',
    unidades: 5,
  },
  {
    id: 'it-4',
    codigo: 'IT-0104',
    nombre: 'ESP32 DevKit V1',
    tipo: 'Componentes electrónicos',
    estacion: 'Laboratorio A',
    estado: 'Prestado',
    unidades: 3,
  },
  {
    id: 'it-5',
    codigo: 'IT-0105',
    nombre: 'ESP32-CAM AI-Thinker',
    tipo: 'Componentes electrónicos',
    estacion: 'Laboratorio A',
    estado: 'Disponible',
    unidades: 2,
  },
  {
    id: 'it-6',
    codigo: 'IT-0106',
    nombre: 'Pantalla TFT táctil 3.5"',
    tipo: 'Componentes electrónicos',
    estacion: 'Laboratorio A',
    estado: 'Prestado',
    unidades: 1,
  },
  {
    id: 'it-7',
    codigo: 'IT-0107',
    nombre: 'Protoboard 830 puntos',
    tipo: 'Componentes electrónicos',
    estacion: 'Laboratorio A',
    estado: 'Disponible',
    unidades: 10,
  },
  {
    id: 'it-8',
    codigo: 'IT-0108',
    nombre: 'Fuente regulada 30 V / 5 A',
    tipo: 'Equipo de laboratorio',
    estacion: 'Taller',
    estado: 'Mantenimiento',
    unidades: 1,
  },
  {
    id: 'it-9',
    codigo: 'IT-0109',
    nombre: 'Cable HDMI 2 m',
    tipo: 'Componentes electrónicos',
    estacion: 'Laboratorio B',
    estado: 'Disponible',
    unidades: 8,
  },
  {
    id: 'it-10',
    codigo: 'IT-0110',
    nombre: 'Redes de computadoras',
    tipo: 'Material bibliográfico',
    estacion: 'Biblioteca',
    estado: 'Prestado',
    unidades: 2,
  },
  {
    id: 'it-11',
    codigo: 'IT-0111',
    nombre: 'Sistemas embebidos con ARM',
    tipo: 'Material bibliográfico',
    estacion: 'Biblioteca',
    estado: 'Disponible',
    unidades: 3,
  },
  {
    id: 'it-12',
    codigo: 'IT-0112',
    nombre: 'Juego de destornilladores',
    tipo: 'Equipo de laboratorio',
    estacion: 'Taller',
    estado: 'Perdido',
    unidades: 1,
  },
];

export const MOCK_TIPOS_ITEM: TipoItem[] = [
  {
    id: 'tip-1',
    nombre: 'Equipo de laboratorio',
    descripcion: 'Instrumentos de medición y bancos de prueba',
    itemsRegistrados: 24,
    requiereAprobacion: 'Sí',
    estado: 'Activo',
  },
  {
    id: 'tip-2',
    nombre: 'Componentes electrónicos',
    descripcion: 'Módulos, placas y elementos discretos',
    itemsRegistrados: 138,
    requiereAprobacion: 'Sí',
    estado: 'Activo',
  },
  {
    id: 'tip-3',
    nombre: 'Material bibliográfico',
    descripcion: 'Libros y publicaciones de consulta',
    itemsRegistrados: 412,
    requiereAprobacion: 'No',
    estado: 'Activo',
  },
  {
    id: 'tip-4',
    nombre: 'Consumibles',
    descripcion: 'Material de uso único, no implementado aún',
    itemsRegistrados: 0,
    requiereAprobacion: '—',
    estado: 'Inactivo',
  },
  {
    id: 'tip-5',
    nombre: 'Mobiliario',
    descripcion: 'Activos fijos del recinto',
    itemsRegistrados: 6,
    requiereAprobacion: 'Sí',
    estado: 'Inactivo',
  },
];

import { auditoriaService } from './auditoriaService';
import { apiClient } from './apiClient';
import { RespuestaEnvuelta } from '../types/api';

interface ItemBackendDto {
  id: string;
  codigo: string;
  nombre: string;
  tipoItemId: string;
  tipoItemNombre?: string;
  estacionId?: string;
  estacionNombre?: string;
  estadoActual: string;
  unidades?: number;
  observaciones?: string;
}

interface TipoItemBackendDto {
  id: string;
  nombre: string;
  descripcion?: string;
  requiereAprobacion?: boolean;
  estado: boolean;
}

export const itemService = {
  getItems: async (filtros?: FiltrosItem): Promise<Item[]> => {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<ItemBackendDto[]>>('/items');
      if (response.data.datos && response.data.datos.length > 0) {
        let lista: Item[] = response.data.datos.map((it) => ({
          id: it.id,
          codigo: it.codigo,
          nombre: it.nombre,
          tipo: it.tipoItemNombre || it.tipoItemId,
          estacion: it.estacionNombre || 'Laboratorio A',
          estado: (it.estadoActual as EstadoItem) || 'Disponible',
          unidades: it.unidades || 1,
          observaciones: it.observaciones,
        }));

        if (filtros) {
          const q = filtros.busqueda.trim().toLowerCase();
          if (q) {
            lista = lista.filter(
              (i) =>
                i.nombre.toLowerCase().includes(q) ||
                i.codigo.toLowerCase().includes(q)
            );
          }
          if (filtros.tipo) {
            lista = lista.filter((i) => i.tipo === filtros.tipo);
          }
          if (filtros.estacion) {
            lista = lista.filter((i) => i.estacion === filtros.estacion);
          }
          if (filtros.estado) {
            lista = lista.filter((i) => i.estado === filtros.estado);
          }
        }
        return lista;
      }
    } catch {
      // Fallback
    }

    let lista = [...MOCK_ITEMS];

    if (filtros) {
      const q = filtros.busqueda.trim().toLowerCase();
      if (q) {
        lista = lista.filter(
          (i) =>
            i.nombre.toLowerCase().includes(q) ||
            i.codigo.toLowerCase().includes(q)
        );
      }
      if (filtros.tipo) {
        lista = lista.filter((i) => i.tipo === filtros.tipo);
      }
      if (filtros.estacion) {
        lista = lista.filter((i) => i.estacion === filtros.estacion);
      }
      if (filtros.estado) {
        lista = lista.filter((i) => i.estado === filtros.estado);
      }
    }

    return lista;
  },

  getTiposItem: async (filtros?: FiltrosTipoItem): Promise<TipoItem[]> => {
    try {
      const response = await apiClient.get<RespuestaEnvuelta<TipoItemBackendDto[]>>('/items/tipos');
      if (response.data.datos && response.data.datos.length > 0) {
        let lista: TipoItem[] = response.data.datos.map((t) => ({
          id: t.id,
          nombre: t.nombre,
          descripcion: t.descripcion || 'Sin descripción',
          itemsRegistrados: 0,
          requiereAprobacion: t.requiereAprobacion ? 'Sí' : 'No',
          estado: t.estado ? 'Activo' : 'Inactivo',
        }));

        if (filtros) {
          const q = filtros.busqueda.trim().toLowerCase();
          if (q) {
            lista = lista.filter(
              (t) =>
                t.nombre.toLowerCase().includes(q) ||
                t.descripcion.toLowerCase().includes(q)
            );
          }
          if (filtros.estado) {
            lista = lista.filter((t) => t.estado === filtros.estado);
          }
        }
        return lista;
      }
    } catch {
      // Fallback
    }

    let lista = [...MOCK_TIPOS_ITEM];

    if (filtros) {
      const q = filtros.busqueda.trim().toLowerCase();
      if (q) {
        lista = lista.filter(
          (t) =>
            t.nombre.toLowerCase().includes(q) ||
            t.descripcion.toLowerCase().includes(q)
        );
      }
      if (filtros.estado) {
        lista = lista.filter((t) => t.estado === filtros.estado);
      }
    }

    return lista;
  },

  crearItem: async (data: CrearItemFormData): Promise<Item> => {
    try {
      const response = await apiClient.post<RespuestaEnvuelta<ItemBackendDto>>('/items', {
        codigoInterno: data.codigo,
        nombre: data.nombre,
        descripcion: data.observaciones,
        cantidadDisponible: data.unidades,
        tipoItemId: '00000000-0000-0000-0000-000000000001',
      });

      if (response.data.datos) {
        const itemBackend = response.data.datos;
        const nuevo: Item = {
          id: itemBackend.id,
          codigo: itemBackend.codigo || data.codigo,
          nombre: itemBackend.nombre,
          tipo: itemBackend.tipoItemNombre || data.tipo,
          estacion: itemBackend.estacionNombre || data.estacion,
          estado: data.estadoInicial,
          unidades: itemBackend.unidades || data.unidades,
          observaciones: itemBackend.observaciones || data.observaciones,
        };
        MOCK_ITEMS.unshift(nuevo);
        return nuevo;
      }
    } catch {
      // Fallback local
    }

    const nuevo: Item = {
      id: `it-${Date.now()}`,
      codigo: data.codigo,
      nombre: data.nombre,
      tipo: data.tipo,
      estacion: data.estacion,
      estado: data.estadoInicial,
      unidades: data.unidades,
      observaciones: data.observaciones,
    };
    MOCK_ITEMS.unshift(nuevo);

    // Incrementar conteo en categoría
    const cat = MOCK_TIPOS_ITEM.find((t) => t.nombre === data.tipo);
    if (cat) cat.itemsRegistrados = (cat.itemsRegistrados || 0) + 1;

    // Registrar en auditoría
    await auditoriaService.registrarEvento({
      tipo: 'Ítem',
      actor: 'Administrador',
      descripcion: `Creación de ítem ${nuevo.codigo} - ${nuevo.nombre}`,
      estacion: nuevo.estacion,
      origen: 'Panel',
    });

    return nuevo;
  },

  actualizarItem: async (id: string, data: Partial<Item>): Promise<Item> => {
    try {
      if (data.nombre || data.codigo) {
        await apiClient.put(`/items/${id}`, {
          codigoInterno: data.codigo,
          nombre: data.nombre,
          descripcion: data.observaciones,
          cantidadDisponible: data.unidades,
        });
      }
    } catch {
      // Fallback
    }

    const index = MOCK_ITEMS.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Ítem no encontrado');

    MOCK_ITEMS[index] = { ...MOCK_ITEMS[index], ...data };

    await auditoriaService.registrarEvento({
      tipo: 'Ítem',
      actor: 'Administrador',
      descripcion: `Actualización de ítem ${MOCK_ITEMS[index].codigo} - ${MOCK_ITEMS[index].nombre}`,
      estacion: MOCK_ITEMS[index].estacion,
      origen: 'Panel',
    });

    return MOCK_ITEMS[index];
  },

  cambiarEstadoItem: async (id: string, estado: Item['estado']): Promise<Item> => {
    const index = MOCK_ITEMS.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Ítem no encontrado');

    MOCK_ITEMS[index].estado = estado;

    await auditoriaService.registrarEvento({
      tipo: 'Ítem',
      actor: 'Administrador',
      descripcion: `Estado de ítem ${MOCK_ITEMS[index].codigo} cambiado a ${estado}`,
      estacion: MOCK_ITEMS[index].estacion,
      origen: 'Panel',
    });

    return MOCK_ITEMS[index];
  },

  eliminarItem: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/items/${id}`);
    } catch {
      // Fallback
    }

    const index = MOCK_ITEMS.findIndex((i) => i.id === id);
    if (index === -1) return false;

    const [eliminado] = MOCK_ITEMS.splice(index, 1);

    const cat = MOCK_TIPOS_ITEM.find((t) => t.nombre === eliminado.tipo);
    if (cat && cat.itemsRegistrados > 0) cat.itemsRegistrados -= 1;

    await auditoriaService.registrarEvento({
      tipo: 'Ítem',
      actor: 'Administrador',
      descripcion: `Eliminación de ítem ${eliminado.codigo} - ${eliminado.nombre}`,
      estacion: eliminado.estacion,
      origen: 'Panel',
    });

    return true;
  },

  crearTipoItem: async (data: CrearTipoItemFormData): Promise<TipoItem> => {
    try {
      const response = await apiClient.post<RespuestaEnvuelta<TipoItemBackendDto>>('/tipos-items', {
        nombre: data.nombre,
        descripcion: data.descripcion,
        requiereAprobacion: data.flujoPorDefecto === 'Requiere aprobación',
      });

      if (response.data.datos) {
        const tBackend = response.data.datos;
        const nuevo: TipoItem = {
          id: tBackend.id,
          nombre: tBackend.nombre,
          descripcion: tBackend.descripcion || data.descripcion,
          itemsRegistrados: 0,
          requiereAprobacion: tBackend.requiereAprobacion ? 'Sí' : 'No',
          estado: 'Activo',
          estaciones: data.estaciones,
        };
        MOCK_TIPOS_ITEM.unshift(nuevo);
        return nuevo;
      }
    } catch {
      // Fallback
    }

    const nuevo: TipoItem = {
      id: `tip-${Date.now()}`,
      nombre: data.nombre,
      descripcion: data.descripcion,
      itemsRegistrados: 0,
      requiereAprobacion: data.flujoPorDefecto === 'Requiere aprobación' ? 'Sí' : 'No',
      estado: data.activo ? 'Activo' : 'Inactivo',
      estaciones: data.estaciones,
    };
    MOCK_TIPOS_ITEM.unshift(nuevo);

    await auditoriaService.registrarEvento({
      tipo: 'Configuración',
      actor: 'Administrador',
      descripcion: `Creación de tipo de ítem "${nuevo.nombre}"`,
      estacion: '—',
      origen: 'Panel',
    });

    return nuevo;
  },

  actualizarTipoItem: async (id: string, data: Partial<TipoItem>): Promise<TipoItem> => {
    try {
      if (data.nombre) {
        await apiClient.put(`/tipos-items/${id}`, {
          nombre: data.nombre,
          descripcion: data.descripcion,
          requiereAprobacion: data.requiereAprobacion === 'Sí',
        });
      }
    } catch {
      // Fallback
    }

    const index = MOCK_TIPOS_ITEM.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Tipo no encontrado');

    MOCK_TIPOS_ITEM[index] = { ...MOCK_TIPOS_ITEM[index], ...data };

    await auditoriaService.registrarEvento({
      tipo: 'Configuración',
      actor: 'Administrador',
      descripcion: `Actualización de tipo de ítem "${MOCK_TIPOS_ITEM[index].nombre}"`,
      estacion: '—',
      origen: 'Panel',
    });

    return MOCK_TIPOS_ITEM[index];
  },

  eliminarTipoItem: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/tipos-items/${id}`);
    } catch {
      // Fallback
    }

    const index = MOCK_TIPOS_ITEM.findIndex((t) => t.id === id);
    if (index === -1) return false;

    const [eliminado] = MOCK_TIPOS_ITEM.splice(index, 1);

    await auditoriaService.registrarEvento({
      tipo: 'Configuración',
      actor: 'Administrador',
      descripcion: `Eliminación de tipo de ítem "${eliminado.nombre}"`,
      estacion: '—',
      origen: 'Panel',
    });

    return true;
  },
};
