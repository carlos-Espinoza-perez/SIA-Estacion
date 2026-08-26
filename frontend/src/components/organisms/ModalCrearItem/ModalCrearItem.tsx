import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atoms/Button/Button';
import { CrearItemFormData, EstadoItem, TipoItem, Item } from '../../../types/item';
import { itemService } from '../../../services/itemService';
import { estacionService } from '../../../services/estacionService';
import { Estacion } from '../../../types/estacion';

export interface ModalCrearItemProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearItemFormData) => void | Promise<void>;
}

const ESTADO_OPTIONS: EstadoItem[] = [
  'Disponible',
  'Prestado',
  'Mantenimiento',
  'Perdido',
];

function generarSiguienteCodigo(itemsExistentes: Item[]): string {
  let maxNumero = 0;
  for (const item of itemsExistentes) {
    const match = item.codigo?.match(/^(?:ITM|ITEM|IT)-0*(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNumero) {
        maxNumero = num;
      }
    }
  }
  const siguiente = maxNumero + 1;
  return `ITEM-${String(siguiente).padStart(3, '0')}`;
}

export const ModalCrearItem: React.FC<ModalCrearItemProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [itemsExistentes, setItemsExistentes] = useState<Item[]>([]);
  const [tiposDisponibles, setTiposDisponibles] = useState<TipoItem[]>([]);
  const [estacionesDisponibles, setEstacionesDisponibles] = useState<Estacion[]>([]);
  const [tipoItemId, setTipoItemId] = useState('');
  const [estacionId, setEstacionId] = useState('');
  const [unidades, setUnidades] = useState(1);
  const [estadoInicial, setEstadoInicial] = useState<EstadoItem>('Disponible');
  const [observaciones, setObservaciones] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setObservaciones('');

      Promise.all([
        itemService.getItems(),
        itemService.getTiposItem({ estado: 'Activo' }),
        estacionService.getEstaciones(),
      ]).then(([items, tipos, ests]) => {
        setItemsExistentes(items);
        setTiposDisponibles(tipos);
        setEstacionesDisponibles(ests);
        
        const sigCod = generarSiguienteCodigo(items);
        setCodigo(sigCod);

        if (tipos.length > 0 && !tipoItemId) {
          setTipoItemId(tipos[0].id);
        }
        if (ests.length > 0 && !estacionId) {
          setEstacionId(ests[0].id);
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  // Validar si el código actual ya existe en la base de datos
  const esCodigoDuplicado = useMemo(() => {
    const cleanCodigo = codigo.trim().toLowerCase();
    if (!cleanCodigo) return false;
    return itemsExistentes.some((i) => i.codigo?.trim().toLowerCase() === cleanCodigo);
  }, [codigo, itemsExistentes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !codigo.trim() || esCodigoDuplicado) return;

    const tipoObj = tiposDisponibles.find((t) => t.id === tipoItemId);
    const estObj = estacionesDisponibles.find((e) => e.id === estacionId);

    setIsSaving(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        codigo: codigo.trim(),
        tipo: tipoObj?.nombre || 'General',
        tipoItemId: tipoItemId || undefined,
        estacion: estObj?.nombre || 'General',
        estacionId: estacionId || undefined,
        unidades,
        estadoInicial,
        observaciones: observaciones.trim(),
      });

      setNombre('');
      setCodigo('');
      setObservaciones('');
      onClose();
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
        disabled={!nombre.trim() || !codigo.trim() || esCodigoDuplicado}
        isLoading={isSaving}
      >
        Crear ítem
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo ítem"
      subtitle="Registra un ítem gestionable y su etiqueta QR consecutivo."
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

        {/* Código / etiqueta QR (No editable / Autogenerado) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Código / etiqueta QR
            </label>
            <span
              style={{
                fontSize: '11px',
                color: '#ADADFB',
                backgroundColor: 'rgba(173, 173, 251, 0.12)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              🔒 Autogenerado
            </span>
          </div>
          <input
            type="text"
            readOnly={true}
            value={codigo}
            style={{
              height: '38px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(173, 173, 251, 0.25)',
              borderRadius: '8px',
              padding: '0 12px',
              color: '#ADADFB',
              fontWeight: 600,
              fontSize: '14px',
              fontFamily: 'monospace',
              outline: 'none',
              cursor: 'not-allowed',
              userSelect: 'all',
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
              value={tipoItemId}
              onChange={(e) => setTipoItemId(e.target.value)}
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
              {tiposDisponibles.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Estación asignada
            </label>
            <select
              value={estacionId}
              onChange={(e) => setEstacionId(e.target.value)}
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
              <option value="">Sin asignar / General</option>
              {estacionesDisponibles.map((est) => (
                <option key={est.id} value={est.id}>{est.nombre} ({est.ubicacion})</option>
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
