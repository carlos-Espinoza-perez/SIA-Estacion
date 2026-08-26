import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { Table, TableColumn } from '../../components/molecules/Table/Table';
import { SearchInput } from '../../components/atoms/SearchInput/SearchInput';
import { Select, SelectOption } from '../../components/atoms/Select/Select';
import { StatusBadge } from '../../components/atoms/StatusBadge/StatusBadge';
import { ConfirmModal } from '../../components/molecules/ConfirmModal/ConfirmModal';
import { Item, TipoItem, FlujoTipoItem, CrearItemFormData, CrearTipoItemFormData, FiltrosItem, FiltrosTipoItem } from '../../types/item';
import { itemService } from '../../services/itemService';
import { ModalCrearItem } from '../../components/organisms/ModalCrearItem/ModalCrearItem';
import { ModalCrearTipoItem } from '../../components/organisms/ModalCrearTipoItem/ModalCrearTipoItem';
import { ModalEditarItem } from '../../components/organisms/ModalEditarItem/ModalEditarItem';
import { ModalEditarTipoItem } from '../../components/organisms/ModalEditarTipoItem/ModalEditarTipoItem';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/atoms/Button/Button';
import { estacionService } from '../../services/estacionService';

// Opciones de Filtros

const ESTADO_ITEM_FILTER_OPTIONS: SelectOption[] = [
  { value: '', label: 'Estado: Todos' },
  { value: 'Disponible', label: 'Disponible' },
  { value: 'Prestado', label: 'Prestado' },
  { value: 'Mantenimiento', label: 'Mantenimiento' },
  { value: 'Perdido', label: 'Perdido' },
];

const ESTADO_TIPO_FILTER_OPTIONS: SelectOption[] = [
  { value: 'Activo', label: 'Estado: Activo' },
  { value: 'Inactivo', label: 'Estado: Inactivo' },
];

