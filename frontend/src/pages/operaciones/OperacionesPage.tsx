import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { Table, TableColumn } from '../../components/molecules/Table/Table';
import { SearchInput } from '../../components/atoms/SearchInput/SearchInput';
import { Select, SelectOption } from '../../components/atoms/Select/Select';
import {
  ModalAprobacionPrestamo,
  AprobacionPrestamoData,
} from '../../components/organisms/Modal/ModalAprobacionPrestamo';
import { useToast } from '../../context/ToastContext';
import { auditoriaService } from '../../services/auditoriaService';
import { estacionService } from '../../services/estacionService';
import {
  operacionService,
  OperacionRow,
  EstadoOperacion,
  FlujoOperacion,
} from '../../services/operacionService';

export type { EstadoOperacion, FlujoOperacion };

// Badge de estado

const ESTADO_COLOR: Record<EstadoOperacion, string> = {
  Pendiente: '#ADADFB',
  Aprobada:  '#6BE6D3',
  Entregada: '#71DD8C',
  Devuelta:  '#A0BCE8',
  Cancelada: '#B899EB',
  Offline:   '#7DBBFF',
};

const EstadoBadge: React.FC<{ value: EstadoOperacion }> = ({ value }) => {
  const color = ESTADO_COLOR[value] ?? 'rgba(255,255,255,0.4)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', color }}>
        {value}
      </span>
    </div>
  );
};

