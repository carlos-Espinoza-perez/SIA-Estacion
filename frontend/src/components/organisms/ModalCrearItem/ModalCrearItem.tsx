import React, { useState } from 'react';
import { Modal } from '../Modal/Modal';
import { CrearItemFormData, EstadoItem } from '../../../types/item';

export interface ModalCrearItemProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearItemFormData) => void;
}

const TIPO_OPTIONS = [
  'Componentes electrónicos',
  'Equipo de laboratorio',
  'Material bibliográfico',
  'Mobiliario',
];

const ESTACION_OPTIONS = [
  'Laboratorio A',
  'Laboratorio B',
  'Taller',
  'Biblioteca',
];

const ESTADO_OPTIONS: EstadoItem[] = [
  'Disponible',
  'Prestado',
  'Mantenimiento',
  'Perdido',
];

export const ModalCrearItem: React.FC<ModalCrearItemProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('IT-0432');
  const [tipo, setTipo] = useState('Componentes electrónicos');
  const [estacion, setEstacion] = useState('Laboratorio A');
  const [unidades, setUnidades] = useState(1);
  const [estadoInicial, setEstadoInicial] = useState<EstadoItem>('Disponible');
  const [observaciones, setObservaciones] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !codigo.trim()) return;

    onSubmit({
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      tipo,
      estacion,
      unidades,
      estadoInicial,
      observaciones: observaciones.trim(),
    });

    setNombre('');
    setCodigo(`IT-0${Math.floor(100 + Math.random() * 900)}`);
    setObservaciones('');
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
        disabled={!nombre.trim() || !codigo.trim()}
        style={{
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#FFFFFF',
          color: '#1C1C1C',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          cursor: !nombre.trim() || !codigo.trim() ? 'not-allowed' : 'pointer',
          opacity: !nombre.trim() || !codigo.trim() ? 0.4 : 1,
        }}
        onMouseOver={(e) => {
          if (nombre.trim() && codigo.trim()) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        }}
        onMouseOut={(e) => {
          if (nombre.trim() && codigo.trim()) e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        Crear ítem
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo ítem"
      subtitle="Registra un ítem gestionable y su etiqueta QR."
      width={560}
      footer={footer}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '12px' }}>
        {/* Nombre del ítem */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Nombre del ítem
          </label>
          <input
            type="text"
            placeholder="Ej. Multímetro digital UNI-T"
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

        {/* Código / etiqueta QR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Código / etiqueta QR
          </label>
          <input
            type="text"
            placeholder="IT-0432"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
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

        {/* Grid: Tipo de ítem & Estación asignada */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Tipo de ítem
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
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
              {TIPO_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Estación asignada
            </label>
            <select
              value={estacion}
              onChange={(e) => setEstacion(e.target.value)}
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
              {ESTACION_OPTIONS.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid: Unidades & Estado inicial */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Unidades
            </label>
            <input
              type="number"
              min={1}
              value={unidades}
              onChange={(e) => setUnidades(Math.max(1, parseInt(e.target.value) || 1))}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Estado inicial
            </label>
            <select
              value={estadoInicial}
              onChange={(e) => setEstadoInicial(e.target.value as EstadoItem)}
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
              {ESTADO_OPTIONS.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Observaciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Observaciones
          </label>
          <textarea
            rows={3}
            placeholder="Accesorios incluidos, número de serie, condición de entrega."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              resize: 'none',
            }}
          />
        </div>
      </form>
    </Modal>
  );
};
