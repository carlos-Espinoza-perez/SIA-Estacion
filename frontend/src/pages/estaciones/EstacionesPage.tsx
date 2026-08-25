import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { Table, TableColumn } from '../../components/molecules/Table/Table';
import { SearchInput } from '../../components/atoms/SearchInput/SearchInput';
import { Select, SelectOption } from '../../components/atoms/Select/Select';
import { Estacion, CrearEstacionFormData, FiltrosEstacion } from '../../types/estacion';
import { estacionService } from '../../services/estacionService';
import { ModalCrearEstacion } from '../../components/organisms/ModalCrearEstacion/ModalCrearEstacion';
import { ConfiguracionEstacionDrawer } from '../../components/organisms/ConfiguracionEstacionDrawer/ConfiguracionEstacionDrawer';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/atoms/Button/Button';

// Opciones de Filtros

const TIPO_RECURSO_FILTER_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tipo de recurso: Todos' },
  { value: 'Control de acceso', label: 'Control de acceso' },
  { value: 'Componentes electrónicos', label: 'Componentes electrónicos' },
  { value: 'Equipo de laboratorio', label: 'Equipo de laboratorio' },
  { value: 'Material bibliográfico', label: 'Material bibliográfico' },
];

const ESTADO_FILTER_OPTIONS: SelectOption[] = [
  { value: '', label: 'Estado: Todos' },
  { value: 'En línea', label: 'En línea' },
  { value: 'Offline', label: 'Offline' },
  { value: 'Mantenimiento', label: 'Mantenimiento' },
];

export const EstacionesPage: React.FC = () => {
  const { showToast } = useToast();
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoRecursoFiltro, setTipoRecursoFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  // Modales y Drawers
  const [isCrearOpen, setIsCrearOpen] = useState(false);
  const [selectedEstacion, setSelectedEstacion] = useState<Estacion | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const cargarEstaciones = () => {
    const filtros: FiltrosEstacion = {
      busqueda,
      tipoRecurso: tipoRecursoFiltro,
      estado: estadoFiltro,
    };
    estacionService.getEstaciones(filtros).then(setEstaciones);
  };

  useEffect(() => {
    cargarEstaciones();
  }, [busqueda, tipoRecursoFiltro, estadoFiltro]);

  const handleCrearEstacion = async (formData: CrearEstacionFormData) => {
    await estacionService.crearEstacion(formData);
    showToast(`Estación "${formData.nombre}" creada con éxito`, 'success');
    cargarEstaciones();
  };

  const handleGuardarConfiguracion = async (estacionActualizada: Estacion) => {
    await estacionService.actualizarEstacion(estacionActualizada.id, estacionActualizada);
    setSelectedEstacion(estacionActualizada);
    cargarEstaciones();
  };

  const handleEliminarEstacion = async (id: string) => {
    await estacionService.eliminarEstacion(id);
    setSelectedEstacion(null);
    cargarEstaciones();
  };

  const handleRowClick = (estacion: Estacion) => {
    setSelectedEstacion(estacion);
    setIsDrawerOpen(true);
  };

  // Columnas de Tabla
  const COLUMNS: TableColumn<Estacion>[] = useMemo(
    () => [
      {
        key: 'nombre',
        header: 'Estación',
        width: 220,
        render: (row: Estacion) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
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
          </div>
        ),
      },
      {
        key: 'ubicacion',
        header: 'Ubicación',
        width: 220,
        render: (row: Estacion) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {row.ubicacion}
          </span>
        ),
      },
      {
        key: 'tipoRecurso',
        header: 'Tipo de recurso',
        width: 220,
        render: (row: Estacion) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.85)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {row.tipoRecurso}
          </span>
        ),
      },
      {
        key: 'flujo',
        header: 'Flujo',
        width: 140,
        render: (row: Estacion) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.65)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {row.flujo}
          </span>
        ),
      },
      {
        key: 'ultimaSincronizacion',
        header: 'Última sincronización',
        width: 180,
        render: (row: Estacion) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.45)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {row.ultimaSincronizacion}
          </span>
        ),
      },
      {
        key: 'estado',
        header: 'Estado',
        width: 140,
        render: (row: Estacion) => {
          let dotColor = '#4ADE80';
          let bgColor = 'rgba(34, 197, 94, 0.12)';
          let textColor = '#4ADE80';

          if (row.estado === 'Offline') {
            dotColor = '#F87171';
            bgColor = 'rgba(239, 68, 68, 0.12)';
            textColor = '#F87171';
          } else if (row.estado === 'Mantenimiento') {
            dotColor = '#FACC15';
            bgColor = 'rgba(234, 179, 8, 0.12)';
            textColor = '#FACC15';
          }

          return (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                backgroundColor: bgColor,
                color: textColor,
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: dotColor,
                }}
              />
              {row.estado}
            </div>
          );
        },
      },
    ],
    []
  );

  const totalOffline = estaciones.filter((e) => e.estado === 'Offline').length;

  return (
    <DashboardLayoutTemplate breadcrumbTitle="Estaciones">
      <div
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
          width: '100%',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Encabezado */}
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            margin: 0,
          }}
        >
          Estaciones
        </h2>

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
              placeholder="Buscar estación"
              value={busqueda}
              onChange={setBusqueda}
              width={260}
            />

            <Select
              options={TIPO_RECURSO_FILTER_OPTIONS}
              value={tipoRecursoFiltro}
              onChange={setTipoRecursoFiltro}
              placeholder="Tipo de recurso: Todos"
              width={230}
            />

            <Select
              options={ESTADO_FILTER_OPTIONS}
              value={estadoFiltro}
              onChange={setEstadoFiltro}
              placeholder="Estado: Todos"
              width={170}
            />
          </div>

          {/* Botón Nueva Estación */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCrearOpen(true)}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
            style={{ flexShrink: 0 }}
          >
            Nueva Estación
          </Button>
        </div>

        {/* Tabla de Estaciones */}
        <Table<Estacion>
          columns={COLUMNS}
          data={estaciones}
          rowKey={(row) => row.id}
          onRowClick={handleRowClick}
          footerText={`${estaciones.length} Estaciones registradas · ${totalOffline} sin conexión`}
          emptyMessage="No se encontraron estaciones con los filtros seleccionados."
        />

        {/* Modal de Creación de Estación */}
        <ModalCrearEstacion
          isOpen={isCrearOpen}
          onClose={() => setIsCrearOpen(false)}
          onSubmit={handleCrearEstacion}
        />

        {/* Drawer de Configuración de Estación */}
        <ConfiguracionEstacionDrawer
          estacion={selectedEstacion}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSave={handleGuardarConfiguracion}
          onDelete={handleEliminarEstacion}
        />
      </div>
    </DashboardLayoutTemplate>
  );
};
