import React, { useState, useMemo } from 'react';
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

// Tipos

export type EstadoOperacion =
  | 'Pendiente'
  | 'Aprobada'
  | 'Entregada'
  | 'Devuelta'
  | 'Cancelada'
  | 'Offline';

export type FlujoOperacion = 'Aprobación' | 'Directo';

interface OperacionRow {
  id: string;
  folio: string;
  fechaHora: string;
  solicitante: string;
  item: string;
  estacion: string;
  flujo: FlujoOperacion;
  estado: EstadoOperacion;
}

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

// Datos de demostración iniciales

const MOCK_DATA: OperacionRow[] = [
  { id: '1',  folio: 'OP-1042', fechaHora: '28/07/2026 08:20', solicitante: 'Ana Morales',    item: 'Multímetro digital UNI-T',    estacion: 'Laboratorio A', flujo: 'Aprobación', estado: 'Pendiente' },
  { id: '2',  folio: 'OP-1041', fechaHora: '28/07/2026 08:05', solicitante: 'Luis Herrera',   item: 'Kit Arduino UNO R3',          estacion: 'Laboratorio A', flujo: 'Aprobación', estado: 'Aprobada'  },
  { id: '3',  folio: 'OP-1040', fechaHora: '27/07/2026 16:44', solicitante: 'María López',    item: 'Osciloscopio Rigol DS1054Z',  estacion: 'Taller',        flujo: 'Aprobación', estado: 'Entregada' },
  { id: '4',  folio: 'OP-1039', fechaHora: '27/07/2026 15:12', solicitante: 'Carlos Ruiz',    item: 'Redes de computadoras',       estacion: 'Biblioteca',    flujo: 'Directo',    estado: 'Entregada' },
  { id: '5',  folio: 'OP-1038', fechaHora: '27/07/2026 14:50', solicitante: 'Sofía Méndez',   item: 'Fuente de poder regulable',   estacion: 'Taller',        flujo: 'Aprobación', estado: 'Offline'   },
  { id: '6',  folio: 'OP-1037', fechaHora: '27/07/2026 13:30', solicitante: 'Diego Vargas',   item: 'Sensor ultrasónico HC-SR04',  estacion: 'Laboratorio A', flujo: 'Directo',    estado: 'Cancelada' },
  { id: '7',  folio: 'OP-1036', fechaHora: '27/07/2026 11:18', solicitante: 'Ana Morales',    item: 'Raspberry Pi 4 Model B',      estacion: 'Laboratorio A', flujo: 'Aprobación', estado: 'Offline'   },
  { id: '8',  folio: 'OP-1035', fechaHora: '27/07/2026 10:45', solicitante: 'Luis Herrera',   item: 'Programación en C++',         estacion: 'Biblioteca',    flujo: 'Directo',    estado: 'Offline'   },
  { id: '9',  folio: 'OP-1034', fechaHora: '27/07/2026 09:22', solicitante: 'María López',    item: 'Placa ESP32 DevKit',          estacion: 'Laboratorio A', flujo: 'Aprobación', estado: 'Entregada' },
  { id: '10', folio: 'OP-1033', fechaHora: '26/07/2026 17:05', solicitante: 'Carlos Ruiz',    item: 'Pinzas de punta fina',        estacion: 'Taller',        flujo: 'Directo',    estado: 'Offline'   },
  { id: '11', folio: 'OP-1032', fechaHora: '26/07/2026 16:30', solicitante: 'Sofía Méndez',   item: 'Sistemas operativos',         estacion: 'Biblioteca',    flujo: 'Directo',    estado: 'Offline'   },
  { id: '12', folio: 'OP-1031', fechaHora: '26/07/2026 15:00', solicitante: 'Diego Vargas',   item: 'Kit resistencias surtidas',   estacion: 'Laboratorio A', flujo: 'Aprobación', estado: 'Entregada' },
];

// Opciones de filtros

const ESTACION_OPTIONS: SelectOption[] = [
  { value: '',             label: 'Estación: Todas' },
  { value: 'Laboratorio A', label: 'Laboratorio A' },
  { value: 'Taller',       label: 'Taller' },
  { value: 'Biblioteca',   label: 'Biblioteca' },
];

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
  { value: 'hoy',    label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes',    label: 'Este mes' },
  { value: '28/07',  label: '28 jul 2026' },
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
  const [operaciones, setOperaciones] = useState<OperacionRow[]>(MOCK_DATA);
  const [search,    setSearch]    = useState('');
  const [estacion,  setEstacion]  = useState('');
  const [estado,    setEstado]    = useState('');
  const [fecha,     setFecha]     = useState('28/07');
  const [modalData, setModalData] = useState<AprobacionPrestamoData | null>(null);

  const handleFolioClick = (row: OperacionRow) => {
    if (row.estado !== 'Pendiente') return;
    setModalData({
      folio: row.folio,
      fechaSolicitud: row.fechaHora,
      solicitante: {
        nombre: row.solicitante,
        carnet: '22-A0200-0056',
        rol: 'Estudiante',
        carrera: 'Ing. en Sistemas',
        prestamosActivos: 3,
        devolucionesAtrasadas: 0,
      },
      item: {
        nombre: row.item,
        codigo: 'IT-0431',
        categoria: 'Componentes electrónicos',
        estado: 'Disponible',
        disponibles: 4,
        total: 6,
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
    setOperaciones((prev) =>
      prev.map((op) => (op.folio === modalData.folio ? { ...op, estado: 'Aprobada' } : op))
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
    setOperaciones((prev) =>
      prev.map((op) => (op.folio === modalData.folio ? { ...op, estado: 'Cancelada' } : op))
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
            options={ESTACION_OPTIONS}
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
