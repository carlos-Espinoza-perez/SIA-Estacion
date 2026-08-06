import React, { useState } from 'react';
import { Modal } from '../Modal/Modal';
import { CrearTipoItemFormData, FlujoTipoItem } from '../../../types/item';

export interface ModalCrearTipoItemProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearTipoItemFormData) => void;
}

const AVAILABLE_STATIONS = [
  'Laboratorio A',
  'Laboratorio B',
  'Taller',
  'Biblioteca',
];

export const ModalCrearTipoItem: React.FC<ModalCrearTipoItemProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [flujo, setFlujo] = useState<FlujoTipoItem>('Requiere aprobación');
  const [estaciones, setEstaciones] = useState<string[]>(['Laboratorio A']);
  const [activo, setActivo] = useState(true);

  const toggleEstacion = (est: string) => {
    setEstaciones((prev) =>
      prev.includes(est) ? prev.filter((e) => e !== est) : [...prev, est]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      flujoPorDefecto: flujo,
      estaciones,
      activo,
    });

    setNombre('');
    setDescripcion('');
    setFlujo('Requiere aprobación');
    setEstaciones(['Laboratorio A']);
    setActivo(true);
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
        disabled={!nombre.trim()}
        style={{
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#FFFFFF',
          color: '#1C1C1C',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          cursor: !nombre.trim() ? 'not-allowed' : 'pointer',
          opacity: !nombre.trim() ? 0.4 : 1,
        }}
        onMouseOver={(e) => {
          if (nombre.trim()) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        }}
        onMouseOut={(e) => {
          if (nombre.trim()) e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        Crear tipo
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo tipo de ítem"
      subtitle="Define un tipo y el flujo que tendrán sus operaciones."
      width={560}
      footer={footer}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '12px' }}>
        {/* Nombre del tipo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Nombre del tipo
          </label>
          <input
            type="text"
            placeholder="Ej. Equipo de laboratorio"
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

        {/* Descripción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Descripción
          </label>
          <input
            type="text"
            placeholder="Describe qué recursos agrupa este tipo"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
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

        {/* Flujo por defecto (Segmented) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Flujo por defecto
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
              onClick={() => setFlujo('Requiere aprobación')}
              style={{
                flex: 1,
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: flujo === 'Requiere aprobación' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: flujo === 'Requiere aprobación' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: flujo === 'Requiere aprobación' ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              Requiere aprobación
            </button>
            <button
              type="button"
              onClick={() => setFlujo('Retiro directo')}
              style={{
                flex: 1,
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: flujo === 'Retiro directo' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: flujo === 'Retiro directo' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: flujo === 'Retiro directo' ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              Retiro directo
            </button>
          </div>
        </div>

        {/* Estaciones que lo administran */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Estaciones que lo administran
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {AVAILABLE_STATIONS.map((est) => {
              const isSelected = estaciones.includes(est);
              return (
                <div
                  key={est}
                  onClick={() => toggleEstacion(est)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  {est}
                </div>
              );
            })}
          </div>
        </div>

        {/* Toggle / Checkbox Tipo activo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <input
            type="checkbox"
            id="tipo-activo-cb"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#FFFFFF', cursor: 'pointer' }}
          />
          <label htmlFor="tipo-activo-cb" style={{ fontSize: '13px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
            Tipo activo
          </label>
        </div>

        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'Inter, sans-serif' }}>
          El flujo por defecto puede sobrescribirse en la configuración de cada Estación.
        </span>
      </form>
    </Modal>
  );
};