export const ItemsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'items' | 'tipos'>('items');

  // Opciones dinámicas de filtros
  const [tipoOptions, setTipoOptions] = useState<SelectOption[]>([{ value: '', label: 'Tipo: Todos' }]);
  const [estacionOptions, setEstacionOptions] = useState<SelectOption[]>([{ value: '', label: 'Estación: Todas' }]);

  // Estados de Pestaña 1 (Ítems)
  const [items, setItems] = useState<Item[]>([]);
  const [busquedaItem, setBusquedaItem] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [estacionFiltro, setEstacionFiltro] = useState('');
  const [estadoItemFiltro, setEstadoItemFiltro] = useState('');
  const [isCrearItemOpen, setIsCrearItemOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Estados de Pestaña 2 (Tipos de ítem)
  const [tiposItem, setTiposItem] = useState<TipoItem[]>([]);
  const [busquedaTipo, setBusquedaTipo] = useState('');
  const [estadoTipoFiltro, setEstadoTipoFiltro] = useState('Activo');
  const [isCrearTipoOpen, setIsCrearTipoOpen] = useState(false);
  const [selectedTipoForEdit, setSelectedTipoForEdit] = useState<TipoItem | null>(null);
  const [tipoToDelete, setTipoToDelete] = useState<TipoItem | null>(null);
  const [isDeletingTipo, setIsDeletingTipo] = useState(false);

  useEffect(() => {
    Promise.all([
      itemService.getTiposItem(),
      estacionService.getEstaciones(),
    ]).then(([tipos, ests]) => {
      setTiposItem(tipos);
      setTipoOptions([
        { value: '', label: 'Tipo: Todos' },
        ...tipos.map((t) => ({ value: t.nombre, label: t.nombre })),
      ]);
      setEstacionOptions([
        { value: '', label: 'Estación: Todas' },
        ...ests.map((e) => ({ value: e.nombre, label: e.nombre })),
      ]);
    }).catch(console.error);
  }, []);

  // Cargar Ítems
  const cargarItems = () => {
    const filtros: FiltrosItem = {
      busqueda: busquedaItem,
      tipo: tipoFiltro,
      estacion: estacionFiltro,
      estado: estadoItemFiltro,
    };
    itemService.getItems(filtros).then(setItems);
  };

  // Cargar Tipos de Ítem
  const cargarTiposItem = () => {
    const filtros: FiltrosTipoItem = {
      busqueda: busquedaTipo,
      estado: estadoTipoFiltro,
    };
    itemService.getTiposItem(filtros).then(setTiposItem);
  };

  useEffect(() => {
    if (activeTab === 'items') {
      cargarItems();
    } else {
      cargarTiposItem();
    }
  }, [activeTab, busquedaItem, tipoFiltro, estacionFiltro, estadoItemFiltro, busquedaTipo, estadoTipoFiltro]);

  const handleCrearItem = async (formData: CrearItemFormData) => {
    await itemService.crearItem(formData);
    showToast(`Ítem ${formData.nombre} creado con éxito`, 'success');
    cargarItems();
  };

  const handleActualizarItem = async (id: string, data: Partial<Item>) => {
    await itemService.actualizarItem(id, data);
    showToast(`Ítem actualizado con éxito`, 'success');
    cargarItems();
  };

  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeletingItem(true);
    try {
      await itemService.eliminarItem(itemToDelete.id);
      showToast(`Ítem ${itemToDelete.codigo} eliminado`, 'success');
      setItemToDelete(null);
      cargarItems();
    } finally {
      setIsDeletingItem(false);
    }
  };

  const handleCrearTipoItem = async (formData: CrearTipoItemFormData) => {
    await itemService.crearTipoItem(formData);
    showToast(`Categoría "${formData.nombre}" creada con éxito`, 'success');
    cargarTiposItem();
  };

  const handleToggleTipoEstado = async (tipo: TipoItem) => {
    const nuevo = tipo.estado === 'Activo' ? 'Inactivo' : 'Activo';
    await itemService.actualizarTipoItem(tipo.id, { estado: nuevo });
    showToast(`Categoría "${tipo.nombre}" cambiada a ${nuevo}`, 'info');
    cargarTiposItem();
  };

  const handleActualizarTipoItem = async (
    id: string,
    data: { nombre: string; descripcion: string; flujoPorDefecto: FlujoTipoItem }
  ) => {
    await itemService.actualizarTipoItem(id, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      requiereAprobacion: data.flujoPorDefecto === 'Requiere aprobación' ? 'Sí' : 'No',
    });
    showToast(`Tipo "${data.nombre}" actualizado con éxito`, 'success');
    cargarTiposItem();
  };

  const handleConfirmDeleteTipo = async () => {
    if (!tipoToDelete) return;
    setIsDeletingTipo(true);
    try {
      await itemService.eliminarTipoItem(tipoToDelete.id);
      showToast(`Categoría "${tipoToDelete.nombre}" eliminada`, 'success');
      setTipoToDelete(null);
      cargarTiposItem();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { mensaje?: string } } } };
      const msg = axiosErr?.response?.data?.error?.mensaje
        ?? 'No se pudo eliminar la categoría.';
      showToast(msg, 'error');
      setTipoToDelete(null);
    } finally {
      setIsDeletingTipo(false);
    }
  };

  const handleReactivarTipo = async (tipo: TipoItem) => {
    await itemService.reactivarTipoItem(tipo.id);
    showToast(`Categoría "${tipo.nombre}" reactivada`, 'success');
    cargarTiposItem();
  };

  // Columnas de Tabla Ítems
  const COLUMNS_ITEMS: TableColumn<Item>[] = useMemo(
    () => [
      {
        key: 'codigo',
        header: 'Código',
        width: 120,
        render: (row: Item) => (
          <span
            onClick={() => setSelectedItemForEdit(row)}
            style={{
              fontSize: '13px',
              color: '#ADADFB',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            {row.codigo}
          </span>
        ),
      },
      {
        key: 'nombre',
        header: 'Ítem',
        width: 280,
        render: (row: Item) => (
          <span
            onClick={() => setSelectedItemForEdit(row)}
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
            }}
          >
            {row.nombre}
          </span>
        ),
      },
      {
        key: 'tipo',
        header: 'Tipo',
        width: 200,
        render: (row: Item) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {row.tipo}
          </span>
        ),
      },
      {
        key: 'estacion',
        header: 'Estación',
        width: 160,
        render: (row: Item) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {row.estacion}
          </span>
        ),
      },
      {
        key: 'estado',
        header: 'Estado',
        width: 140,
        render: (row: Item) => <StatusBadge status={row.estado} />,
      },
      {
        key: 'acciones',
        header: '',
        width: 80,
        render: (row: Item) => (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedItemForEdit(row)}
              title="Editar ítem"
              style={{ color: 'rgba(255,255,255,0.5)', padding: '4px', height: 'auto', minHeight: '28px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setItemToDelete(row)}
              title="Eliminar ítem"
              style={{ color: 'rgba(239,68,68,0.6)', padding: '4px', height: 'auto', minHeight: '28px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // Columnas de Tabla Tipos de Ítem
  const COLUMNS_TIPOS: TableColumn<TipoItem>[] = useMemo(
    () => [
      {
        key: 'nombre',
        header: 'Tipo',
        width: 220,
        render: (row: TipoItem) => (
          <span
            onClick={() => setSelectedTipoForEdit(row)}
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            {row.nombre}
          </span>
        ),
      },
      {
        key: 'descripcion',
        header: 'Descripción',
        width: 300,
        render: (row: TipoItem) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {row.descripcion}
          </span>
        ),
      },
      {
        key: 'itemsRegistrados',
        header: 'Ítems registrados',
        width: 140,
        render: (row: TipoItem) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.85)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
          >
            {row.itemsRegistrados}
          </span>
        ),
      },
      {
        key: 'requiereAprobacion',
        header: 'Requiere aprobación',
        width: 160,
        render: (row: TipoItem) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {row.requiereAprobacion}
          </span>
        ),
      },
      {
        key: 'estado',
        header: 'Estado',
        width: 120,
        render: (row: TipoItem) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleTipoEstado(row)}
            title="Click para cambiar estado"
            style={{ padding: 0, height: 'auto', background: 'none' }}
          >
            <StatusBadge status={row.estado} />
          </Button>
        ),
      },
      {
        key: 'acciones',
        header: '',
        width: 60,
        render: (row: TipoItem) => (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {row.estado === 'Inactivo' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReactivarTipo(row)}
                title="Reactivar categoría"
                style={{ color: 'rgba(34,197,94,0.7)', padding: '4px', height: 'auto', minHeight: '28px' }}
              >
                {/* ✓ check / reactivar */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTipoToDelete(row)}
                title="Eliminar categoría"
                style={{ color: 'rgba(239,68,68,0.6)', padding: '4px', height: 'auto', minHeight: '28px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </Button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const tiposActivosCount = tiposItem.filter((t) => t.estado === 'Activo').length;

  return (
    <DashboardLayoutTemplate
      breadcrumbTitle={activeTab === 'items' ? 'Ítems' : 'Ítems / Tipos de ítem'}
    >
      <div
        style={{
          padding: '16px 28px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
          width: '100%',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* ── Selector de Pestañas (Ítems / Tipos de ítem) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant={activeTab === 'items' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('items')}
          >
            Ítems
          </Button>
          <Button
            variant={activeTab === 'tipos' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('tipos')}
          >
            Tipos de ítem
          </Button>
        </div>

        {activeTab === 'items' ? (
          /* ── Vista 1: ÍTEMS ── */
          <>
            {/* Toolbar Superior */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                <SearchInput
                  placeholder="Buscar ítem o código"
                  value={busquedaItem}
                  onChange={setBusquedaItem}
                  width={260}
                />

                <Select
                  options={tipoOptions}
                  value={tipoFiltro}
                  onChange={setTipoFiltro}
                  placeholder="Tipo: Todos"
                  width={180}
                />

                <Select
                  options={estacionOptions}
                  value={estacionFiltro}
                  onChange={setEstacionFiltro}
                  placeholder="Estación: Todas"
                  width={160}
                />

                <Select
                  options={ESTADO_ITEM_FILTER_OPTIONS}
                  value={estadoItemFiltro}
                  onChange={setEstadoItemFiltro}
                  placeholder="Estado: Todos"
                  width={160}
                />
              </div>

              {/* Botón Nuevo Ítem */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCrearItemOpen(true)}
                leftIcon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                }
                style={{ flexShrink: 0 }}
              >
                Nuevo ítem
              </Button>
            </div>

            {/* Tabla de Ítems */}
            <Table<Item>
              columns={COLUMNS_ITEMS}
              data={items}
              rowKey={(row) => row.id}
              footerText={`Mostrando ${items.length} ${items.length === 1 ? 'ítem' : 'ítems'}`}
              emptyMessage="No se encontraron ítems con los filtros seleccionados."
            />
          </>
        ) : (
          /* ── Vista 2: TIPOS DE ÍTEM ── */
          <>
            {/* Toolbar Superior */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                <SearchInput
                  placeholder="Buscar tipo"
                  value={busquedaTipo}
                  onChange={setBusquedaTipo}
                  width={260}
                />

                <Select
                  options={ESTADO_TIPO_FILTER_OPTIONS}
                  value={estadoTipoFiltro}
                  onChange={setEstadoTipoFiltro}
                  placeholder="Estado: Todos"
                  width={160}
                />
              </div>

              {/* Botón Nuevo Tipo */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCrearTipoOpen(true)}
                leftIcon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                }
                style={{ flexShrink: 0 }}
              >
                Nuevo tipo
              </Button>
            </div>

            {/* Tabla de Tipos de Ítem */}
            <Table<TipoItem>
              columns={COLUMNS_TIPOS}
              data={tiposItem}
              rowKey={(row) => row.id}
              footerText={`${tiposItem.length} tipos definidos · ${tiposActivosCount} activos`}
              emptyMessage="No se encontraron tipos de ítem con los filtros seleccionados."
            />
          </>
        )}

        {/* ── Modales ── */}
        <ModalCrearItem
          isOpen={isCrearItemOpen}
          onClose={() => setIsCrearItemOpen(false)}
          onSubmit={handleCrearItem}
        />

        <ModalCrearTipoItem
          isOpen={isCrearTipoOpen}
          onClose={() => setIsCrearTipoOpen(false)}
          onSubmit={handleCrearTipoItem}
        />

        {/* Modal Editar Tipo de Ítem */}
        <ModalEditarTipoItem
          isOpen={!!selectedTipoForEdit}
          onClose={() => setSelectedTipoForEdit(null)}
          tipo={selectedTipoForEdit}
          onSubmit={handleActualizarTipoItem}
          onDelete={(id) => {
            const found = tiposItem.find((t) => t.id === id);
            setSelectedTipoForEdit(null);
            if (found) setTipoToDelete(found);
          }}
        />

        {/* Modal Editar Ítem */}
        <ModalEditarItem
          isOpen={!!selectedItemForEdit}
          onClose={() => setSelectedItemForEdit(null)}
          item={selectedItemForEdit}
          tiposItem={tiposItem}
          onSubmit={handleActualizarItem}
          onDelete={async (id) => {
            const found = items.find((i) => i.id === id);
            setSelectedItemForEdit(null);
            if (found) setItemToDelete(found);
          }}
        />

        {/* Confirm Delete Item */}
        <ConfirmModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDeleteItem}
          title="Eliminar ítem"
          message={`¿Estás seguro de que deseas eliminar permanentemente el ítem "${itemToDelete?.codigo} - ${itemToDelete?.nombre}"?`}
          confirmText="Eliminar ítem"
          isDestructive={true}
          isLoading={isDeletingItem}
        />

        {/* Confirm Delete Tipo de Ítem */}
        <ConfirmModal
          isOpen={!!tipoToDelete}
          onClose={() => setTipoToDelete(null)}
          onConfirm={handleConfirmDeleteTipo}
          title="Eliminar tipo de ítem"
          message={`¿Estás seguro de que deseas eliminar la categoría "${tipoToDelete?.nombre}"?`}
          confirmText="Eliminar tipo"
          isDestructive={true}
          isLoading={isDeletingTipo}
        />
      </div>
    </DashboardLayoutTemplate>
  );
};
