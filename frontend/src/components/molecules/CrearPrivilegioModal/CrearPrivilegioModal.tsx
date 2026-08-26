import React, { useState, useEffect } from 'react';
import { Modal } from '../../organisms/Modal/Modal';
import { Button } from '../../atoms/Button/Button';
import { Privilegio } from '../../../types/rol';

export interface CrearPrivilegioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { codigo: string; nombre: string; modulo: string }) => Promise<void>;
  privilegiosExistentes: Privilegio[];
}

export const CrearPrivilegioModal: React.FC<CrearPrivilegioModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  privilegiosExistentes,
}) => {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [modulo, setModulo] = useState('');
  const [moduloPersonalizado, setModuloPersonalizado] = useState('');
  const [isCustomModulo, setIsCustomModulo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Módulos sugeridos extraídos de los privilegios existentes
  const modulosExistentes = Array.from(
    new Set(privilegiosExistentes.map((p) => p.modulo).filter(Boolean))
  );

  useEffect(() => {
    if (isOpen) {
      setCodigo('');
      setNombre('');
      setModulo(modulosExistentes[0] || 'Operaciones');
      setModuloPersonalizado('');
      setIsCustomModulo(false);
      setError(null);
    }
  }, [isOpen]);

  const handleCodigoChange = (val: string) => {
    // Forzar mayúsculas y solo letras/números, max 6 caracteres
    const sanitized = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCodigo(sanitized);
    if (privilegiosExistentes.some((p) => p.codigo.toUpperCase() === sanitized)) {
      setError(`El código "${sanitized}" ya existe en el sistema`);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const moduloFinal = isCustomModulo ? moduloPersonalizado.trim() : modulo.trim();
    if (!codigo.trim() || !nombre.trim() || !moduloFinal) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (privilegiosExistentes.some((p) => p.codigo.toUpperCase() === codigo.toUpperCase())) {
      setError(`El código "${codigo}" ya está en uso.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        codigo: codigo.trim().toUpperCase(),
        nombre: nombre.trim(),
        modulo: moduloFinal,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear el privilegio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const moduloActual = isCustomModulo ? (moduloPersonalizado || 'Nuevo Módulo') : modulo;

  const footer = (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={isSubmitting || !codigo.trim() || !nombre.trim() || !(isCustomModulo ? moduloPersonalizado.trim() : modulo)}
        isLoading={isSubmitting}
      >
        Guardar Privilegio
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Privilegio del Sistema"
      subtitle="Define un nuevo permiso o recurso protegible para el control de acceso."
      width={560}
      footer={footer}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '8px' }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Código del Privilegio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              Código Nemotécnico <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
              2 a 6 caracteres alfanuméricos
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Ej. BIB, LAB, REP"
              value={codigo}
              onChange={(e) => handleCodigoChange(e.target.value)}
              required
              maxLength={6}
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '10px',
                padding: '0 14px',
                color: '#ADADFB',
                fontSize: '15px',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '0.08em',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)' }}>
            Se usará en políticas de seguridad como claim (ej. <code>{codigo ? `${codigo}:L` : 'CODIGO:L'}</code>)
          </span>
        </div>

        {/* Nombre Descriptivo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
            Nombre del Privilegio <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Ej. Préstamos de Laboratorio de Química"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={{
              width: '100%',
              height: '42px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '10px',
              padding: '0 14px',
              color: '#FFFFFF',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Módulo / Categoría */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
            Módulo del Sistema <span style={{ color: '#EF4444' }}>*</span>
          </label>

          {/* Chips de selección rápida */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
            {modulosExistentes.map((m) => {
              const isSelected = !isCustomModulo && modulo === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setModulo(m);
                    setIsCustomModulo(false);
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${isSelected ? '#ADADFB' : 'rgba(255, 255, 255, 0.1)'}`,
                    backgroundColor: isSelected ? 'rgba(173, 173, 251, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '12px',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsCustomModulo(true)}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: `1px solid ${isCustomModulo ? '#ADADFB' : 'rgba(255, 255, 255, 0.1)'}`,
                backgroundColor: isCustomModulo ? 'rgba(173, 173, 251, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: isCustomModulo ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                fontSize: '12px',
                fontWeight: isCustomModulo ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              + Otro Módulo
            </button>
          </div>

          {isCustomModulo && (
            <input
              type="text"
              placeholder="Escribe el nombre del nuevo módulo (Ej. Biblioteca, Cafetería)"
              value={moduloPersonalizado}
              onChange={(e) => setModuloPersonalizado(e.target.value)}
              autoFocus
              required
              style={{
                width: '100%',
                height: '38px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #ADADFB',
                borderRadius: '8px',
                padding: '0 12px',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>

        {/* Vista previa en vivo */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Vista previa en la Matriz de Seguridad
          </span>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ADADFB',
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(173, 173, 251, 0.12)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {codigo || 'COD'}
              </span>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#FFFFFF' }}>
                  {nombre || 'Nombre del privilegio'}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  Módulo: {moduloActual}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontWeight: 600 }}>L</span>
              <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', fontWeight: 600 }}>E</span>
              <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ADE80', fontWeight: 600 }}>T</span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
