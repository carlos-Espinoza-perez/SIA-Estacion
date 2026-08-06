import React, { useState, useEffect } from 'react';
import { Rol, CrearRolFormData, CategoriaPermiso } from '../../../types/rol';
import { PERMISOS_SISTEMA } from '../../../services/rolService';
import { ConfirmModal } from '../../molecules/ConfirmModal/ConfirmModal';

export interface CrearRolDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CrearRolFormData, rolId?: string) => void;
  onDelete?: (rolId: string) => void;
  rolesExistentes: Rol[];
  rolAEditar?: Rol | null;
}

const CATEGORIAS_ORDEN: CategoriaPermiso[] = [
  'ACCESOS',
  'ÍTEMS',
  'CATÁLOGOS',
  'ADMINISTRACIÓN',
  'AUDITORÍA',
];

export const CrearRolDrawer: React.FC<CrearRolDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  rolesExistentes,
  rolAEditar,
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [baseRolId, setBaseRolId] = useState('');
  const [activo, setActivo] = useState(true);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([
    'acceso.consultar',
    'item.aprobar',
    'item.entregar',
    'item.registrar',
    'auditoria.consultar',
  ]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset or initialize on open / when rolAEditar changes
  useEffect(() => {
    if (isOpen) {
      if (rolAEditar) {
        setNombre(rolAEditar.nombre);
        setDescripcion(rolAEditar.descripcion);
        setBaseRolId('');
        setActivo(rolAEditar.activo ?? true);
        setPermisosSeleccionados([...rolAEditar.permisos]);
      } else {
        setNombre('');
        setDescripcion('');
        setBaseRolId('');
        setActivo(true);
        setPermisosSeleccionados([
          'acceso.consultar',
          'item.aprobar',
          'item.entregar',
          'item.registrar',
          'auditoria.consultar',
        ]);
      }
    }
  }, [isOpen, rolAEditar]);

  if (!isOpen) return null;

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

    onSubmit(
      {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        baseRolId: baseRolId || undefined,
        activo,
        permisos: permisosSeleccionados,
      },
      rolAEditar?.id
    );

    onClose();
  };

  const handleConfirmDelete = async () => {
    if (!rolAEditar || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(rolAEditar.id);
      setIsDeleteModalOpen(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

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
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(3px)',
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
          maxWidth: '94vw',
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
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                {rolAEditar ? `Editar rol: ${rolAEditar.nombre}` : 'Nuevo rol'}
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
                Roles y permisos
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)', margin: '4px 0 0' }}>
              {rolAEditar
                ? 'Modifica los claims y configuración del rol en ASP.NET Core Identity.'
                : 'Define un nuevo perfil de permisos en el sistema.'}
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

        {/* Scrollable Content Body */}
        <div
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* Card 1: Datos del rol */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
              Datos del rol
            </span>

            {/* Nombre del rol */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500 }}>
                Nombre del rol
              </label>
              <input
                type="text"
                placeholder="Ej. Encargado de biblioteca"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={{
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0 12px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
              />
            </div>

            {/* Descripción */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500 }}>
                Descripción
              </label>
              <textarea
                placeholder="Qué puede hacer este rol dentro del sistema."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                style={{
                  minHeight: '76px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: '1.4',
                }}
              />
            </div>

            {/* Partir de un rol existente */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500 }}>
                Partir de un rol existente
              </label>
              <select
                value={baseRolId}
                onChange={(e) => handleBaseRolChange(e.target.value)}
                style={{
                  height: '40px',
                  backgroundColor: '#2A2A2A',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0 12px',
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

            {/* Rol activo Switch */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 0',
              }}
            >
              <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 500 }}>
                Rol activo
              </span>
              <div
                onClick={() => setActivo(!activo)}
                style={{
                  width: '36px',
                  height: '20px',
                  borderRadius: '10px',
                  backgroundColor: activo ? '#71DD8C' : 'rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  cursor: 'pointer',
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
                    top: '3px',
                    left: activo ? '19px' : '3px',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </div>

            {/* Separador */}
            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Conteo de permisos */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                Permisos seleccionados
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                {permisosSeleccionados.length} de {PERMISOS_SISTEMA.length}
              </span>
            </div>

            {/* Párrafo explicativo ASP.NET Core Identity */}
            <p
              style={{
                fontSize: '11.5px',
                color: 'rgba(255, 255, 255, 0.45)',
                lineHeight: '1.45',
                margin: 0,
              }}
            >
              Los permisos se guardan como Claims sobre ASP.NET Core Identity. Un rol nuevo no requiere cambios en el código ni un nuevo despliegue.
            </p>

            {/* Separador */}
            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Advertencia de rol.gestionar */}
            <p
              style={{
                fontSize: '11.5px',
                color: 'rgba(255, 255, 255, 0.45)',
                lineHeight: '1.45',
                margin: 0,
              }}
            >
              Ningún rol puede autoasignarse <code>rol.gestionar</code>. Solo un Administrador existente puede concederlo.
            </p>
          </div>

          {/* Card 2: Permisos disponibles */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Header Permisos */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                Permisos disponibles
              </span>

              <button
                type="button"
                onClick={handleSelectAll}
                style={{
                  height: '26px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
              >
                {permisosSeleccionados.length === PERMISOS_SISTEMA.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>

            {/* Categorías y Claims */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {CATEGORIAS_ORDEN.map((cat) => {
                const permisosCat = PERMISOS_SISTEMA.filter((p) => p.categoria === cat);
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Encabezado Categoría */}
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: 'rgba(255, 255, 255, 0.4)',
                      }}
                    >
                      {cat}
                    </span>

                    {/* Filas de Permisos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {permisosCat.map((perm) => {
                        const isSelected = permisosSeleccionados.includes(perm.codigo);
                        return (
                          <div
                            key={perm.codigo}
                            onClick={() => togglePermiso(perm.codigo)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                              transition: 'background-color 0.1s ease',
                            }}
                            onMouseOver={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                            }}
                            onMouseOut={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {/* Checkbox Cuadrado */}
                            <div
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '4px',
                                border: `1px solid ${isSelected ? '#71DD8C' : 'rgba(255, 255, 255, 0.16)'}`,
                                backgroundColor: isSelected ? 'rgba(113, 221, 140, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#71DD8C',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                flexShrink: 0,
                              }}
                            >
                              {isSelected && '✓'}
                            </div>

                            {/* Contenido del Claim */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 }}>
                              <span
                                style={{
                                  fontSize: '13px',
                                  fontWeight: isSelected ? 600 : 500,
                                  color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {perm.codigo}
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: isSelected ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.35)',
                                }}
                              >
                                {perm.descripcion}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: '#242424',
          }}
        >
          {rolAEditar && !rolAEditar.esSistema && onDelete ? (
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
              Eliminar rol
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 18px',
                height: '38px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!nombre.trim() || !descripcion.trim()}
              style={{
                padding: '8px 22px',
                height: '38px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#ADADFB',
                color: '#17171C',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                cursor: !nombre.trim() || !descripcion.trim() ? 'not-allowed' : 'pointer',
                opacity: !nombre.trim() || !descripcion.trim() ? 0.45 : 1,
                boxShadow: '0 2px 10px rgba(173, 173, 251, 0.2)',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                if (nombre.trim() && descripcion.trim()) e.currentTarget.style.backgroundColor = '#BFBFFC';
              }}
              onMouseOut={(e) => {
                if (nombre.trim() && descripcion.trim()) e.currentTarget.style.backgroundColor = '#ADADFB';
              }}
            >
              {rolAEditar ? 'Guardar cambios' : 'Crear rol'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Delete Role Modal */}
      {rolAEditar && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Eliminar rol"
          message={`¿Estás seguro de que deseas eliminar el rol "${rolAEditar.nombre}"? Los usuarios con este rol perderán sus claims asociados.`}
          confirmText="Eliminar rol"
          isDestructive={true}
          isLoading={isDeleting}
        />
      )}
    </>
  );
};
