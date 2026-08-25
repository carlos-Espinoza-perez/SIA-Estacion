import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { Table, TableColumn } from '../../components/molecules/Table/Table';
import { SearchInput } from '../../components/atoms/SearchInput/SearchInput';
import { Select, SelectOption } from '../../components/atoms/Select/Select';
import { Avatar } from '../../components/atoms/Avatar/Avatar';
import { Persona, CrearPersonaFormData, FiltrosPersona } from '../../types/persona';
import { personaService } from '../../services/personaService';
import { ModalCrearPersona } from '../../components/organisms/ModalCrearPersona/ModalCrearPersona';
import { FichaPersonaDrawer } from '../../components/organisms/FichaPersonaDrawer/FichaPersonaDrawer';
import { useToast } from '../../context/ToastContext';
import { rolService } from '../../services/rolService';
import { Button } from '../../components/atoms/Button/Button';

// Opciones de Filtros

const TIPO_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tipo: Todos' },
  { value: 'Estudiante', label: 'Estudiante' },
  { value: 'Personal', label: 'Personal' },
];

const ESTADO_OPTIONS: SelectOption[] = [
  { value: '', label: 'Estado: Todos' },
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' },
];

export const PersonasPage: React.FC = () => {
  const { showToast } = useToast();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [rolesOptions, setRolesOptions] = useState<SelectOption[]>([
    { value: '', label: 'Rol: Todos' },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  // Modales y Drawers
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Cargar datos
  const cargarPersonas = () => {
    const filtros: FiltrosPersona = {
      busqueda,
      rol: rolFiltro,
      tipo: tipoFiltro,
      estado: estadoFiltro,
      pagina: currentPage,
      limite: 10,
    };
    personaService.getPersonas(filtros).then((result) => {
      setPersonas(result.data);
      if (result.paginacion) {
        setTotalPages(result.paginacion.totalPaginas);
        setTotalRegistros(result.paginacion.totalRegistros);
      } else {
        setTotalPages(1);
        setTotalRegistros(result.data.length);
      }
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, rolFiltro, tipoFiltro, estadoFiltro]);

  useEffect(() => {
    rolService.getRoles().then((roles) => {
      const options: SelectOption[] = [
        { value: '', label: 'Rol: Todos' },
        ...roles.map((r) => ({ value: r.nombre, label: r.nombre })),
      ];
      setRolesOptions(options);
    });
  }, []);

  useEffect(() => {
    cargarPersonas();
  }, [busqueda, rolFiltro, tipoFiltro, estadoFiltro, currentPage]);

  const handleCrearPersona = async (formData: CrearPersonaFormData) => {
    await personaService.crearPersona(formData);
    showToast(`Persona ${formData.nombre} creada exitosamente`, 'success');
    cargarPersonas();
  };

  const handleRowClick = (persona: Persona) => {
    setSelectedPersonaId(persona.id);
    setIsDrawerOpen(true);
  };

  // Columnas de la Tabla
  const COLUMNS: TableColumn<Persona>[] = useMemo(
    () => [
      {
        key: 'nombre',
        header: 'Nombre',
        width: 220,
        render: (row: Persona) => (
          <div
            onClick={() => handleRowClick(row)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <Avatar name={row.nombre} src={row.avatarUrl} size={28} />
            <span
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {row.nombre}
            </span>
          </div>
        ),
      },
      {
        key: 'carnet',
        header: 'Carnet',
        width: 150,
        render: (row: Persona) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.45)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {row.carnet}
          </span>
        ),
      },
      {
        key: 'tipo',
        header: 'Tipo',
        width: 130,
        render: (row: Persona) => (
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
        key: 'rol',
        header: 'Rol',
        width: 180,
        render: (row: Persona) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.85)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {row.rol}
          </span>
        ),
      },
      {
        key: 'ultimaActividad',
        header: 'Última actividad',
        width: 160,
        render: (row: Persona) => (
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {row.ultimaActividad}
          </span>
        ),
      },
      {
        key: 'estado',
        header: 'Estado',
        width: 120,
        render: (row: Persona) => {
          const isActivo = row.estado === 'Activo';
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
                backgroundColor: isActivo ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: isActivo ? '#4ADE80' : '#F87171',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isActivo ? '#4ADE80' : '#F87171',
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

  return (
    <DashboardLayoutTemplate breadcrumbTitle="Personas">
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
        {/* ── Título ── */}
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            margin: 0,
          }}
        >
          Personas
        </h2>

        {/* ── Toolbar Superior: Buscador, Filtros y Botón "+ Nueva persona" ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Grupo de búsqueda y filtros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
            <SearchInput
              placeholder="Buscar por nombre o carnet"
              value={busqueda}
              onChange={setBusqueda}
              width={260}
            />

            <Select
              options={rolesOptions}
              value={rolFiltro}
              onChange={setRolFiltro}
              placeholder="Rol: Todos"
              width={180}
            />

            <Select
              options={TIPO_OPTIONS}
              value={tipoFiltro}
              onChange={setTipoFiltro}
              placeholder="Tipo: Todos"
              width={160}
            />

            <Select
              options={ESTADO_OPTIONS}
              value={estadoFiltro}
              onChange={setEstadoFiltro}
              placeholder="Estado: Todos"
              width={160}
            />
          </div>

          {/* Botón Nueva persona */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCrearModalOpen(true)}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
            style={{ flexShrink: 0 }}
          >
            Nueva persona
          </Button>
        </div>

        {/* Tabla de Personas */}
        <Table<Persona>
          columns={COLUMNS}
          data={personas}
          rowKey={(row) => row.id}
          footerText={`Mostrando ${personas.length} de ${totalRegistros} personas`}
          emptyMessage="No se encontraron personas con los filtros seleccionados."
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Modal Crear Persona */}
        <ModalCrearPersona
          isOpen={isCrearModalOpen}
          onClose={() => setIsCrearModalOpen(false)}
          onSubmit={handleCrearPersona}
        />

        {/* Ficha de Persona Drawer */}
        <FichaPersonaDrawer
          personaId={selectedPersonaId}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedPersonaId(null);
          }}
          onPersonaUpdated={cargarPersonas}
          onPersonaDeleted={cargarPersonas}
        />
      </div>
    </DashboardLayoutTemplate>
  );
};
