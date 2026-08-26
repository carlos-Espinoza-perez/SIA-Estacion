import React, { useState, useEffect } from 'react';
import { Estacion, FlujoEstacion } from '../../../types/estacion';
import { ConfirmModal } from '../../molecules/ConfirmModal/ConfirmModal';
import { QrScannerModal } from '../QrScannerModal/QrScannerModal';
import { useToast } from '../../../context/ToastContext';
import { personaService } from '../../../services/personaService';
import { estacionService } from '../../../services/estacionService';
import { Persona } from '../../../types/persona';

export interface ConfiguracionEstacionDrawerProps {
  estacion: Estacion | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (estacionActualizada: Estacion) => void;
  onDelete?: (id: string) => void;
}

const TIPO_RECURSO_OPTIONS = [
  'Control de acceso',
  'Equipo de laboratorio',
  'Material bibliográfico',
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
  const [encargadoId, setEncargadoId] = useState('');
  const [encargado, setEncargado] = useState('');
  const [encargadosDisponibles, setEncargadosDisponibles] = useState<Persona[]>([]);
  const [identificadorDispositivo, setIdentificadorDispositivo] = useState('');
  const [modoOffline, setModoOffline] = useState(true);

  // Pairing State
  const [codigoPairingInput, setCodigoPairingInput] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [isUnpairing, setIsUnpairing] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      personaService.getPersonas({ tipo: 'Personal', estado: 'Activo', limite: 100 })
        .then((res) => {
          const personal = res.data.filter((p) => p.tipo !== 'Estudiante');
          setEncargadosDisponibles(personal);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // Sync state with selected station
  useEffect(() => {
    if (estacion) {
      setNombre(estacion.nombre || '');
      setUbicacion(estacion.ubicacion || '');
      setTipoRecurso(estacion.tipoRecurso || 'Control de acceso');
      setFlujo(estacion.flujo || '—');
      setEncargadoId(estacion.encargadoId || '');
      setEncargado(estacion.encargado || '');
      setIdentificadorDispositivo(estacion.identificadorDispositivo || 'EST-001');
      setModoOffline(estacion.modoOffline !== false);
      setCodigoPairingInput('');
      setGuardadoExitoso(false);
    }
  }, [estacion, isOpen]);

  if (!isOpen || !estacion) return null;

  const handleVincular = async () => {
    if (!codigoPairingInput.trim() || !estacion) return;
    setIsPairing(true);
    try {
      const estacionActualizada = await estacionService.vincularEstacion(estacion.id, codigoPairingInput.trim());
      if (onSave) onSave(estacionActualizada);
      showToast(`Dispositivo físico vinculado exitosamente a "${estacion.nombre}"`, 'success');
      setCodigoPairingInput('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { mensaje?: string } } } };
      const msg = axiosErr?.response?.data?.error?.mensaje ?? 'No se pudo vincular el dispositivo físico.';
      showToast(msg, 'error');
    } finally {
      setIsPairing(false);
    }
  };

  const handleDesvincular = async () => {
    if (!estacion) return;
    setIsUnpairing(true);
    try {
      await estacionService.desvincularEstacion(estacion.id);
      const estacionDesvinculada = {
        ...estacion,
        estaVinculada: false,
        macAddress: undefined,
        codigoVinculacion: undefined,
        fechaVinculacion: undefined
      };
      if (onSave) onSave(estacionDesvinculada);
      showToast(`Dispositivo físico desvinculado de "${estacion.nombre}"`, 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { mensaje?: string } } } };
      const msg = axiosErr?.response?.data?.error?.mensaje ?? 'No se pudo desvincular el dispositivo.';
      showToast(msg, 'error');
    } finally {
      setIsUnpairing(false);
    }
  };

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
      encargadoId: encargadoId || undefined,
      encargado: encargado || 'Sin asignar',
      identificadorDispositivo: identificadorDispositivo.trim(),
      modoOffline,
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

  const handleScanSuccess = async (scannedCode: string) => {
    setCodigoPairingInput(scannedCode);
    if (!estacion) return;
    setIsPairing(true);
    try {
      const estacionActualizada = await estacionService.vincularEstacion(estacion.id, scannedCode);
      if (onSave) onSave(estacionActualizada);
      showToast(`¡Estación "${estacion.nombre}" vinculada exitosamente con el ESP32!`, 'success');
      setIsQrScannerOpen(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { mensaje?: string } } } };
      const msg = axiosErr?.response?.data?.error?.mensaje ?? 'No se pudo vincular el dispositivo con ese código QR.';
      showToast(msg, 'error');
    } finally {
      setIsPairing(false);
    }
  };

  const isOnline = !!estacion?.estaVinculada;

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
                    value={encargadoId || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setEncargadoId(selectedId);
                      const found = encargadosDisponibles.find((p) => p.id === selectedId);
                      setEncargado(found ? found.nombre : '');
                    }}
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
                    <option value="">Sin asignar</option>
                    {encargadosDisponibles.map((enc) => (
                      <option key={enc.id} value={enc.id}>
                        {enc.nombre} ({enc.carnet})
                      </option>
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

              {/* Sección Dispositivo Físico (ESP32 - Vinculación 1 a 1) */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: estacion.estaVinculada ? 'rgba(34, 197, 94, 0.05)' : 'rgba(250, 204, 21, 0.05)',
                  border: `1px solid ${estacion.estaVinculada ? 'rgba(34, 197, 94, 0.2)' : 'rgba(250, 204, 21, 0.2)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={estacion.estaVinculada ? '#4ADE80' : '#FACC15'} strokeWidth="2">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <rect x="9" y="9" width="6" height="6" />
                      <line x1="9" y1="1" x2="9" y2="4" />
                      <line x1="15" y1="1" x2="15" y2="4" />
                      <line x1="9" y1="20" x2="9" y2="23" />
                      <line x1="15" y1="20" x2="15" y2="23" />
                      <line x1="20" y1="9" x2="23" y2="9" />
                      <line x1="20" y1="14" x2="23" y2="14" />
                      <line x1="1" y1="9" x2="4" y2="9" />
                      <line x1="1" y1="14" x2="4" y2="14" />
                    </svg>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                      Dispositivo Físico (ESP32)
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: estacion.estaVinculada ? 'rgba(34, 197, 94, 0.15)' : 'rgba(250, 204, 21, 0.15)',
                      color: estacion.estaVinculada ? '#4ADE80' : '#FACC15',
                    }}
                  >
                    {estacion.estaVinculada ? 'Vinculado 1 a 1' : 'No Vinculado'}
                  </span>
                </div>

                {estacion.estaVinculada ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Dirección MAC / Hardware ID:</span>
                      <span style={{ color: '#FFFFFF', fontFamily: 'monospace', fontWeight: 600 }}>
                        {estacion.macAddress || '—'}
                      </span>
                    </div>
                    {estacion.fechaVinculacion && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Fecha de emparejamiento:</span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{estacion.fechaVinculacion}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleDesvincular}
                      disabled={isUnpairing}
                      style={{
                        marginTop: '6px',
                        alignSelf: 'flex-start',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {isUnpairing ? 'Desvinculando...' : 'Desvincular ESP32'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                      Enciende el ESP32. En su pantalla se mostrará un código QR. Escanéalo con la cámara o ingresa el código/MAC:
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Ej. PAIR-A8492 o MAC A4:CF:..."
                        value={codigoPairingInput}
                        onChange={(e) => setCodigoPairingInput(e.target.value)}
                        style={{
                          flex: 1,
                          height: '36px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          padding: '0 10px',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontFamily: 'monospace',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setIsQrScannerOpen(true)}
                        style={{
                          padding: '0 12px',
                          height: '36px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        title="Abrir escáner de cámara"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        Escanear
                      </button>
                      <button
                        type="button"
                        onClick={handleVincular}
                        disabled={isPairing || !codigoPairingInput.trim()}
                        style={{
                          padding: '0 14px',
                          height: '36px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#3B82F6',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          opacity: !codigoPairingInput.trim() ? 0.6 : 1,
                        }}
                      >
                        {isPairing ? 'Vinculando...' : 'Vincular'}
                      </button>
                    </div>
                  </div>
                )}
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
                  backgroundColor: !estacion.estaVinculada
                    ? 'rgba(250, 204, 21, 0.12)'
                    : isOnline
                    ? 'rgba(34, 197, 94, 0.12)'
                    : 'rgba(239, 68, 68, 0.12)',
                  color: !estacion.estaVinculada
                    ? '#FACC15'
                    : isOnline
                    ? '#4ADE80'
                    : '#F87171',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: !estacion.estaVinculada
                      ? '#FACC15'
                      : isOnline
                      ? '#4ADE80'
                      : '#F87171',
                  }}
                />
                {!estacion.estaVinculada ? 'Sin vincular' : isOnline ? 'En línea' : 'Offline'}
              </div>
            </div>

            {!estacion.estaVinculada ? (
              /* Bloque cuando no hay dispositivo conectado */
              <div
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '10px',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.55)', margin: 0, maxWidth: '320px', lineHeight: 1.4 }}>
                  No hay un dispositivo físico (ESP32) conectado a esta estación. Para activar la telemetría, monitoreo de firmware y latencia, vincula el hardware escaneando su código QR.
                </p>
                <button
                  type="button"
                  onClick={() => setIsQrScannerOpen(true)}
                  style={{
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#60A5FA',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Escanear Código QR
                </button>
              </div>
            ) : (
              /* Telemetría real cuando sí está vinculado */
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
                    {estacion.ultimaSincronizacion || '—'}
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
            )}
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

      {/* QR Scanner Camera Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title={`Escanear QR para "${estacion.nombre}"`}
        subtitle="Apunta la cámara al código QR mostrado en la pantalla del ESP32"
      />
    </>
  );
};
