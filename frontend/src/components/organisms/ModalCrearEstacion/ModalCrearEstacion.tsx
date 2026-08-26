import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atoms/Button/Button';
import { CrearEstacionFormData, Estacion, FlujoEstacion } from '../../../types/estacion';
import { personaService } from '../../../services/personaService';
import { Persona } from '../../../types/persona';

export interface ModalCrearEstacionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearEstacionFormData) => Promise<Estacion | void>;
  onEstacionCreada?: (estacion: Estacion) => void;
}

const TIPO_RECURSO_OPTIONS = [
  'Control de acceso',
  'Equipo de laboratorio',
  'Material bibliográfico',
];

export const ModalCrearEstacion: React.FC<ModalCrearEstacionProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onEstacionCreada,
}) => {
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [tipoRecurso, setTipoRecurso] = useState('Control de acceso');
  const [flujo, setFlujo] = useState<FlujoEstacion>('Aprobación');
  const [encargadoId, setEncargadoId] = useState('');
  const [encargado, setEncargado] = useState('');
  const [encargadosDisponibles, setEncargadosDisponibles] = useState<Persona[]>([]);
  const [identificadorDispositivo, setIdentificadorDispositivo] = useState('EST-LAB-C-01');
  const [modoOffline, setModoOffline] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setUbicacion('');
      setIdentificadorDispositivo(`EST-PUNTO-0${Math.floor(1 + Math.random() * 9)}`);
      personaService.getPersonas({ tipo: 'Personal', estado: 'Activo', limite: 100 })
        .then((res) => {
          const personal = res.data.filter((p) => p.tipo !== 'Estudiante');
          setEncargadosDisponibles(personal);
          if (personal.length > 0 && !encargadoId) {
            setEncargadoId(personal[0].id);
            setEncargado(personal[0].nombre);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !ubicacion.trim()) return;

    setIsSaving(true);
    try {
      const nuevaEstacion = await onSubmit({
        nombre: nombre.trim(),
        ubicacion: ubicacion.trim(),
        tipoRecurso,
        flujo: tipoRecurso === 'Control de acceso' ? '—' : flujo,
        encargadoId: encargadoId || undefined,
        encargado: encargado || 'Sin asignar',
        identificadorDispositivo: identificadorDispositivo.trim(),
        modoOffline,
      });

      onClose();
      if (nuevaEstacion && onEstacionCreada) {
        onEstacionCreada(nuevaEstacion);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
        Cancelar
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={!nombre.trim() || !ubicacion.trim()}
        isLoading={isSaving}
      >
        Crear y Escanear QR
      </Button>
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
              <Button
                type="button"
                variant={flujo === 'Aprobación' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFlujo('Aprobación')}
                style={{ flex: 1, height: '32px' }}
              >
                Aprobación
              </Button>
              <Button
                type="button"
                variant={flujo === 'Directo' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFlujo('Directo')}
                style={{ flex: 1, height: '32px' }}
              >
                Directo
              </Button>
            </div>
          </div>
        )}

        {/* Encargado asignado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Encargado asignado
          </label>
          <select
            value={encargadoId}
            onChange={(e) => {
              const selectedId = e.target.value;
              setEncargadoId(selectedId);
              const found = encargadosDisponibles.find((p) => p.id === selectedId);
              setEncargado(found ? found.nombre : '');
            }}
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
            <option value="">Sin asignar</option>
            {encargadosDisponibles.map((enc) => (
              <option key={enc.id} value={enc.id}>
                {enc.nombre} ({enc.carnet})
              </option>
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
            <Button
              type="button"
              variant={modoOffline ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setModoOffline(true)}
              style={{ flex: 1, height: '32px' }}
            >
              Habilitado
            </Button>
            <Button
              type="button"
              variant={!modoOffline ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setModoOffline(false)}
              style={{ flex: 1, height: '32px' }}
            >
              Deshabilitado
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
