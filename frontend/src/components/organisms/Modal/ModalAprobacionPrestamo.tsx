import React, { useState } from 'react';
import { Modal } from '../Modal/Modal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AprobacionPrestamoData {
  folio: string;
  fechaSolicitud: string;
  solicitante: {
    nombre: string;
    carnet: string;
    rol: string;
    carrera: string;
    prestamosActivos: number;
    devolucionesAtrasadas: number;
  };
  item: {
    nombre: string;
    codigo: string;
    categoria: string;
    estado: 'Disponible' | 'En préstamo' | 'Mantenimiento';
    disponibles: number;
    total: number;
  };
  estacion: string;
  flujo: string;
  validacion: string;
}

export interface ModalAprobacionPrestamoProps {
  isOpen: boolean;
  onClose: () => void;
  data: AprobacionPrestamoData;
  onAprobar: (nota: string, fechaDevolucion: string, cantidad: number) => void;
  onRechazar: () => void;
}

// ─── Sub-componentes internos ─────────────────────────────────────────────────

const Divider = () => (
  <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 0 20px' }} />
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      fontSize: '12px',
      color: 'rgba(255,255,255,0.4)',
      fontFamily: 'Inter, sans-serif',
      display: 'block',
      marginBottom: '8px',
    }}
  >
    {children}
  </span>
);

const FieldValue: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      display: 'block',
      lineHeight: '20px',
    }}
  >
    {children}
  </span>
);

const FieldValueMuted: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      fontSize: '12px',
      color: 'rgba(255,255,255,0.4)',
      fontFamily: 'Inter, sans-serif',
      display: 'block',
      lineHeight: '16px',
      marginTop: '2px',
    }}
  >
    {children}
  </span>
);

const ModalInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}> = ({ value, onChange, type = 'text', placeholder }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: '100%',
      height: '44px',
      padding: '0 16px',
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#FFFFFF',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.15s ease',
    }}
    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
  />
);

// ─── Modal principal ─────────────────────────────────────────────────────────

export const ModalAprobacionPrestamo: React.FC<ModalAprobacionPrestamoProps> = ({
  isOpen,
  onClose,
  data,
  onAprobar,
  onRechazar,
}) => {
  const [fechaDevolucion, setFechaDevolucion] = useState('30/07/2026');
  const [cantidad, setCantidad]               = useState('1');
  const [nota, setNota]                       = useState('Entregar únicamente con las puntas de prueba completas.');

  const handleAprobar = () => {
    onAprobar(nota, fechaDevolucion, parseInt(cantidad, 10) || 1);
  };

  const footer = (
    <>
      {/* Botón Rechazar */}
      <button
        onClick={onRechazar}
        style={{
          height: '44px',
          padding: '0 24px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '8px',
          color: '#FFFFFF',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
      >
        Rechazar
      </button>

      {/* Botón Aprobar */}
      <button
        onClick={handleAprobar}
        style={{
          height: '44px',
          padding: '0 28px',
          backgroundColor: '#ADADFB',
          border: 'none',
          borderRadius: '8px',
          color: '#17171C',
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
          transition: 'opacity 0.15s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = '0.88')}
        onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
      >
        Aprobar solicitud
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Aprobar solicitud de préstamo"
      subtitle={`Folio ${data.folio} · solicitada el ${data.fechaSolicitud}`}
      width={640}
      footer={footer}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>

        {/* ── Sección: Solicitante ── */}
        <div>
          <SectionLabel>Solicitante</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {data.solicitante.nombre.charAt(0)}
            </div>

            {/* Info solicitante */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <FieldValue>{data.solicitante.nombre}</FieldValue>
              <FieldValueMuted>
                {data.solicitante.carnet} · {data.solicitante.rol} · {data.solicitante.carrera}
              </FieldValueMuted>
            </div>

            {/* Stats */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <FieldValue>{data.solicitante.prestamosActivos} préstamos activos</FieldValue>
              <FieldValueMuted>{data.solicitante.devolucionesAtrasadas} devoluciones atrasadas</FieldValueMuted>
            </div>
          </div>
        </div>

        <Divider />

        {/* ── Sección: Ítem ── */}
        <div>
          <SectionLabel>Ítem solicitado</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <FieldValue>{data.item.nombre}</FieldValue>
              <FieldValueMuted>
                {data.item.codigo} · {data.item.categoria}
              </FieldValueMuted>
            </div>
            {/* Badge estado ítem */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginTop: '2px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#71DD8C',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '14px', color: '#71DD8C', fontFamily: 'Inter, sans-serif' }}>
                {data.item.estado}
              </span>
            </div>
          </div>
        </div>

        <Divider />

        {/* ── Sección: Estación / Flujo / Validación / Disponibles ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
          <div>
            <SectionLabel>Estación</SectionLabel>
            <FieldValue>{data.estacion}</FieldValue>
          </div>
          <div>
            <SectionLabel>Flujo configurado</SectionLabel>
            <FieldValue>{data.flujo}</FieldValue>
          </div>
          <div>
            <SectionLabel>Validación en el escaneo</SectionLabel>
            <FieldValue>{data.validacion}</FieldValue>
          </div>
          <div>
            <SectionLabel>Disponibles de este tipo</SectionLabel>
            <FieldValue>{data.item.disponibles} de {data.item.total}</FieldValue>
          </div>
        </div>

        <Divider />

        {/* ── Sección: Fecha devolución + Cantidad ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
          <div>
            <SectionLabel>Fecha de devolución prevista</SectionLabel>
            <ModalInput
              value={fechaDevolucion}
              onChange={setFechaDevolucion}
              type="text"
              placeholder="dd/mm/aaaa"
            />
          </div>
          <div>
            <SectionLabel>Cantidad</SectionLabel>
            <ModalInput
              value={cantidad}
              onChange={setCantidad}
              type="number"
              placeholder="1"
            />
          </div>
        </div>

        {/* ── Sección: Nota del encargado ── */}
        <div>
          <SectionLabel>Nota del encargado (opcional)</SectionLabel>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Escribe una nota..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              lineHeight: '1.5',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
      </div>
    </Modal>
  );
};
