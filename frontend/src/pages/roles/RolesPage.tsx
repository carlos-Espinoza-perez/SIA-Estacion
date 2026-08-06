import React, { useState, useEffect } from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { Rol, PermisoDef, CrearRolFormData } from '../../types/rol';
import { rolService, PERMISOS_SISTEMA } from '../../services/rolService';
import { CrearRolDrawer } from '../../components/organisms/CrearRolDrawer/CrearRolDrawer';
import { useToast } from '../../context/ToastContext';

export const RolesPage: React.FC = () => {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos] = useState<PermisoDef[]>(PERMISOS_SISTEMA);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rolAEditar, setRolAEditar] = useState<Rol | null>(null);

  const cargarRoles = () => {
    rolService.getRoles().then(setRoles);
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  const handleOpenNuevoRol = () => {
    setRolAEditar(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditarRol = (rol: Rol) => {
    setRolAEditar(rol);
    setIsDrawerOpen(true);
  };

  const handleSaveRol = async (formData: CrearRolFormData, rolId?: string) => {
    if (rolId) {
      await rolService.actualizarRol(rolId, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        permisos: formData.permisos,
        activo: formData.activo,
      });
      showToast(`Rol "${formData.nombre}" actualizado con éxito`, 'success');
    } else {
      await rolService.crearRol(formData);
      showToast(`Rol "${formData.nombre}" creado con éxito`, 'success');
    }
    cargarRoles();
  };

  const handleDeleteRol = async (rolId: string) => {
    try {
      await rolService.eliminarRol(rolId);
      showToast(`Rol eliminado con éxito`, 'success');
      cargarRoles();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar rol', 'error');
    }
  };

  const handleToggleMatrixPermission = async (rol: Rol, codigoPermiso: string) => {
    const hasClaim = rol.permisos.includes(codigoPermiso);
    const nuevosPermisos = hasClaim
      ? rol.permisos.filter((p) => p !== codigoPermiso)
      : [...rol.permisos, codigoPermiso];

    await rolService.actualizarPermisosRol(rol.id, nuevosPermisos);
    showToast(
      `Permiso "${codigoPermiso}" ${hasClaim ? 'removido de' : 'asignado a'} "${rol.nombre}"`,
      'info'
    );
    cargarRoles();
  };

  return (
    <DashboardLayoutTemplate breadcrumbTitle="Roles y permisos">
      <div
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxSizing: 'border-box',
          width: '100%',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              margin: 0,
            }}
          >
            Roles y permisos
          </h2>

          <button
            onClick={handleOpenNuevoRol}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              height: '36px',
              backgroundColor: '#FFFFFF',
              color: '#1C1C1C',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo rol
          </button>
        </div>

        {/* Roles Definidos (Grid de Tarjetas) */}
        <div>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            Roles definidos
          </span>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {roles.map((rol) => (
              <div
                key={rol.id}
                onClick={() => handleOpenEditarRol(rol)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#ADADFB';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'none';
                }}
                title="Haz clic para editar este rol"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                      {rol.nombre}
                    </h3>
                    {rol.esSistema && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: 'rgba(255, 255, 255, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          padding: '1px 6px',
                        }}
                      >
                        Sistema
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.55)',
                      margin: '6px 0 0',
                      lineHeight: '1.4',
                      minHeight: '34px',
                    }}
                  >
                    {rol.descripcion}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <span>{rol.personasAsignadas} personas</span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                  >
                    {rol.permisos.length} permisos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banner Informativo sobre Claims */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.4',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '12px',
              color: '#FFFFFF',
            }}
          >
            i
          </div>
          <span>
            Los permisos se resuelven como <strong style={{ color: '#FFFFFF' }}>Claims sobre ASP.NET Core Identity</strong>. Haz clic en las celdas de la matriz para alternar permisos o en las tarjetas de rol para editarlos.
          </span>
        </div>

        {/* Sección 2: Matriz de Permisos (Claims) */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
              Matriz de permisos (Claims)
            </h3>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
              Haz clic en cualquier casilla para conceder o revocar el claim
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th
                    style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.45)',
                      fontSize: '12px',
                      width: '30%',
                    }}
                  >
                    Permiso
                  </th>
                  {roles.map((rol) => (
                    <th
                      key={rol.id}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        fontSize: '13px',
                      }}
                    >
                      {rol.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permisos.map((perm, idx) => {
                  return (
                    <tr
                      key={perm.codigo}
                      style={{
                        borderBottom:
                          idx === permisos.length - 1
                            ? 'none'
                            : '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ color: '#FFFFFF', fontWeight: 500, fontFamily: 'monospace', fontSize: '13px' }}>
                            {perm.codigo}
                          </span>
                          <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '11px' }}>
                            {perm.descripcion}
                          </span>
                        </div>
                      </td>

                      {roles.map((rol) => {
                        const hasClaim = rol.permisos.includes(perm.codigo);
                        return (
                          <td
                            key={rol.id}
                            style={{
                              padding: '14px 14px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              userSelect: 'none',
                            }}
                            onClick={() => handleToggleMatrixPermission(rol, perm.codigo)}
                            title={`Alternar ${perm.codigo} para ${rol.nombre}`}
                          >
                            {hasClaim ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                  color: '#4ADE80',
                                  fontWeight: 'bold',
                                  fontSize: '13px',
                                  transition: 'transform 0.1s ease',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                              >
                                ✓
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: 'rgba(255, 255, 255, 0.2)',
                                  fontSize: '14px',
                                  display: 'inline-flex',
                                  width: '24px',
                                  height: '24px',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '50%',
                                  transition: 'background-color 0.1s ease',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer de la Matriz */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            {permisos.length} permisos · {roles.length} roles · última modificación 26/07/2026
          </div>
        </div>

        {/* Drawer Crear / Editar Rol (Menú lateral) */}
        <CrearRolDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSubmit={handleSaveRol}
          onDelete={handleDeleteRol}
          rolesExistentes={roles}
          rolAEditar={rolAEditar}
        />
      </div>
    </DashboardLayoutTemplate>
  );
};
