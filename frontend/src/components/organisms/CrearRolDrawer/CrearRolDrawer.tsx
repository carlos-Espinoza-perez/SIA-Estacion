import React, { useState, useEffect } from 'react';
import { Rol, CrearRolFormData, Privilegio, NivelPermiso } from '../../../types/rol';
import { ConfirmModal } from '../../molecules/ConfirmModal/ConfirmModal';

export interface CrearRolDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CrearRolFormData, rolId?: string) => void;
  onDelete?: (rolId: string) => void;
  rolesExistentes: Rol[];
  rolAEditar?: Rol | null;
  privilegiosDisponibles?: Privilegio[];
  nivelesDisponibles?: NivelPermiso[];
}

export const CrearRolDrawer: React.FC<CrearRolDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  rolesExistentes,
  rolAEditar,
  privilegiosDisponibles = [],
  nivelesDisponibles = [],
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [baseRolId, setBaseRolId] = useState('');
  const [activo, setActivo] = useState(true);
  const [nivelPorDefecto, setNivelPorDefecto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  
  // Mapa de { [privilegioId]: nivelCodigo ('NINGUNO' | 'L' | 'E' | 'T') }
  const [nivelesPorPrivilegio, setNivelesPorPrivilegio] = useState<Record<string, string>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Inicializar o resetear al abrir
  useEffect(() => {
    if (isOpen) {
      setBusqueda('');
      const defaultNivel = nivelesDisponibles.find((n) => n.codigo === 'L')?.id || nivelesDisponibles[0]?.id || '';
      setNivelPorDefecto(defaultNivel);

      if (rolAEditar) {
        setNombre(rolAEditar.nombre);
        setDescripcion(rolAEditar.descripcion || '');
        setBaseRolId('');
        setActivo(rolAEditar.activo ?? true);

        // Inicializar privilegios existentes
        const mapa: Record<string, string> = {};
        privilegiosDisponibles.forEach((p) => {
          if (rolAEditar.permisos.includes(p.codigo)) {
            mapa[p.id] = 'L'; // Nivel base
          }
        });
        setNivelesPorPrivilegio(mapa);
      } else {
        setNombre('');
        setDescripcion('');
        setBaseRolId('');
        setActivo(true);
        
        // Privilegios sugeridos por defecto (ACC y OPE en Lectura)
        const mapa: Record<string, string> = {};
        privilegiosDisponibles.forEach((p) => {
          if (p.codigo === 'ACC' || p.codigo === 'OPE') {
            mapa[p.id] = 'L';
          }
        });
        setNivelesPorPrivilegio(mapa);
      }
    }
  }, [isOpen, rolAEditar, privilegiosDisponibles, nivelesDisponibles]);

  if (!isOpen) return null;

  const handleBaseRolChange = (rolId: string) => {
    setBaseRolId(rolId);
    if (!rolId) {
      setNivelesPorPrivilegio({});
      return;
    }
    const found = rolesExistentes.find((r) => r.id === rolId);
    if (found) {
      const mapa: Record<string, string> = {};
      privilegiosDisponibles.forEach((p) => {
        if (found.permisos.includes(p.codigo)) {
          mapa[p.id] = 'L';
        }
      });
      setNivelesPorPrivilegio(mapa);
    }
  };

  const handleSetNivel = (privId: string, nivelCodigo: string) => {
    setNivelesPorPrivilegio((prev) => {
      if (nivelCodigo === 'NINGUNO') {
        const copy = { ...prev };
        delete copy[privId];
        return copy;
      }
      return { ...prev, [privId]: nivelCodigo };
    });
  };

  const handleSetModuloNivel = (modulo: string, nivelCodigo: string) => {
    const privsModulo = privilegiosDisponibles.filter((p) => p.modulo === modulo);
    setNivelesPorPrivilegio((prev) => {
      const copy = { ...prev };
      privsModulo.forEach((p) => {
        if (nivelCodigo === 'NINGUNO') {
          delete copy[p.id];
        } else {
          copy[p.id] = nivelCodigo;
        }
      });
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const privsSeleccionados = Object.keys(nivelesPorPrivilegio);

    onSubmit(
      {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        baseRolId: baseRolId || undefined,
        activo,
        permisos: privsSeleccionados,
        nivelPorDefecto,
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

  // Filtrar privilegios por búsqueda
  const privilegiosFiltrados = privilegiosDisponibles.filter((p) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      p.codigo.toLowerCase().includes(q) ||
      p.nombre.toLowerCase().includes(q) ||
      p.modulo.toLowerCase().includes(q)
    );
  });

  const modulos = Array.from(new Set(privilegiosFiltrados.map((p) => p.modulo)));
  const totalAsignados = Object.keys(nivelesPorPrivilegio).length;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: '600px',
            maxWidth: '100%',
            height: '100%',
            backgroundColor: '#17171C',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.6)',
            fontFamily: 'Inter, sans-serif',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                {rolAEditar ? 'Configuración de Rol' : 'Crear Nuevo Rol'}
              </h3>
              <span style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.45)' }}>
                {rolAEditar ? `Editando privilegios de "${rolAEditar.nombre}"` : 'Define los accesos y privilegios del nuevo perfil'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Form Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Nombre del Rol */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>
                Nombre del rol <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Coordinador de Turno, Supervisor de Seguridad"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: '0 14px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Descripción */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>
                Descripción
              </label>
              <textarea
                placeholder="Indica las responsabilidades y alcance de este rol..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* Partir de rol existente & Rol Activo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '14px', alignItems: 'flex-end' }}>
              {!rolAEditar && rolesExistentes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Copiar de rol existente
                  </label>
                  <select
                    value={baseRolId}
                    onChange={(e) => handleBaseRolChange(e.target.value)}
                    style={{
                      height: '40px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: '#2A2A2A',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      padding: '0 12px',
                      outline: 'none',
                    }}
                  >
                    <option value="">-- Ninguno (en blanco) --</option>
                    {rolesExistentes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre} ({r.permisos.length} privilegios)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div
                onClick={() => setActivo(!activo)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  height: '40px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 500 }}>Activo</span>
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

            {/* Separador */}
            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Header de Privilegios y Buscador */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                    Privilegios y Accesos
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(173, 173, 251, 0.15)',
                      color: '#ADADFB',
                    }}
                  >
                    {totalAsignados} de {privilegiosDisponibles.length} asignados
                  </span>
                </div>
              </div>

              {/* Input de Búsqueda rápida */}
              <input
                type="text"
                placeholder="🔍 Buscar privilegio por nombre, código o módulo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  padding: '0 12px',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Lista Interactiva de Módulos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {modulos.map((modulo) => {
                const privsModulo = privilegiosFiltrados.filter((p) => p.modulo === modulo);
                return (
                  <div
                    key={modulo}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    {/* Cabecera del Módulo */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: 'rgba(255, 255, 255, 0.6)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Módulo {modulo}
                      </span>

                      {/* Botones de acción rápida de módulo */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleSetModuloNivel(modulo, 'L')}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            color: '#38BDF8',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          + Todos L
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetModuloNivel(modulo, 'T')}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.25)',
                            color: '#4ADE80',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          + Todos T
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetModuloNivel(modulo, 'NINGUNO')}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '10.5px',
                            cursor: 'pointer',
                          }}
                        >
                          Limpiar
                        </button>
                      </div>
                    </div>

                    {/* Filas de Privilegios */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {privsModulo.map((priv) => {
                        const nivelActual = nivelesPorPrivilegio[priv.id] || 'NINGUNO';
                        return (
                          <div
                            key={priv.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              backgroundColor: nivelActual !== 'NINGUNO' ? 'rgba(173, 173, 251, 0.05)' : 'transparent',
                              border: `1px solid ${nivelActual !== 'NINGUNO' ? 'rgba(173, 173, 251, 0.15)' : 'transparent'}`,
                              transition: 'all 0.12s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: '#ADADFB',
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  backgroundColor: 'rgba(173, 173, 251, 0.12)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                {priv.codigo}
                              </span>
                              <span style={{ fontSize: '13px', color: nivelActual !== 'NINGUNO' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)' }}>
                                {priv.nombre}
                              </span>
                            </div>

                            {/* Selector de Nivel de Permiso (Píldoras) */}
                            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '2px', borderRadius: '6px' }}>
                              {[
                                { cod: 'NINGUNO', label: '—', color: 'rgba(255, 255, 255, 0.3)' },
                                { cod: 'L', label: 'L', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.2)' },
                                { cod: 'E', label: 'E', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.2)' },
                                { cod: 'T', label: 'T', color: '#4ADE80', bg: 'rgba(34, 197, 94, 0.2)' },
                              ].map((lvl) => {
                                const isSelected = nivelActual === lvl.cod;
                                return (
                                  <button
                                    key={lvl.cod}
                                    type="button"
                                    onClick={() => handleSetNivel(priv.id, lvl.cod)}
                                    style={{
                                      width: '24px',
                                      height: '22px',
                                      borderRadius: '4px',
                                      border: isSelected && lvl.cod !== 'NINGUNO' ? `1px solid ${lvl.color}` : 'none',
                                      backgroundColor: isSelected ? (lvl.bg || 'rgba(255, 255, 255, 0.15)') : 'transparent',
                                      color: isSelected ? (lvl.cod === 'NINGUNO' ? '#FFFFFF' : lvl.color) : 'rgba(255, 255, 255, 0.3)',
                                      fontSize: '11px',
                                      fontWeight: isSelected ? 700 : 500,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.1s ease',
                                    }}
                                  >
                                    {lvl.label}
                                  </button>
                                );
                              })}
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

          {/* Footer Actions */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {rolAEditar && !rolAEditar.esSistema && onDelete ? (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                }}
              >
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
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!nombre.trim()}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ADADFB',
                  color: '#17171C',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: !nombre.trim() ? 'not-allowed' : 'pointer',
                  opacity: !nombre.trim() ? 0.45 : 1,
                  boxShadow: '0 2px 8px rgba(173, 173, 251, 0.2)',
                }}
              >
                {rolAEditar ? 'Guardar cambios' : 'Crear rol'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="¿Eliminar este rol?"
        message={`¿Estás seguro de que deseas eliminar el rol "${rolAEditar?.nombre}"? Los usuarios asignados a este rol perderán sus privilegios correspondientes.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};
