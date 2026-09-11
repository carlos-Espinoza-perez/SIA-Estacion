import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { Table, TableColumn } from '../../components/molecules/Table/Table';
import { SearchInput } from '../../components/atoms/SearchInput/SearchInput';
import { Select, SelectOption } from '../../components/atoms/Select/Select';
import { ResultadoBadge } from '../../components/atoms/ResultadoBadge/ResultadoBadge';
import { accesoService, AccesoRow } from '../../services/accesoService';
import { estacionService } from '../../services/estacionService';

// Opciones de filtros

const RESULTADO_OPTIONS: SelectOption[] = [
  { value: '',           label: 'Resultado: Todos' },
  { value: 'Concedido',  label: 'Concedido' },
  { value: 'Denegado',   label: 'Denegado' },
  { value: 'Offline',    label: 'Offline' },
  { value: 'Pendiente',  label: 'Pendiente' },
];

const FECHA_OPTIONS: SelectOption[] = [
  { value: '',         label: 'Fecha: Todas' },
  { value: 'hoy',      label: 'Hoy' },
  { value: 'semana',   label: 'Esta semana' },
  { value: 'mes',      label: 'Este mes' },
];

// Definición de Columnas

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

export const AccesosPage: React.FC = () => {
  const [accesos,   setAccesos]   = useState<AccesoRow[]>([]);
  const [estacionOptions, setEstacionOptions] = useState<SelectOption[]>([
    { value: '', label: 'Estación: Todas' },
  ]);
  const [search,    setSearch]    = useState('');
  const [estacion,  setEstacion]  = useState('');
  const [resultado, setResultado] = useState('');
  const [fecha,     setFecha]     = useState('');

  useEffect(() => {
    estacionService.getEstaciones().then((ests) => {
      setEstacionOptions([
        { value: '', label: 'Estación: Todas' },
        ...ests.map((e) => ({ value: e.nombre, label: e.nombre })),
      ]);
    }).catch(console.error);
  }, []);

  const cargarAccesos = useCallback(async () => {
    try {
      const data = await accesoService.getAccesos({
        busqueda: search,
        estacion,
        resultado,
        fecha,
      });
      setAccesos(data);
    } catch {
      // fallback
    }
  }, [search, estacion, resultado, fecha]);

  useEffect(() => {
    cargarAccesos();
  }, [cargarAccesos]);

  const filtered = useMemo(() => {
    return accesos.filter((row) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        row.persona.toLowerCase().includes(q) ||
        row.carnet.toLowerCase().includes(q);
      const matchEstacion  = !estacion  || row.estacion  === estacion;
      const matchResultado = !resultado || row.resultado === resultado;
      return matchSearch && matchEstacion && matchResultado;
    });
  }, [accesos, search, estacion, resultado]);

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        </div>

        {/* Barra de filtros */}
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
            options={estacionOptions}
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

        {/* Tabla */}
        <Table<AccesoRow>
          columns={COLUMNS}
          data={filtered}
          rowKey={(row) => row.id}
          footerText={`Mostrando ${filtered.length} de ${accesos.length} eventos`}
          emptyMessage="No hay accesos que coincidan con los filtros."
        />
      </div>
    </DashboardLayoutTemplate>
  );
};

