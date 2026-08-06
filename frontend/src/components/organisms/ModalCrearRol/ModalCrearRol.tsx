import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal/Modal';
import { CrearRolFormData, Rol, CategoriaPermiso } from '../../../types/rol';
import { PERMISOS_SISTEMA } from '../../../services/rolService';

export interface ModalCrearRolProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CrearRolFormData) => void;
  rolesExistentes: Rol[];
}

const CATEGORIAS_ORDEN: CategoriaPermiso[] = [
  'ACCESOS',
  'ÍTEMS',
  'CATÁLOGOS',
  'ADMINISTRACIÓN',
  'AUDITORÍA',
];

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
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setDescripcion('');
      setBaseRolId('');
      setActivo(true);
      setPermisosSeleccionados([]);
    }
  }, [isOpen]);

  // If user picks a base role, copy its permissions
  const handleBaseRolChange = (rolId: string) => {
    setBaseRolId(rolId);
    if (!rolId) {
      setPermisosSeleccionados([]);
      return;
    }
    const found = rolesExistentes.find((r) => r.id === rolId);
    if (found) {
      setPermisosSeleccionados([...found.permisos]);
    }
  };

  const togglePermiso = (codigo: string) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(codigo) ? prev.filter((p) => p !== codigo) : [...prev, codigo]
    );
  };

  const handleSelectAll = () => {
    if (permisosSeleccionados.length === PERMISOS_SISTEMA.length) {
      setPermisosSeleccionados([]);
    } else {
      setPermisosSeleccionados(PERMISOS_SISTEMA.map((p) => p.codigo));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !descripcion.trim()) return;

    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      baseRolId: baseRolId || undefined,
      activo,
      permisos: permisosSeleccionados,
    });

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
        disabled={!nombre.trim() || !descripcion.trim()}
        style={{
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#FFFFFF',
          color: '#1C1C1C',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          cursor: !nombre.trim() || !descripcion.trim() ? 'not-allowed' : 'pointer',
          opacity: !nombre.trim() || !descripcion.trim() ? 0.4 : 1,
        }}
        onMouseOver={(e) => {
          if (nombre.trim() && descripcion.trim()) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        }}
        onMouseOut={(e) => {
          if (nombre.trim() && descripcion.trim()) e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        Crear rol
      </button>
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

        {/* Banner Informativo sobre Claims */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.65)',
            lineHeight: '1.45',
          }}
        >
          💡 <strong style={{ color: '#FFFFFF' }}>Claims sobre ASP.NET Core Identity:</strong> Los permisos seleccionados se guardan como Claims. Un rol nuevo no requiere cambios en el código ni despliegues adicionales.
        </div>

        {/* Header Permisos Disponibles & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
              Permisos disponibles
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
              {permisosSeleccionados.length} de {PERMISOS_SISTEMA.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSelectAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#3B82F6',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '2px 4px',
            }}
          >
            {permisosSeleccionados.length === PERMISOS_SISTEMA.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
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
          {CATEGORIAS_ORDEN.map((cat) => {
            const permisosCat = PERMISOS_SISTEMA.filter((p) => p.categoria === cat);
            return (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  {cat}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {permisosCat.map((perm) => {
                    const isSelected = permisosSeleccionados.includes(perm.codigo);
                    return (
                      <div
                        key={perm.codigo}
                        onClick={() => togglePermiso(perm.codigo)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${isSelected ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.06)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF', fontFamily: 'monospace' }}>
                            {perm.nombre}
                          </div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)' }}>
                            {perm.descripcion}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `1px solid ${isSelected ? '#22C55E' : 'rgba(255, 255, 255, 0.25)'}`,
                            backgroundColor: isSelected ? '#22C55E' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
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
