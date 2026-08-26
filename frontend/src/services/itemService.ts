import {
  Item,
  EstadoItem,
  TipoItem,
  CrearItemFormData,
  CrearTipoItemFormData,
  FiltrosItem,
  FiltrosTipoItem,
} from '../types/item';

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
    const response = await apiClient.get<RespuestaEnvuelta<ItemBackendDto[]>>('/items');
    let lista: Item[] = (response.data?.datos || []).map((it) => ({
      id: it.id,
      codigo: it.codigo,
      nombre: it.nombre,
      tipo: it.tipoItemNombre || it.tipoItemId,
      estacion: it.estacionNombre || 'General',
      estado: (it.estadoActual as EstadoItem) || 'Disponible',
      unidades: it.unidades || 1,
      observaciones: it.observaciones,
    }));

    if (filtros) {
      const q = filtros.busqueda?.trim().toLowerCase() || '';
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
    // Si el filtro es 'Inactivo', traemos todos para poder filtrar; si no, solo activos
    const soloActivos = filtros?.estado !== 'Inactivo';
    const response = await apiClient.get<RespuestaEnvuelta<TipoItemBackendDto[]>>(
      `/tipos-items?soloActivos=${soloActivos}`
    );
    let lista: TipoItem[] = (response.data?.datos || []).map((t) => ({
      id: t.id,
      nombre: t.nombre,
      descripcion: t.descripcion || 'Sin descripción',
      itemsRegistrados: 0,
      requiereAprobacion: t.requiereAprobacion ? 'Sí' : 'No',
      estado: t.estado ? 'Activo' : 'Inactivo',
    }));

    if (filtros) {
      const q = filtros.busqueda?.trim().toLowerCase() || '';
      if (q) {
        lista = lista.filter(
          (t) =>
            t.nombre.toLowerCase().includes(q) ||
            (t.descripcion && t.descripcion.toLowerCase().includes(q))
        );
      }
      if (filtros.estado) {
        lista = lista.filter((t) => t.estado === filtros.estado);
      }
    }
    return lista;
  },

  crearItem: async (data: CrearItemFormData): Promise<Item> => {
    let tipoItemId = data.tipoItemId;
    if (!tipoItemId) {
      const tipos = await itemService.getTiposItem();
      const tipoEncontrado = tipos.find((t) => t.nombre === data.tipo);
      tipoItemId = tipoEncontrado?.id || tipos[0]?.id || '00000000-0000-0000-0000-000000000001';
    }

    const response = await apiClient.post<RespuestaEnvuelta<ItemBackendDto>>('/items', {
      codigoQr: data.codigo,
      nombre: data.nombre,
      observaciones: data.observaciones,
      tipoItemId,
      estacionId: data.estacionId || null,
      esAgrupador: false,
    });

    const itemBackend = response.data.datos!;
    return {
      id: itemBackend.id,
      codigo: itemBackend.codigo || data.codigo,
      nombre: itemBackend.nombre,
      tipo: itemBackend.tipoItemNombre || data.tipo,
      estacion: itemBackend.estacionNombre || data.estacion,
      estado: data.estadoInicial,
      unidades: itemBackend.unidades || data.unidades,
      observaciones: itemBackend.observaciones || data.observaciones,
    };
  },

  actualizarItem: async (id: string, data: Partial<Item>): Promise<Item> => {
    if (data.nombre || data.codigo) {
      await apiClient.put(`/items/${id}`, {
        codigoInterno: data.codigo,
        nombre: data.nombre,
        descripcion: data.observaciones,
        cantidadDisponible: data.unidades,
      });
    }

    const response = await apiClient.get<RespuestaEnvuelta<ItemBackendDto>>(`/items/${id}`);
    const itemBackend = response.data.datos!;

    return {
      id: itemBackend.id,
      codigo: itemBackend.codigo,
      nombre: itemBackend.nombre,
      tipo: itemBackend.tipoItemNombre || itemBackend.tipoItemId,
      estacion: itemBackend.estacionNombre || 'General',
      estado: (itemBackend.estadoActual as EstadoItem) || 'Disponible',
      unidades: itemBackend.unidades || 1,
      observaciones: itemBackend.observaciones,
    };
  },

  cambiarEstadoItem: async (id: string, _estado: Item['estado']): Promise<Item> => {
    // Ideally this hits a backend endpoint to change status
    const response = await apiClient.get<RespuestaEnvuelta<ItemBackendDto>>(`/items/${id}`);
    const itemBackend = response.data.datos!;
    
    return {
      id: itemBackend.id,
      codigo: itemBackend.codigo,
      nombre: itemBackend.nombre,
      tipo: itemBackend.tipoItemNombre || itemBackend.tipoItemId,
      estacion: itemBackend.estacionNombre || 'General',
      estado: (itemBackend.estadoActual as EstadoItem) || 'Disponible',
      unidades: itemBackend.unidades || 1,
      observaciones: itemBackend.observaciones,
    };
  },

  eliminarItem: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/items/${id}`);
    return true;
  },

  crearTipoItem: async (data: CrearTipoItemFormData): Promise<TipoItem> => {
    const response = await apiClient.post<RespuestaEnvuelta<TipoItemBackendDto>>('/tipos-items', {
      nombre: data.nombre,
      descripcion: data.descripcion,
      requiereAprobacion: data.flujoPorDefecto === 'Requiere aprobación',
    });

    const tBackend = response.data.datos!;
    return {
      id: tBackend.id,
      nombre: tBackend.nombre,
      descripcion: tBackend.descripcion || data.descripcion,
      itemsRegistrados: 0,
      requiereAprobacion: tBackend.requiereAprobacion ? 'Sí' : 'No',
      estado: 'Activo',
    };
  },

  actualizarTipoItem: async (id: string, data: Partial<TipoItem>): Promise<TipoItem> => {
    const response = await apiClient.put<RespuestaEnvuelta<TipoItemBackendDto>>(`/tipos-items/${id}`, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      requiereAprobacion: data.requiereAprobacion === 'Sí',
    });

    const tBackend = response.data.datos!;
    return {
      id: tBackend.id,
      nombre: tBackend.nombre,
      descripcion: tBackend.descripcion || 'Sin descripción',
      itemsRegistrados: 0,
      requiereAprobacion: tBackend.requiereAprobacion ? 'Sí' : 'No',
      estado: tBackend.estado ? 'Activo' : 'Inactivo',
    };
  },

  eliminarTipoItem: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/tipos-items/${id}`);
    return true;
  },

  reactivarTipoItem: async (id: string): Promise<boolean> => {
    await apiClient.patch(`/tipos-items/${id}/reactivar`);
    return true;
  },
};
