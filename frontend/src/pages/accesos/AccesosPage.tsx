import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { Table, TableColumn } from '../../components/molecules/Table/Table';
import { SearchInput } from '../../components/atoms/SearchInput/SearchInput';
import { Select, SelectOption } from '../../components/atoms/Select/Select';
import { ResultadoBadge, ResultadoAcceso } from '../../components/atoms/ResultadoBadge/ResultadoBadge';
import { useToast } from '../../context/ToastContext';
import { auditoriaService } from '../../services/auditoriaService';
import { accesoService, AccesoRow } from '../../services/accesoService';
import { Button } from '../../components/atoms/Button/Button';

// Opciones de filtros

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
  const { showToast } = useToast();
  const [accesos,   setAccesos]   = useState<AccesoRow[]>([]);
  const [search,    setSearch]    = useState('');
  const [estacion,  setEstacion]  = useState('');
  const [resultado, setResultado] = useState('');
  const [fecha,     setFecha]     = useState('28/07');

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

  const handleSimularAcceso = async () => {
    const nombres = ['Ana Morales', 'Luis Herrera', 'María López', 'Carlos Ruiz', 'Sofía Méndez', 'Diego Vargas'];
    const carnets = ['22-A0200-0056', '21-A0134-0012', '23-A0311-0087', '22-A0200-0057', '20-A0098-0104', '23-A0311-0088'];
    const estaciones = ['Entrada principal', 'Laboratorio A', 'Biblioteca', 'Taller', 'Cafetería'];
    const idx = Math.floor(Math.random() * nombres.length);
    const estacionRand = estaciones[Math.floor(Math.random() * estaciones.length)];
    const resultadoRand: ResultadoAcceso = Math.random() > 0.15 ? 'Concedido' : 'Denegado';

    const now = new Date();
    const fechaHoraStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const nuevoAcceso: AccesoRow = {
      id: `acc-${Date.now()}`,
      fechaHora: fechaHoraStr,
      persona: nombres[idx],
      carnet: carnets[idx],
      estacion: estacionRand,
      direccion: Math.random() > 0.5 ? 'Ingreso' : 'Egreso',
      validacion: 'QR + Facial',
      resultado: resultadoRand,
    };

    setAccesos((prev) => [nuevoAcceso, ...prev]);

    await auditoriaService.registrarEvento({
      tipo: 'Acceso',
      actor: nuevoAcceso.persona,
      descripcion: `Validación de acceso (${nuevoAcceso.direccion}) - Resultado: ${nuevoAcceso.resultado}`,
      origen: 'Estación',
      estacion: nuevoAcceso.estacion,
    });

    showToast(
      `Acceso ${resultadoRand === 'Concedido' ? 'permitido' : 'denegado'} a ${nuevoAcceso.persona} en ${nuevoAcceso.estacion}`,
      resultadoRand === 'Concedido' ? 'success' : 'error'
    );
  };

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
        {/* Encabezado y Simulación */}
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

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSimularAcceso}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            }
          >
            Simular validación NFC/QR
          </Button>
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

