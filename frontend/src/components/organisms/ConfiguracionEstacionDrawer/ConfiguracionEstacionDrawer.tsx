import React, { useState, useEffect } from 'react';
import { Estacion, EstadoEstacion, FlujoEstacion } from '../../../types/estacion';
import { ConfirmModal } from '../../molecules/ConfirmModal/ConfirmModal';
import { useToast } from '../../../context/ToastContext';

export interface ConfiguracionEstacionDrawerProps {
  estacion: Estacion | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (estacionActualizada: Estacion) => void;
  onDelete?: (id: string) => void;
}

const TIPO_RECURSO_OPTIONS = [
  'Componentes electrónicos',
  'Control de acceso',
  'Equipo de laboratorio',
  'Material bibliográfico',
];

const ENCARGADO_OPTIONS = [
  'Weslin Rodríguez',
  'Martha Sánchez',
  'Josué Argeñal',
  'Heberto Espinoza',
];

export const ConfiguracionEstacionDrawer: React.FC<ConfiguracionEstacionDrawerProps> = ({
  estacion,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const { showToast } = useToast();

  // Form State
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [tipoRecurso, setTipoRecurso] = useState('');
  const [flujo, setFlujo] = useState<FlujoEstacion>('—');
  const [encargado, setEncargado] = useState('');
  const [identificadorDispositivo, setIdentificadorDispositivo] = useState('');
  const [modoOffline, setModoOffline] = useState(true);
  const [estado, setEstado] = useState<EstadoEstacion>('En línea');

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state with selected station
  useEffect(() => {
    if (estacion) {
      setNombre(estacion.nombre || '');
      setUbicacion(estacion.ubicacion || '');
      setTipoRecurso(estacion.tipoRecurso || 'Control de acceso');
      setFlujo(estacion.flujo || '—');
      setEncargado(estacion.encargado || 'Martha Sánchez');
      setIdentificadorDispositivo(estacion.identificadorDispositivo || 'EST-001');
      setModoOffline(estacion.modoOffline !== false);
      setEstado(estacion.estado || 'En línea');
      setGuardadoExitoso(false);
    }
  }, [estacion, isOpen]);

  if (!isOpen || !estacion) return null;

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !ubicacion.trim()) return;

    setIsSaving(true);
    const estacionModificada: Estacion = {
      ...estacion,
      nombre: nombre.trim(),
      ubicacion: ubicacion.trim(),
      tipoRecurso,
      flujo: tipoRecurso === 'Control de acceso' ? '—' : flujo,
      encargado,
      identificadorDispositivo: identificadorDispositivo.trim(),
      modoOffline,
      estado,
    };

    if (onSave) {
      await onSave(estacionModificada);
      showToast(`Configuración de "${estacionModificada.nombre}" guardada`, 'success');
    }

    setIsSaving(false);
    setGuardadoExitoso(true);
    setTimeout(() => {
      setGuardadoExitoso(false);
    }, 3000);
  };

  const handleConfirmDelete = async () => {
    if (!estacion || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(estacion.id);
      showToast(`Estación "${estacion.nombre}" eliminada`, 'success');
      setIsDeleteModalOpen(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const isOnline = estado === 'En línea';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(2px)',
          zIndex: 100,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Slide-over Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '580px',
          maxWidth: '92vw',
          height: '100vh',
          backgroundColor: '#1E1E1E',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#242424',
            zIndex: 2,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                {nombre || estacion.nombre}
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Configuración
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)', margin: '4px 0 0' }}>
              {ubicacion || estacion.ubicacion} · ID: {identificadorDispositivo || 'EST-001'}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', flex: 1 }}>
          {guardadoExitoso && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ADE80',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              ¡Configuración de la estación actualizada correctamente!
            </div>
          )}

          {/* Formulario de Configuración Modificable */}
          <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                  Parámetros de la Estación
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  Editable
                </span>
              </div>

              {/* Nombre de la Estación */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                  Nombre de la Estación
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Laboratorio A"
                  style={{
                    height: '38px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '8px',
                    padding: '0 12px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Ubicación */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                  Ubicación
                </label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej. Pabellón B, 2º piso"
                  style={{
                    height: '38px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '8px',
                    padding: '0 12px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Tipo de recurso & Flujo */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                    Tipo de recurso
                  </label>
                  <select
                    value={tipoRecurso}
                    onChange={(e) => setTipoRecurso(e.target.value)}
                    style={{
                      height: '38px',
                      backgroundColor: '#2A2A2A',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '8px',
                      padding: '0 10px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                    }}
                  >
                    {TIPO_RECURSO_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                    Flujo de operación
                  </label>
                  <select
                    value={flujo}
                    onChange={(e) => setFlujo(e.target.value as FlujoEstacion)}
                    disabled={tipoRecurso === 'Control de acceso'}
                    style={{
                      height: '38px',
                      backgroundColor: '#2A2A2A',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '8px',
                      padding: '0 10px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      opacity: tipoRecurso === 'Control de acceso' ? 0.5 : 1,
                    }}
                  >
                    <option value="Aprobación">Requiere aprobación</option>
                    <option value="Directo">Retiro directo</option>
                    <option value="—">Control de paso (—)</option>
                  </select>
                </div>
              </div>

              {/* Encargado & ID del dispositivo */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                    Encargado asignado
                  </label>
                  <select
                    value={encargado}
                    onChange={(e) => setEncargado(e.target.value)}
                    style={{
                      height: '38px',
                      backgroundColor: '#2A2A2A',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '8px',
                      padding: '0 10px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                    }}
                  >
                    {ENCARGADO_OPTIONS.map((enc) => (
                      <option key={enc} value={enc}>{enc}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                    ID del dispositivo
                  </label>
                  <input
                    type="text"
                    value={identificadorDispositivo}
                    onChange={(e) => setIdentificadorDispositivo(e.target.value)}
                    placeholder="EST-LAB-A-01"
                    style={{
                      height: '38px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '8px',
                      padding: '0 12px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Estado de Conexión Editable */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                  Estado de la estación
                </label>
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '3px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    gap: '4px',
                  }}
                >
                  {(['En línea', 'Offline', 'Mantenimiento'] as EstadoEstacion[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEstado(st)}
                      style={{
                        flex: 1,
                        height: '32px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: estado === st ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                        color: estado === st ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: estado === st ? 500 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modo offline switch */}
              <div
                onClick={() => setModoOffline(!modoOffline)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: modoOffline ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${modoOffline ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 500, display: 'block' }}>
                    Modo offline {modoOffline ? 'habilitado' : 'deshabilitado'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)' }}>
                    Valida solo por QR contra la copia local al perder conexión
                  </span>
                </div>
                <div
                  style={{
                    width: '38px',
                    height: '20px',
                    borderRadius: '10px',
                    backgroundColor: modoOffline ? '#22C55E' : 'rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      position: 'absolute',
                      top: '2px',
                      left: modoOffline ? '20px' : '2px',
                      transition: 'left 0.2s',
                    }}
                  />
                </div>
              </div>

              {/* Botones de Acción en la sección */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      color: '#EF4444',
                      fontSize: '12px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Eliminar estación
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSaving || !nombre.trim() || !ubicacion.trim()}
                  style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#FFFFFF',
                    color: '#1C1C1C',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Guardar configuración
                </button>
              </div>
            </div>
          </form>

          {/* Card 2: Estado del Dispositivo */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                Estado del dispositivo
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 500,
                  backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: isOnline ? '#4ADE80' : '#F87171',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isOnline ? '#4ADE80' : '#F87171',
                  }}
                />
                {estado}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>
                  Firmware
                </span>
                <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>
                  {estacion.firmware || 'v1.0.3'}
                </span>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>
                  Accesos hoy
                </span>
                <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>
                  {estacion.accesosHoy ?? 0}
                </span>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>
                  Operaciones hoy
                </span>
                <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>
                  {estacion.operacionesHoy ?? 0}
                </span>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>
                  Última sincr.
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {estacion.ultimaSincronizacion}
                </span>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>
                  Latencia QR
                </span>
                <span style={{ fontSize: '13px', color: '#4ADE80', fontWeight: 600 }}>
                  {estacion.latenciaQrPromedio || '—'}
                </span>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>
                  Latencia Facial
                </span>
                <span style={{ fontSize: '13px', color: '#4ADE80', fontWeight: 600 }}>
                  {estacion.latenciaFacialPromedio || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Actividad reciente en esta Estación */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
              Actividad reciente en esta Estación
            </span>

            {(!estacion.actividadReciente || estacion.actividadReciente.length === 0) ? (
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', padding: '12px 0' }}>
                No hay actividad registrada en las últimas 24 horas.
              </span>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', color: 'rgba(255, 255, 255, 0.4)' }}>
                      <th style={{ padding: '8px 6px', fontWeight: 400 }}>Fecha y hora</th>
                      <th style={{ padding: '8px 6px', fontWeight: 400 }}>Persona</th>
                      <th style={{ padding: '8px 6px', fontWeight: 400 }}>Operación</th>
                      <th style={{ padding: '8px 6px', fontWeight: 400 }}>Validación</th>
                      <th style={{ padding: '8px 6px', fontWeight: 400 }}>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estacion.actividadReciente.map((act) => {
                      let resBg = 'rgba(34, 197, 94, 0.12)';
                      let resColor = '#4ADE80';
                      if (act.resultado === 'Denegado') {
                        resBg = 'rgba(239, 68, 68, 0.12)';
                        resColor = '#F87171';
                      } else if (act.resultado === 'Pendiente') {
                        resBg = 'rgba(234, 179, 8, 0.12)';
                        resColor = '#FACC15';
                      } else if (act.resultado === 'Entregada') {
                        resBg = 'rgba(184, 153, 235, 0.12)';
                        resColor = '#B899EB';
                      }

                      return (
                        <tr key={act.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '8px 6px', color: 'rgba(255, 255, 255, 0.6)' }}>{act.fechaHora}</td>
                          <td style={{ padding: '8px 6px', color: '#FFFFFF', fontWeight: 500 }}>{act.persona}</td>
                          <td style={{ padding: '8px 6px', color: 'rgba(255, 255, 255, 0.8)' }}>{act.operacion}</td>
                          <td style={{ padding: '8px 6px', color: 'rgba(255, 255, 255, 0.5)' }}>{act.validacion}</td>
                          <td style={{ padding: '8px 6px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: 500,
                                backgroundColor: resBg,
                                color: resColor,
                              }}
                            >
                              {act.resultado}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Station Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar estación"
        message={`¿Estás seguro de que deseas eliminar la estación "${estacion.nombre}"? Esta acción desvinculará sus registros y el dispositivo asignado (${identificadorDispositivo}).`}
        confirmText="Eliminar estación"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
};
