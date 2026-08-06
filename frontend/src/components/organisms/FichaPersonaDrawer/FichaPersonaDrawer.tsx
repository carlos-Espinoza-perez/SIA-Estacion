import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '../../atoms/Avatar/Avatar';
import { FichaPersonaDetalle, Persona } from '../../../types/persona';
import { personaService } from '../../../services/personaService';
import { ResultadoBadge } from '../../atoms/ResultadoBadge/ResultadoBadge';
import { ConfirmModal } from '../../molecules/ConfirmModal/ConfirmModal';
import { useToast } from '../../../context/ToastContext';

export interface FichaPersonaDrawerProps {
  personaId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPersonaUpdated?: () => void;
  onPersonaDeleted?: () => void;
}

export const FichaPersonaDrawer: React.FC<FichaPersonaDrawerProps> = ({
  personaId,
  isOpen,
  onClose,
  onPersonaUpdated,
  onPersonaDeleted,
}) => {
  const { showToast } = useToast();
  const [detalle, setDetalle] = useState<FichaPersonaDetalle | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Persona>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !personaId) {
      setDetalle(null);
      setIsEditing(false);
      return;
    }

    setLoading(true);
    personaService.getPersonaDetalle(personaId).then((res) => {
      setDetalle(res);
      if (res) {
        setEditForm({
          nombre: res.nombre,
          carnet: res.carnet,
          rol: res.rol,
          carreraOArea: res.carreraOArea,
          correo: res.correo,
        });
      }
      setLoading(false);
    });
  }, [isOpen, personaId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleteModalOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isDeleteModalOpen, onClose]);

  const handleSaveEdit = async () => {
    if (!personaId || !editForm.nombre?.trim()) return;
    setIsSaving(true);
    try {
      await personaService.actualizarPersona(personaId, editForm);
      showToast('Datos de la persona actualizados con éxito', 'success');
      setIsEditing(false);
      const updated = await personaService.getPersonaDetalle(personaId);
      setDetalle(updated);
      onPersonaUpdated?.();
    } catch {
      showToast('Error al actualizar datos de la persona', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEstado = async () => {
    if (!personaId) return;
    try {
      const updated = await personaService.toggleEstadoPersona(personaId);
      showToast(`Estado cambiado a ${updated.estado}`, 'info');
      const det = await personaService.getPersonaDetalle(personaId);
      setDetalle(det);
      onPersonaUpdated?.();
    } catch {
      showToast('Error al cambiar estado de la persona', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!personaId) return;
    setIsDeleting(true);
    try {
      await personaService.eliminarPersona(personaId);
      showToast('Persona eliminada del sistema', 'success');
      setIsDeleteModalOpen(false);
      onClose();
      onPersonaDeleted?.();
    } catch {
      showToast('Error al eliminar persona', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Scrim / Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          animation: 'drawerFadeIn 0.2s ease',
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '580px',
          maxWidth: '90vw',
          height: '100%',
          backgroundColor: '#262626',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          animation: 'drawerSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          color: '#FFFFFF',
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
            position: 'sticky',
            top: 0,
            backgroundColor: '#262626',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
              Personas
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>/</span>
            <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>
              Ficha de persona
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!loading && detalle && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    backgroundColor: isEditing ? '#ADADFB' : 'rgba(255, 255, 255, 0.08)',
                    color: isEditing ? '#121212' : '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  {isEditing ? 'Cancelar edición' : 'Editar'}
                </button>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  title="Eliminar persona"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading || !detalle ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
            Cargando ficha...
          </div>
        ) : (
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Header del Perfil */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <Avatar name={detalle.nombre} src={detalle.avatarUrl} size={64} />
              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', display: 'block', marginBottom: '4px' }}>
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={editForm.nombre || ''}
                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                        style={{
                          width: '100%',
                          height: '32px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          padding: '0 10px',
                          color: '#FFFFFF',
                          fontSize: '13px',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', display: 'block', marginBottom: '4px' }}>
                          Carnet
                        </label>
                        <input
                          type="text"
                          value={editForm.carnet || ''}
                          onChange={(e) => setEditForm({ ...editForm, carnet: e.target.value })}
                          style={{
                            width: '100%',
                            height: '32px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '6px',
                            padding: '0 10px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', display: 'block', marginBottom: '4px' }}>
                          Rol
                        </label>
                        <select
                          value={editForm.rol || 'Estudiante'}
                          onChange={(e) => setEditForm({ ...editForm, rol: e.target.value as any })}
                          style={{
                            width: '100%',
                            height: '32px',
                            backgroundColor: '#333333',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '6px',
                            padding: '0 8px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                          }}
                        >
                          <option value="Estudiante">Estudiante</option>
                          <option value="Encargado de recurso">Encargado de recurso</option>
                          <option value="Administrador">Administrador</option>
                          <option value="Guardia">Guardia</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', display: 'block', marginBottom: '4px' }}>
                        Carrera / Área
                      </label>
                      <input
                        type="text"
                        value={editForm.carreraOArea || ''}
                        onChange={(e) => setEditForm({ ...editForm, carreraOArea: e.target.value })}
                        style={{
                          width: '100%',
                          height: '32px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          padding: '0 10px',
                          color: '#FFFFFF',
                          fontSize: '13px',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', display: 'block', marginBottom: '4px' }}>
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={editForm.correo || ''}
                        onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
                        style={{
                          width: '100%',
                          height: '32px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          padding: '0 10px',
                          color: '#FFFFFF',
                          fontSize: '13px',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        style={{
                          backgroundColor: '#ADADFB',
                          color: '#121212',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: isSaving ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isSaving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'rgba(255, 255, 255, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', color: '#FFFFFF' }}>
                      {detalle.nombre}
                    </h3>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>
                      {detalle.carreraOArea} · Carnet: {detalle.carnet}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: 500,
                        }}
                      >
                        {detalle.rol}
                      </span>
                      <button
                        onClick={handleToggleEstado}
                        title="Click para cambiar estado"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 500,
                          backgroundColor:
                            detalle.estado === 'Activo'
                              ? 'rgba(34, 197, 94, 0.12)'
                              : 'rgba(239, 68, 68, 0.12)',
                          color: detalle.estado === 'Activo' ? '#4ADE80' : '#F87171',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            backgroundColor: detalle.estado === 'Activo' ? '#4ADE80' : '#F87171',
                          }}
                        />
                        {detalle.estado} (Cambiar)
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Fotografía de Referencia */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#FFFFFF' }}>
                Fotografía de referencia (Validación facial)
              </div>
              {detalle.fotoReferencia ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>Estado</span>
                    <span style={{ color: '#4ADE80', fontWeight: 500 }}>{detalle.fotoReferencia.estado}</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>Fecha captura</span>
                    <span style={{ color: '#FFFFFF' }}>{detalle.fotoReferencia.fechaCaptura}</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>Actualización</span>
                    <span style={{ color: '#FFFFFF' }}>{detalle.fotoReferencia.fechaActualizacion}</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>Política</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{detalle.fotoReferencia.retencion}</span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  Sin fotografía registrada.
                </div>
              )}
            </div>

            {/* Historial de Accesos Recientes */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#FFFFFF' }}>
                Historial de accesos
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.4)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>Fecha</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>Estación</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>Dir.</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.historialAccesos.slice(0, 5).map((acc) => (
                      <tr key={acc.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <td style={{ padding: '10px 12px', color: 'rgba(255, 255, 255, 0.8)' }}>{acc.fechaHora}</td>
                        <td style={{ padding: '10px 12px', color: '#FFFFFF' }}>{acc.estacion}</td>
                        <td style={{ padding: '10px 12px', color: 'rgba(255, 255, 255, 0.6)' }}>{acc.direccion}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <ResultadoBadge value={acc.resultado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Operaciones de Ítems */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#FFFFFF' }}>
                Préstamos y operaciones
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.4)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>Folio</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>Fecha</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>Ítem</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.operacionesItems.map((op) => (
                      <tr key={op.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <td style={{ padding: '10px 12px', color: '#ADADFB', fontWeight: 500 }}>{op.folio}</td>
                        <td style={{ padding: '10px 12px', color: 'rgba(255, 255, 255, 0.6)' }}>{op.fecha}</td>
                        <td style={{ padding: '10px 12px', color: '#FFFFFF' }}>{op.item}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 500,
                              backgroundColor:
                                op.estado === 'Devuelta'
                                  ? 'rgba(34, 197, 94, 0.12)'
                                  : op.estado === 'Pendiente'
                                  ? 'rgba(234, 179, 8, 0.12)'
                                  : 'rgba(59, 130, 246, 0.12)',
                              color:
                                op.estado === 'Devuelta'
                                  ? '#4ADE80'
                                  : op.estado === 'Pendiente'
                                  ? '#FACC15'
                                  : '#60A5FA',
                            }}
                          >
                            {op.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar persona"
        message={`¿Estás seguro de que deseas eliminar permanentemente a "${detalle?.nombre}"? Esta acción borrará sus credenciales y fotografías de referencia.`}
        confirmText="Eliminar persona"
        isDestructive={true}
        isLoading={isDeleting}
      />

      <style>{`
        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};
