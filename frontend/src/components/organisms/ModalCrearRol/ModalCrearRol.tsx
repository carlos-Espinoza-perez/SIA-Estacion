import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atoms/Button/Button';
import { CrearRolFormData, Rol, Privilegio } from '../../../types/rol';
import { rolService } from '../../../services/rolService';

export interface ModalCrearRolProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CrearRolFormData) => void | Promise<void>;
  rolesExistentes: Rol[];
}

export const ModalCrearRol: React.FC<ModalCrearRolProps> = ({
  isOpen,
  onClose,
  onSubmit,
  rolesExistentes,
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [baseRolId, setBaseRolId] = useState('');
  const [activo, setActivo] = useState(true);
  const [privilegiosDisponibles, setPrivilegiosDisponibles] = useState<Privilegio[]>([]);
  const [privilegiosSeleccionados, setPrivilegiosSeleccionados] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setDescripcion('');
      setBaseRolId('');
      setActivo(true);
      setPrivilegiosSeleccionados([]);
      rolService.getPrivilegios().then((privs) => {
        setPrivilegiosDisponibles(privs);
      });
    }
  }, [isOpen]);

  const handleBaseRolChange = (rolId: string) => {
    setBaseRolId(rolId);
    if (!rolId) {
      setPrivilegiosSeleccionados([]);
      return;
    }
    const found = rolesExistentes.find((r) => r.id === rolId);
    if (found) {
      const matching = privilegiosDisponibles
        .filter((p) => found.permisos.includes(p.codigo))
        .map((p) => p.id);
      setPrivilegiosSeleccionados(matching);
    }
  };

  const togglePrivilegio = (privId: string) => {
    setPrivilegiosSeleccionados((prev) =>
      prev.includes(privId) ? prev.filter((id) => id !== privId) : [...prev, privId]
    );
  };

  const handleSelectAll = () => {
    if (privilegiosSeleccionados.length === privilegiosDisponibles.length) {
      setPrivilegiosSeleccionados([]);
    } else {
      setPrivilegiosSeleccionados(privilegiosDisponibles.map((p) => p.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !descripcion.trim()) return;

    setIsSaving(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        baseRolId: baseRolId || undefined,
        activo,
        permisos: privilegiosSeleccionados,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const modulos = Array.from(new Set(privilegiosDisponibles.map((p) => p.modulo)));

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
        disabled={!nombre.trim() || !descripcion.trim()}
        isLoading={isSaving}
      >
        Crear rol
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo rol"
      subtitle="Define un nuevo perfil de permisos en el sistema."
      width={640}
      footer={footer}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '12px' }}>
        {/* Nombre del rol */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Nombre del rol
          </label>
          <input
            type="text"
            placeholder="Ej. Encargado de biblioteca"
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
            placeholder="Qué puede hacer este rol dentro del sistema."
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

        {/* Partir de un rol existente & Switch Activo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Partir de un rol existente
            </label>
            <select
              value={baseRolId}
              onChange={(e) => handleBaseRolChange(e.target.value)}
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
              <option value="">Ninguno (empezar en blanco)</option>
              {rolesExistentes.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>

          <div
            onClick={() => setActivo(!activo)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              height: '38px',
              padding: '0 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 500 }}>Rol activo</span>
            <div
              style={{
                width: '32px',
                height: '18px',
                borderRadius: '9px',
                backgroundColor: activo ? '#22C55E' : 'rgba(255, 255, 255, 0.2)',
                position: 'relative',
                transition: 'background-color 0.2s',
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  top: '2px',
                  left: activo ? '16px' : '2px',
                  transition: 'left 0.2s',
                }}
              />
            </div>
          </div>
        </div>

        {/* Header Permisos Disponibles & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
              Privilegios disponibles
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
              }}
            >
              {privilegiosSeleccionados.length} de {privilegiosDisponibles.length}
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            style={{ color: '#ADADFB', fontSize: '12px', padding: '2px 4px', height: 'auto' }}
          >
            {privilegiosSeleccionados.length === privilegiosDisponibles.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </Button>
        </div>

        {/* Lista de Permisos Agrupados */}
        <div
          style={{
            maxHeight: '280px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingRight: '6px',
          }}
        >
          {modulos.map((modulo) => {
            const privsModulo = privilegiosDisponibles.filter((p) => p.modulo === modulo);
            return (
              <div key={modulo} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: 'rgba(255, 255, 255, 0.4)',
                    textTransform: 'uppercase',
                  }}
                >
                  Módulo {modulo}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {privsModulo.map((perm) => {
                    const isSelected = privilegiosSeleccionados.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePrivilegio(perm.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? 'rgba(173, 173, 251, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${isSelected ? 'rgba(173, 173, 251, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF', fontFamily: 'monospace' }}>
                            [{perm.codigo}] {perm.nombre}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `1px solid ${isSelected ? '#ADADFB' : 'rgba(255, 255, 255, 0.25)'}`,
                            backgroundColor: isSelected ? '#ADADFB' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1E1E1E',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && '✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </form>
    </Modal>
  );
};
