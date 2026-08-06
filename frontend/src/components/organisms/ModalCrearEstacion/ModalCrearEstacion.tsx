import React, { useState } from 'react';
import { Modal } from '../Modal/Modal';
import { CrearEstacionFormData, FlujoEstacion } from '../../../types/estacion';

export interface ModalCrearEstacionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearEstacionFormData) => void;
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

export const ModalCrearEstacion: React.FC<ModalCrearEstacionProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [tipoRecurso, setTipoRecurso] = useState('Componentes electrónicos');
  const [flujo, setFlujo] = useState<FlujoEstacion>('Aprobación');
  const [encargado, setEncargado] = useState('Weslin Rodríguez');
  const [identificadorDispositivo, setIdentificadorDispositivo] = useState('EST-LAB-C-01');
  const [modoOffline, setModoOffline] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !ubicacion.trim()) return;

    onSubmit({
      nombre: nombre.trim(),
      ubicacion: ubicacion.trim(),
      tipoRecurso,
      flujo: tipoRecurso === 'Control de acceso' ? '—' : flujo,
      encargado,
      identificadorDispositivo: identificadorDispositivo.trim(),
      modoOffline,
    });

    setNombre('');
    setUbicacion('');
    setIdentificadorDispositivo(`EST-PUNTO-0${Math.floor(1 + Math.random() * 9)}`);
    onClose();
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: 'transparent',
          color: '#FFFFFF',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          cursor: 'pointer',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        Cancelar
      </button>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!nombre.trim() || !ubicacion.trim()}
        style={{
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#FFFFFF',
          color: '#1C1C1C',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          cursor: !nombre.trim() || !ubicacion.trim() ? 'not-allowed' : 'pointer',
          opacity: !nombre.trim() || !ubicacion.trim() ? 0.4 : 1,
        }}
        onMouseOver={(e) => {
          if (nombre.trim() && ubicacion.trim()) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        }}
        onMouseOut={(e) => {
          if (nombre.trim() && ubicacion.trim()) e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        Crear Estación
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Estación"
      subtitle="Da de alta un punto físico y define su comportamiento."
      width={560}
      footer={footer}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '12px' }}>
        {/* Nombre de la Estación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Nombre de la Estación
          </label>
          <input
            type="text"
            placeholder="Ej. Laboratorio C"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{
              height: '38px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '0 12px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />
        </div>

        {/* Ubicación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Ubicación
          </label>
          <input
            type="text"
            placeholder="Ej. Pabellón B, 2º piso"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            style={{
              height: '38px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '0 12px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />
        </div>

        {/* Tipo de recurso */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Tipo de recurso que administra
          </label>
          <select
            value={tipoRecurso}
            onChange={(e) => setTipoRecurso(e.target.value)}
            style={{
              height: '38px',
              backgroundColor: '#333333',
              border: '1px solid rgba(255, 255, 255, 0.12)',
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

        {/* Flujo de operación (Segmented) */}
        {tipoRecurso !== 'Control de acceso' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Flujo de operación
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
              <button
                type="button"
                onClick={() => setFlujo('Aprobación')}
                style={{
                  flex: 1,
                  height: '32px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: flujo === 'Aprobación' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: flujo === 'Aprobación' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: flujo === 'Aprobación' ? 500 : 400,
                  cursor: 'pointer',
                }}
              >
                Aprobación
              </button>
              <button
                type="button"
                onClick={() => setFlujo('Directo')}
                style={{
                  flex: 1,
                  height: '32px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: flujo === 'Directo' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: flujo === 'Directo' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: flujo === 'Directo' ? 500 : 400,
                  cursor: 'pointer',
                }}
              >
                Directo
              </button>
            </div>
          </div>
        )}

        {/* Encargado asignado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Encargado asignado
          </label>
          <select
            value={encargado}
            onChange={(e) => setEncargado(e.target.value)}
            style={{
              height: '38px',
              backgroundColor: '#333333',
              border: '1px solid rgba(255, 255, 255, 0.12)',
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

        {/* Identificador del dispositivo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Identificador del dispositivo
          </label>
          <input
            type="text"
            placeholder="EST-LAB-C-01"
            value={identificadorDispositivo}
            onChange={(e) => setIdentificadorDispositivo(e.target.value)}
            style={{
              height: '38px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '0 12px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />
        </div>

        {/* Modo offline (Segmented) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Modo offline
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
            <button
              type="button"
              onClick={() => setModoOffline(true)}
              style={{
                flex: 1,
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: modoOffline ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: modoOffline ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: modoOffline ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              Habilitado
            </button>
            <button
              type="button"
              onClick={() => setModoOffline(false)}
              style={{
                flex: 1,
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: !modoOffline ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: !modoOffline ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: !modoOffline ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              Deshabilitado
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