const ESTADO_OPTIONS: SelectOption[] = [
  { value: '',          label: 'Estado: Todos' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Aprobada',  label: 'Aprobada' },
  { value: 'Entregada', label: 'Entregada' },
  { value: 'Devuelta',  label: 'Devuelta' },
  { value: 'Cancelada', label: 'Cancelada' },
  { value: 'Offline',   label: 'Offline' },
];

const FECHA_OPTIONS: SelectOption[] = [
  { value: '',       label: 'Fecha: Todas' },
  { value: 'hoy',    label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes',    label: 'Este mes' },
];

// Definición de Columnas

// Folio column defined inside component so it can access setModalData
const STATIC_COLUMNS_WITHOUT_FOLIO: TableColumn<OperacionRow>[] = [
  {
    key: 'fechaHora',
    header: 'Fecha y hora',
    width: 155,
    render: (row) => (
      <span style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
        {row.fechaHora}
      </span>
    ),
  },
  {
    key: 'solicitante',
    header: 'Solicitante',
    width: 155,
    render: (row) => (
      <span style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
        {row.solicitante}
      </span>
    ),
  },
  {
    key: 'item',
    header: 'Ítem',
    width: 210,
    render: (row) => (
      <span style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
        {row.item}
      </span>
    ),
  },
  {
    key: 'estacion',
    header: 'Estación',
    width: 140,
    render: (row) => (
      <span style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
        {row.estacion}
      </span>
    ),
  },
  {
    key: 'flujo',
    header: 'Flujo',
    width: 110,
    render: (row) => (
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
        {row.flujo}
      </span>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    width: 140,
    render: (row) => <EstadoBadge value={row.estado} />,
  },
];

export const OperacionesPage: React.FC = () => {
  const { showToast } = useToast();
  const [operaciones, setOperaciones] = useState<OperacionRow[]>([]);
  const [estacionOptions, setEstacionOptions] = useState<SelectOption[]>([
    { value: '', label: 'Estación: Todas' },
  ]);
  const [search,    setSearch]    = useState('');
  const [estacion,  setEstacion]  = useState('');
  const [estado,    setEstado]    = useState('');
  const [fecha,     setFecha]     = useState('');
  const [modalData, setModalData] = useState<AprobacionPrestamoData | null>(null);

  useEffect(() => {
    estacionService.getEstaciones().then((ests) => {
      setEstacionOptions([
        { value: '', label: 'Estación: Todas' },
        ...ests.map((e) => ({ value: e.nombre, label: e.nombre })),
      ]);
    }).catch(console.error);
  }, []);

  const cargarOperaciones = useCallback(async () => {
    try {
      const data = await operacionService.getOperaciones({
        busqueda: search,
        estacion,
        estado,
        fecha,
      });
      setOperaciones(data);
    } catch {
      // fallback
    }
  }, [search, estacion, estado, fecha]);

  useEffect(() => {
    cargarOperaciones();
  }, [cargarOperaciones]);

  const handleFolioClick = (row: OperacionRow) => {
    if (row.estado !== 'Pendiente') return;
    setModalData({
      id: row.id,
      folio: row.folio,
      fechaSolicitud: row.fechaHora,
      solicitante: {
        nombre: row.solicitante,
        carnet: row.carnet || '—',
        rol: 'Usuario',
        carrera: '—',
        prestamosActivos: 0,
        devolucionesAtrasadas: 0,
      },
      item: {
        nombre: row.item,
        codigo: row.itemId || row.folio,
        categoria: 'Recurso',
        estado: 'Disponible',
        disponibles: 1,
        total: 1,
      },
      estacion: row.estacion,
      flujo: row.flujo === 'Aprobación' ? 'Requiere aprobación' : 'Directo',
      validacion: 'QR + Facial',
    });
  };

  const folioColumn: TableColumn<OperacionRow> = {
    key: 'folio',
    header: 'Folio',
    width: 90,
    render: (row) => {
      const isPendiente = row.estado === 'Pendiente';
      return (
        <span
          onClick={() => handleFolioClick(row)}
          style={{
            fontSize: '12px',
            color: isPendiente ? '#ADADFB' : 'rgba(255,255,255,0.4)',
            fontFamily: 'Inter, sans-serif',
            cursor: isPendiente ? 'pointer' : 'default',
            textDecoration: isPendiente ? 'underline' : 'none',
            fontWeight: isPendiente ? 600 : 400,
          }}
        >
          {row.folio}
        </span>
      );
    },
  };

  const allColumns = useMemo(() => [folioColumn, ...STATIC_COLUMNS_WITHOUT_FOLIO], []);

  const filtered = useMemo(() => {
    return operaciones.filter((row) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        row.item.toLowerCase().includes(q) ||
        row.solicitante.toLowerCase().includes(q) ||
        row.folio.toLowerCase().includes(q);
      const matchEstacion = !estacion || row.estacion === estacion;
      const matchEstado   = !estado   || row.estado   === estado;
      return matchSearch && matchEstacion && matchEstado;
    });
  }, [operaciones, search, estacion, estado]);

  const handleAprobarOperacion = async (nota?: string, fechaLimite?: string, cantidad?: number) => {
    if (!modalData) return;
    await operacionService.aprobarOperacion(modalData.id, nota);
    setOperaciones((prev) =>
      prev.map((op) => (op.id === modalData.id ? { ...op, estado: 'Aprobada' } : op))
    );

    const detalleStr = [
      cantidad ? `${cantidad} ud.` : '',
      fechaLimite ? `Hasta: ${fechaLimite}` : '',
      nota ? `Nota: "${nota}"` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    await auditoriaService.registrarEvento({
      tipo: 'Ítem',
      actor: 'Encargado de recurso',
      descripcion: `Aprobación de préstamo ${modalData.folio} para ${modalData.solicitante.nombre} (${modalData.item.nombre})${detalleStr ? ` - ${detalleStr}` : ''}`,
      origen: 'Panel',
      estacion: modalData.estacion,
    });

    showToast(`Solicitud ${modalData.folio} aprobada con éxito`, 'success');
    setModalData(null);
  };

  const handleRechazarOperacion = async () => {
    if (!modalData) return;
    await operacionService.rechazarOperacion(modalData.id);
    setOperaciones((prev) =>
      prev.map((op) => (op.id === modalData.id ? { ...op, estado: 'Cancelada' } : op))
    );

    await auditoriaService.registrarEvento({
      tipo: 'Ítem',
      actor: 'Encargado de recurso',
      descripcion: `Rechazo de préstamo ${modalData.folio} solicitado por ${modalData.solicitante.nombre}`,
      origen: 'Panel',
      estacion: modalData.estacion,
    });

    showToast(`Solicitud ${modalData.folio} rechazada`, 'info');
    setModalData(null);
  };

  return (
    <DashboardLayoutTemplate breadcrumbTitle="Operaciones">
      <div
        style={{
          padding: '16px 28px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Título */}
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            margin: 0,
          }}
        >
          Operaciones
        </h2>

        {/* Barra de filtros */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar ítem o solicitante"
            width={300}
          />
          <Select
            options={estacionOptions}
            value={estacion}
            onChange={setEstacion}
            placeholder="Estación: Todas"
            width={170}
          />
          <Select
            options={ESTADO_OPTIONS}
            value={estado}
            onChange={setEstado}
            placeholder="Estado: Todos"
            width={170}
          />
          <Select
            options={FECHA_OPTIONS}
            value={fecha}
            onChange={setFecha}
            placeholder="Fecha"
            width={150}
          />
        </div>

        {/* Tabla */}
        <Table<OperacionRow>
          columns={allColumns}
          data={filtered}
          rowKey={(row) => row.id}
          footerText={`Mostrando ${filtered.length} de ${operaciones.length} operaciones`}
          emptyMessage="No hay operaciones que coincidan con los filtros."
        />
      </div>

      {/* Modal Aprobación */}
      {modalData && (
        <ModalAprobacionPrestamo
          isOpen={true}
          onClose={() => setModalData(null)}
          data={modalData}
          onAprobar={handleAprobarOperacion}
          onRechazar={handleRechazarOperacion}
        />
      )}
    </DashboardLayoutTemplate>
  );
};
