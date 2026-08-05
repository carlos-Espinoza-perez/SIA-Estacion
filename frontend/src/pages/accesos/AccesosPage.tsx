import React, { useState, useMemo } from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { Table, TableColumn } from '../../components/molecules/Table/Table';
import { SearchInput } from '../../components/atoms/SearchInput/SearchInput';
import { Select, SelectOption } from '../../components/atoms/Select/Select';
import { ResultadoBadge, ResultadoAcceso } from '../../components/atoms/ResultadoBadge/ResultadoBadge';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AccesoRow {
  id: string;
  fechaHora: string;
  persona: string;
  carnet: string;
  estacion: string;
  direccion: string;
  validacion: string;
  resultado: ResultadoAcceso;
}

// ─── Datos mock (del Figma) ───────────────────────────────────────────────────

const MOCK_DATA: AccesoRow[] = [
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

// ─── Opciones de filtros ───────────────────────────────────────────────────────

const ESTACION_OPTIONS: SelectOption[] = [
  { value: '', label: 'Estación: Todas' },
  { value: 'Entrada principal', label: 'Entrada principal' },
  { value: 'Laboratorio A',    label: 'Laboratorio A' },
  { value: 'Biblioteca',       label: 'Biblioteca' },
  { value: 'Taller',           label: 'Taller' },
  { value: 'Cafetería',        label: 'Cafetería' },
  { value: 'Salida norte',     label: 'Salida norte' },
];

const RESULTADO_OPTIONS: SelectOption[] = [
  { value: '',           label: 'Resultado: Todos' },
  { value: 'Concedido',  label: 'Concedido' },
  { value: 'Denegado',   label: 'Denegado' },
  { value: 'Offline',    label: 'Offline' },
  { value: 'Pendiente',  label: 'Pendiente' },
];

const FECHA_OPTIONS: SelectOption[] = [
  { value: 'hoy',      label: 'Hoy' },
  { value: 'semana',   label: 'Esta semana' },
  { value: 'mes',      label: 'Este mes' },
  { value: '28/07',    label: '28 jul 2026' },
];

// ─── Columnas de la tabla ────────────────────────────────────────────────────

const COLUMNS: TableColumn<AccesoRow>[] = [
  {
    key: 'fechaHora',
    header: 'Fecha y hora',
    width: 150,
    render: (row) => (
      <span style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
        {row.fechaHora}
      </span>
    ),
  },
  {
    key: 'persona',
    header: 'Persona',
    width: 160,
    render: (row) => (
      <span style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
        {row.persona}
      </span>
    ),
  },
  {
    key: 'carnet',
    header: 'Carnet',
    width: 140,
    render: (row) => (
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
        {row.carnet}
      </span>
    ),
  },
  {
    key: 'estacion',
    header: 'Estación',
    width: 160,
    render: (row) => (
      <span style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
        {row.estacion}
      </span>
    ),
  },
  {
    key: 'direccion',
    header: 'Dirección',
    width: 100,
    render: (row) => (
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
        {row.direccion}
      </span>
    ),
  },
  {
    key: 'validacion',
    header: 'Validación',
    width: 130,
    render: (row) => (
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
        {row.validacion}
      </span>
    ),
  },
  {
    key: 'resultado',
    header: 'Resultado',
    width: 140,
    render: (row) => <ResultadoBadge value={row.resultado} />,
  },
];

// ─── Página ───────────────────────────────────────────────────────────────────

export const AccesosPage: React.FC = () => {
  const [search,    setSearch]    = useState('');
  const [estacion,  setEstacion]  = useState('');
  const [resultado, setResultado] = useState('');
  const [fecha,     setFecha]     = useState('28/07');

  const filtered = useMemo(() => {
    return MOCK_DATA.filter((row) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        row.persona.toLowerCase().includes(q) ||
        row.carnet.toLowerCase().includes(q);
      const matchEstacion  = !estacion  || row.estacion  === estacion;
      const matchResultado = !resultado || row.resultado === resultado;
      return matchSearch && matchEstacion && matchResultado;
    });
  }, [search, estacion, resultado]);

  return (
    <DashboardLayoutTemplate breadcrumbTitle="Accesos">
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
        {/* ─── Título ─── */}
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            margin: 0,
          }}
        >
          Accesos
        </h2>

        {/* ─── Barra de filtros ─── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar persona o carnet"
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
            options={RESULTADO_OPTIONS}
            value={resultado}
            onChange={setResultado}
            placeholder="Resultado: Todos"
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

        {/* ─── Tabla ─── */}
        <Table<AccesoRow>
          columns={COLUMNS}
          data={filtered}
          rowKey={(row) => row.id}
          footerText={`Mostrando ${filtered.length} de ${MOCK_DATA.length} eventos`}
          emptyMessage="No hay accesos que coincidan con los filtros."
        />
      </div>
    </DashboardLayoutTemplate>
  );
};
