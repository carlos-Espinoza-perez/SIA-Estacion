import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { Rol, Privilegio, NivelPermiso, RolPrivilegioDetalle, AsignacionPrivilegioRequest } from '../../types/rol';
import { rolService } from '../../services/rolService';
import { CrearPrivilegioModal } from '../../components/molecules/CrearPrivilegioModal/CrearPrivilegioModal';
import { ConfirmModal } from '../../components/molecules/ConfirmModal/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/atoms/Button/Button';
import { Spinner } from '../../components/atoms/Spinner/Spinner';

export const RolesPage: React.FC = () => {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [privilegios, setPrivilegios] = useState<Privilegio[]>([]);
  const [niveles, setNiveles] = useState<NivelPermiso[]>([]);
  const [matrizAsignaciones, setMatrizAsignaciones] = useState<Record<string, RolPrivilegioDetalle[]>>({});
  const [loading, setLoading] = useState(true);

  // Estados de creación inline de rol en la tabla
  const [isCreatingInlineRol, setIsCreatingInlineRol] = useState(false);
  const [nombreNuevoRol, setNombreNuevoRol] = useState('');
  const [isSubmittingInline, setIsSubmittingInline] = useState(false);
  const inputRolRef = useRef<HTMLInputElement | null>(null);

  // Estado para crear privilegio modal
  const [isPrivilegioModalOpen, setIsPrivilegioModalOpen] = useState(false);

  // Estado para eliminar rol
  const [rolAEliminar, setRolAEliminar] = useState<Rol | null>(null);
  const [isDeletingRol, setIsDeletingRol] = useState(false);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesData, privsData, nivelesData] = await Promise.all([
        rolService.getRoles(),
        rolService.getPrivilegios(),
        rolService.getNivelesPermiso(),
      ]);

      setRoles(rolesData);
      setPrivilegios(privsData);
      setNiveles(nivelesData);

      // Cargar matriz de asignaciones de cada rol
      const asignacionesMap: Record<string, RolPrivilegioDetalle[]> = {};
      await Promise.all(
        rolesData.map(async (rol) => {
          const detalles = await rolService.getPrivilegiosRol(rol.id);
          asignacionesMap[rol.id] = detalles;
        })
      );
      setMatrizAsignaciones(asignacionesMap);
    } catch (error: any) {
      showToast(error.message || 'Error al cargar catálogo de roles y permisos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (isCreatingInlineRol && inputRolRef.current) {
      inputRolRef.current.focus();
    }
  }, [isCreatingInlineRol]);

  // Crear rol directamente en la tabla
  const handleCrearRolInline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNombre = nombreNuevoRol.trim();
    if (!cleanNombre) {
      setIsCreatingInlineRol(false);
      return;
    }

    if (roles.some((r) => r.nombre.toLowerCase() === cleanNombre.toLowerCase())) {
      showToast(`Ya existe un rol con el nombre "${cleanNombre}"`, 'error');
      return;
    }

    setIsSubmittingInline(true);
    try {
      const nuevo = await rolService.crearRol({
        nombre: cleanNombre,
        descripcion: `Rol creado directamente desde la matriz`,
        activo: true,
        permisos: [],
      });

      setRoles((prev) => [...prev, nuevo]);
      setMatrizAsignaciones((prev) => ({
        ...prev,
        [nuevo.id]: [],
      }));

      setNombreNuevoRol('');
      setIsCreatingInlineRol(false);
      showToast(`Rol "${cleanNombre}" creado. Haz clic en las celdas para otorgar accesos.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al crear el rol', 'error');
    } finally {
      setIsSubmittingInline(false);
    }
  };

  const handleConfirmDeleteRol = async () => {
    if (!rolAEliminar) return;
    setIsDeletingRol(true);
    try {
      await rolService.eliminarRol(rolAEliminar.id);
      showToast(`Rol "${rolAEliminar.nombre}" eliminado`, 'success');
      setRoles((prev) => prev.filter((r) => r.id !== rolAEliminar.id));
      setRolAEliminar(null);
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar rol', 'error');
    } finally {
      setIsDeletingRol(false);
    }
  };

  const handleSavePrivilegio = async (data: { codigo: string; nombre: string; modulo: string }) => {
    try {
      const nuevo = await rolService.crearPrivilegio(data);
      showToast(`Privilegio [${nuevo.codigo}] "${nuevo.nombre}" creado con éxito`, 'success');
      await cargarDatos();
    } catch (err: any) {
      showToast(err.message || 'Error al crear privilegio', 'error');
      throw err;
    }
  };

  // Alternar nivel de permiso en la matriz
  const handleCyclePermissionLevel = async (rol: Rol, privilegio: Privilegio) => {
    const asignacionesActuales = matrizAsignaciones[rol.id] || [];
    const asignacionExistente = asignacionesActuales.find(
      (a) =>
        (a.privilegioCodigo && a.privilegioCodigo === privilegio.codigo) ||
        (a.privilegioId && privilegio.id && a.privilegioId.toLowerCase() === privilegio.id.toLowerCase())
    );

    // Ciclo de niveles: Ninguno -> Lectura (L) -> Escritura (E) -> Total (T) -> Ninguno
    const cicloCodigos = ['NINGUNO', 'L', 'E', 'T'];
    const codigoActual = asignacionExistente?.nivelPermisoCodigo || 'NINGUNO';
    const indexActual = cicloCodigos.indexOf(codigoActual);
    const siguienteCodigo = cicloCodigos[(indexActual + 1) % cicloCodigos.length];

    let nuevasAsignacionesParaApi: AsignacionPrivilegioRequest[] = [];
    let nuevasAsignacionesUI: RolPrivilegioDetalle[] = [];

    const nivelEncontrado = niveles.find((n) => n.codigo === siguienteCodigo) || niveles[0];

    const otrasAsignaciones = asignacionesActuales.filter(
      (a) =>
        a.privilegioCodigo !== privilegio.codigo &&
        (!a.privilegioId || !privilegio.id || a.privilegioId.toLowerCase() !== privilegio.id.toLowerCase())
    );

    if (siguienteCodigo === 'NINGUNO') {
      nuevasAsignacionesUI = otrasAsignaciones;
      nuevasAsignacionesParaApi = otrasAsignaciones.map((a) => ({
        privilegioId: a.privilegioId,
        nivelPermisoId: a.nivelPermisoId,
      }));
    } else {
      const nuevaAsignacion: RolPrivilegioDetalle = {
        id: asignacionExistente?.id || `temp-${Date.now()}`,
        privilegioId: privilegio.id,
        privilegioCodigo: privilegio.codigo,
        privilegioNombre: privilegio.nombre,
        nivelPermisoId: nivelEncontrado.id,
        nivelPermisoCodigo: nivelEncontrado.codigo,
        nivelPermisoNombre: nivelEncontrado.nombre,
      };

      nuevasAsignacionesUI = [...otrasAsignaciones, nuevaAsignacion];
      nuevasAsignacionesParaApi = [
        ...otrasAsignaciones.map((a) => ({
          privilegioId: a.privilegioId,
          nivelPermisoId: a.nivelPermisoId,
        })),
        { privilegioId: privilegio.id, nivelPermisoId: nivelEncontrado.id },
      ];
    }

    // Actualización inmediata en UI (optimistic update)
    setMatrizAsignaciones((prev) => ({
      ...prev,
      [rol.id]: nuevasAsignacionesUI,
    }));

    try {
      await rolService.reemplazarMatrizPrivilegios(rol.id, nuevasAsignacionesParaApi);
      const asignacionesConfirmadas = await rolService.getPrivilegiosRol(rol.id);
      if (asignacionesConfirmadas && asignacionesConfirmadas.length >= 0) {
        setMatrizAsignaciones((prev) => ({
          ...prev,
          [rol.id]: asignacionesConfirmadas,
        }));
      }
    } catch (err: any) {
      // Revertir en caso de error
      setMatrizAsignaciones((prev) => ({
        ...prev,
        [rol.id]: asignacionesActuales,
      }));
      showToast(err.message || 'Error al actualizar permiso', 'error');
    }
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
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#FFFFFF',
                margin: 0,
              }}
            >
              Roles y Privilegios
            </h2>
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.45)' }}>
              Crea roles directamente en la tabla y asigna permisos haciendo clic en cada celda
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPrivilegioModalOpen(true)}
              leftIcon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Nuevo privilegio
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreatingInlineRol(true)}
              leftIcon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Agregar rol en tabla
            </Button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <Spinner size={36} color="var(--primary)" />
          </div>
        ) : (
          <>
            {/* Roles Definidos (Grid de Tarjetas Resumen) */}
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
                Roles Activos en el Sistema ({roles.length})
              </span>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`,
                  gap: '16px',
                }}
              >
                {roles.map((rol) => {
                  const asignaciones = matrizAsignaciones[rol.id] || [];
                  const esAdminGlobal = rol.esSistema && rol.nombre.includes('Administrador');

                  return (
                    <div
                      key={rol.id}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '14px',
                        padding: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        position: 'relative',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                            {rol.nombre}
                          </h3>
                          {rol.esSistema ? (
                            <span
                              style={{
                                fontSize: '10px',
                                color: '#93C5FD',
                                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                border: '1px solid rgba(59, 130, 246, 0.25)',
                                borderRadius: '8px',
                                padding: '1px 6px',
                                fontWeight: 500,
                              }}
                            >
                              Sistema
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setRolAEliminar(rol)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#EF4444',
                                fontSize: '12px',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                opacity: 0.7,
                              }}
                              title="Eliminar este rol"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            margin: '6px 0 0',
                            lineHeight: '1.3',
                          }}
                        >
                          {rol.descripcion || 'Sin descripción'}
                        </p>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '8px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                          fontSize: '11.5px',
                          color: 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        <span>{rol.personasAsignadas} usuarios</span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 500,
                          }}
                        >
                          {esAdminGlobal ? 'Acceso Total' : `${asignaciones.length} privilegios`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Banner Informativo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(173, 173, 251, 0.05)',
                border: '1px solid rgba(173, 173, 251, 0.15)',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.75)',
                lineHeight: '1.4',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(173, 173, 251, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '12px',
                  color: '#ADADFB',
                  fontWeight: 'bold',
                }}
              >
                💡
              </div>
              <span>
                Haz clic directamente en cualquier celda para alternar el nivel:{' '}
                <strong style={{ color: '#94A3B8' }}>— (Sin acceso)</strong> →{' '}
                <strong style={{ color: '#38BDF8' }}>L (Lectura)</strong> →{' '}
                <strong style={{ color: '#FBBF24' }}>E (Escritura)</strong> →{' '}
                <strong style={{ color: '#4ADE80' }}>T (Total)</strong>.
              </span>
            </div>

            {/* Matriz de Privilegios */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '18px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                    Matriz de Privilegios
                  </h3>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    {privilegios.length} privilegios · {roles.length} roles
                  </span>
                </div>
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
                          padding: '14px',
                          textAlign: 'left',
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontSize: '12px',
                          width: '30%',
                          minWidth: '220px',
                        }}
                      >
                        Módulo / Privilegio
                      </th>

                      {/* Columnas de Roles */}
                      {roles.map((rol) => (
                        <th
                          key={rol.id}
                          style={{
                            padding: '14px',
                            textAlign: 'center',
                            fontWeight: 600,
                            color: '#FFFFFF',
                            fontSize: '13px',
                            minWidth: '130px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span>{rol.nombre}</span>
                            {!rol.esSistema && (
                              <button
                                type="button"
                                onClick={() => setRolAEliminar(rol)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'rgba(239, 68, 68, 0.6)',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  padding: '1px 3px',
                                }}
                                title="Eliminar este rol"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </th>
                      ))}

                      {/* Columna Inline para Nuevo Rol */}
                      <th
                        style={{
                          padding: '10px 14px',
                          textAlign: 'center',
                          minWidth: '180px',
                        }}
                      >
                        {isCreatingInlineRol ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              ref={inputRolRef}
                              type="text"
                              placeholder="Nombre del nuevo rol..."
                              value={nombreNuevoRol}
                              onChange={(e) => setNombreNuevoRol(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCrearRolInline();
                                if (e.key === 'Escape') {
                                  setIsCreatingInlineRol(false);
                                  setNombreNuevoRol('');
                                }
                              }}
                              style={{
                                height: '32px',
                                borderRadius: '6px',
                                border: '1px solid #ADADFB',
                                backgroundColor: '#1E1E1E',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                padding: '0 8px',
                                outline: 'none',
                                width: '130px',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleCrearRolInline()}
                              disabled={isSubmittingInline || !nombreNuevoRol.trim()}
                              style={{
                                height: '32px',
                                width: '28px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#ADADFB',
                                color: '#17171C',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Guardar rol (Enter)"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreatingInlineRol(false);
                                setNombreNuevoRol('');
                              }}
                              style={{
                                height: '32px',
                                width: '24px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                backgroundColor: 'transparent',
                                color: 'rgba(255, 255, 255, 0.5)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Cancelar (Esc)"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsCreatingInlineRol(true)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px dashed rgba(173, 173, 251, 0.35)',
                              backgroundColor: 'rgba(173, 173, 251, 0.05)',
                              color: '#ADADFB',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(173, 173, 251, 0.12)')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(173, 173, 251, 0.05)')}
                          >
                            <span>+</span>
                            <span>Agregar rol</span>
                          </button>
                        )}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {privilegios.map((priv, idx) => {
                      return (
                        <tr
                          key={priv.id}
                          style={{
                            borderBottom:
                              idx === privilegios.length - 1
                                ? 'none'
                                : '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'background-color 0.1s ease',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    color: '#ADADFB',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    fontSize: '11.5px',
                                    backgroundColor: 'rgba(173, 173, 251, 0.12)',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {priv.codigo}
                                </span>
                                <span style={{ color: '#FFFFFF', fontWeight: 500, fontSize: '13px' }}>
                                  {priv.nombre}
                                </span>
                              </div>
                              <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px' }}>
                                Módulo: {priv.modulo}
                              </span>
                            </div>
                          </td>

                          {roles.map((rol) => {
                            const esAdminGlobal = rol.esSistema && rol.nombre.includes('Administrador');
                            const asignaciones = matrizAsignaciones[rol.id] || [];
                            const asignacion = asignaciones.find(
                              (a) =>
                                (a.privilegioCodigo && a.privilegioCodigo === priv.codigo) ||
                                (a.privilegioId && priv.id && a.privilegioId.toLowerCase() === priv.id.toLowerCase())
                            );
                            const nivelCodigo = esAdminGlobal ? 'T' : (asignacion?.nivelPermisoCodigo || '—');

                            // Estilo de color según nivel
                            let badgeStyle: React.CSSProperties = {
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '28px',
                              height: '26px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              transition: 'transform 0.1s ease, filter 0.15s ease',
                            };

                            if (nivelCodigo === 'T') {
                              badgeStyle = {
                                ...badgeStyle,
                                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                color: '#4ADE80',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                              };
                            } else if (nivelCodigo === 'E') {
                              badgeStyle = {
                                ...badgeStyle,
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: '#FBBF24',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                              };
                            } else if (nivelCodigo === 'L') {
                              badgeStyle = {
                                ...badgeStyle,
                                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                color: '#38BDF8',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                              };
                            } else if (nivelCodigo === 'C' || nivelCodigo === 'A' || nivelCodigo === 'B') {
                              badgeStyle = {
                                ...badgeStyle,
                                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                                color: '#C084FC',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                              };
                            } else {
                              badgeStyle = {
                                ...badgeStyle,
                                color: 'rgba(255, 255, 255, 0.2)',
                              };
                            }

                            return (
                              <td
                                key={rol.id}
                                style={{
                                  padding: '12px 14px',
                                  textAlign: 'center',
                                  cursor: esAdminGlobal ? 'default' : 'pointer',
                                  userSelect: 'none',
                                }}
                                onClick={() => {
                                  if (!esAdminGlobal) {
                                    handleCyclePermissionLevel(rol, priv);
                                  }
                                }}
                                title={
                                  esAdminGlobal
                                    ? 'Administrador General tiene acceso Total permanente'
                                    : `Clic para alternar nivel de ${priv.codigo} en ${rol.nombre}`
                                }
                              >
                                <span
                                  style={badgeStyle}
                                  onMouseOver={(e) => {
                                    if (!esAdminGlobal) e.currentTarget.style.transform = 'scale(1.15)';
                                  }}
                                  onMouseOut={(e) => {
                                    if (!esAdminGlobal) e.currentTarget.style.transform = 'scale(1)';
                                  }}
                                >
                                  {nivelCodigo}
                                </span>
                              </td>
                            );
                          })}

                          {/* Celda vacía para la columna de nuevo rol */}
                          <td style={{ padding: '12px 14px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.15)' }}>
                            ·
                          </td>
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
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{privilegios.length} privilegios configurables</span>
                <span>Niveles: [L] Lectura · [E] Escritura · [T] Total · [—] Sin acceso</span>
              </div>
            </div>

            {/* Modal Crear Privilegio */}
            <CrearPrivilegioModal
              isOpen={isPrivilegioModalOpen}
              onClose={() => setIsPrivilegioModalOpen(false)}
              onSubmit={handleSavePrivilegio}
              privilegiosExistentes={privilegios}
            />

            {/* Modal Eliminar Rol */}
            <ConfirmModal
              isOpen={Boolean(rolAEliminar)}
              title="¿Eliminar este rol?"
              message={`¿Estás seguro de que deseas eliminar el rol "${rolAEliminar?.nombre}"? Los usuarios asociados perderán sus privilegios correspondientes.`}
              confirmText="Sí, eliminar"
              cancelText="Cancelar"
              isDestructive={true}
              isLoading={isDeletingRol}
              onConfirm={handleConfirmDeleteRol}
              onClose={() => setRolAEliminar(null)}
            />
          </>
        )}
      </div>
    </DashboardLayoutTemplate>
  );
};
