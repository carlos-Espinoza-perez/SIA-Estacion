import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { Rol, Privilegio, NivelPermiso, AsignacionPrivilegioRequest } from '../../types/rol';
import { rolService } from '../../services/rolService';
import { useToast } from '../../context/ToastContext';

export const CrearRolPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [baseRolId, setBaseRolId] = useState('');
  const [activo, setActivo] = useState(true);
  const [privilegiosSeleccionados, setPrivilegiosSeleccionados] = useState<string[]>([]);
  const [rolesExistentes, setRolesExistentes] = useState<Rol[]>([]);
  const [privilegios, setPrivilegios] = useState<Privilegio[]>([]);
  const [niveles, setNiveles] = useState<NivelPermiso[]>([]);
  const [nivelPorDefecto, setNivelPorDefecto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      rolService.getRoles(),
      rolService.getPrivilegios(),
      rolService.getNivelesPermiso(),
    ]).then(([rolesData, privsData, nivelesData]) => {
      setRolesExistentes(rolesData);
      setPrivilegios(privsData);
      setNiveles(nivelesData);
      const defaultNivel = nivelesData.find((n) => n.codigo === 'L')?.id || nivelesData[0]?.id || '';
      setNivelPorDefecto(defaultNivel);

      // Privilegios por defecto
      const defaults = privsData.filter((p) => p.codigo === 'ACC' || p.codigo === 'OPE').map((p) => p.id);
      setPrivilegiosSeleccionados(defaults);
    });
  }, []);

  const handleBaseRolChange = (rolId: string) => {
    setBaseRolId(rolId);
    if (!rolId) {
      setPrivilegiosSeleccionados([]);
      return;
    }
    const found = rolesExistentes.find((r) => r.id === rolId);
    if (found) {
      const matchingIds = privilegios
        .filter((p) => found.permisos.includes(p.codigo))
        .map((p) => p.id);
      setPrivilegiosSeleccionados(matchingIds);
    }
  };

  const togglePrivilegio = (privId: string) => {
    setPrivilegiosSeleccionados((prev) =>
      prev.includes(privId) ? prev.filter((p) => p !== privId) : [...prev, privId]
    );
  };

  const handleSelectAll = () => {
    if (privilegiosSeleccionados.length === privilegios.length) {
      setPrivilegiosSeleccionados([]);
    } else {
      setPrivilegiosSeleccionados(privilegios.map((p) => p.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setIsSubmitting(true);
    try {
      const nuevoRol = await rolService.crearRol({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        baseRolId: baseRolId || undefined,
        activo,
        permisos: privilegiosSeleccionados,
        nivelPorDefecto,
      });

      if (privilegiosSeleccionados.length > 0) {
        const nivelId = nivelPorDefecto || niveles.find((n) => n.codigo === 'L')?.id || niveles[0]?.id;
        const asignaciones: AsignacionPrivilegioRequest[] = privilegiosSeleccionados.map((privId) => ({
          privilegioId: privId,
          nivelPermisoId: nivelId,
        }));
        await rolService.reemplazarMatrizPrivilegios(nuevoRol.id, asignaciones);
      }

      showToast(`Rol "${nuevoRol.nombre}" creado con éxito`, 'success');
      navigate('/roles');
    } catch (err: any) {
      showToast(err.message || 'Error al crear el rol', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agrupar privilegios por módulo
  const modulos = Array.from(new Set(privilegios.map((p) => p.modulo)));

  return (
    <DashboardLayoutTemplate breadcrumbTitle="Roles y permisos / Nuevo rol">
      <div
        style={{
          padding: '24px 32px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '1200px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Título de la vista */}
        <div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            Nuevo rol
          </h2>
          <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.45)' }}>
            Configura el perfil de privilegios y accesos en el sistema
          </span>
        </div>

        {/* Contenedor Principal: 2 Columnas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '376px 1fr',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* Columna Izquierda: Datos del rol */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
              Datos del rol
            </span>

            {/* Nombre del rol */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
                Nombre del rol <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Supervisor de Laboratorio"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                style={{
                  height: '44px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '0 14px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
              />
            </div>

            {/* Descripción */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
                Descripción
              </label>
              <textarea
                placeholder="Qué puede hacer este rol dentro del sistema."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                style={{
                  minHeight: '88px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: '1.4',
                }}
              />
            </div>

            {/* Partir de un rol existente */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
                Partir de un rol existente
              </label>
              <select
                value={baseRolId}
                onChange={(e) => handleBaseRolChange(e.target.value)}
                style={{
                  height: '44px',
                  backgroundColor: '#2A2A2A',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '0 12px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
              >
                <option value="">Ninguno (empezar en blanco)</option>
                {rolesExistentes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} ({r.permisos.length} privilegios)
                  </option>
                ))}
              </select>
            </div>

            {/* Nivel de acceso inicial */}
            {niveles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
                  Nivel de acceso inicial
                </label>
                <select
                  value={nivelPorDefecto}
                  onChange={(e) => setNivelPorDefecto(e.target.value)}
                  style={{
                    height: '44px',
                    backgroundColor: '#2A2A2A',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '0 12px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                >
                  {niveles.map((n) => (
                    <option key={n.id} value={n.id}>
                      [{n.codigo}] {n.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Switch de Rol Activo */}
            <div
              onClick={() => setActivo(!activo)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>Rol activo</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)' }}>
                  Los usuarios asignados podrán iniciar sesión
                </div>
              </div>

              <div
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '11px',
                  backgroundColor: activo ? '#22C55E' : 'rgba(255, 255, 255, 0.16)',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    position: 'absolute',
                    top: '2px',
                    left: activo ? '20px' : '2px',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Privilegios disponibles */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxSizing: 'border-box',
            }}
          >
            {/* Header de la tarjeta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                Privilegios asignados ({privilegiosSeleccionados.length}/{privilegios.length})
              </span>

              <button
                type="button"
                onClick={handleSelectAll}
                style={{
                  height: '28px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#ADADFB',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {privilegiosSeleccionados.length === privilegios.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>

            {/* Lista de Módulos y Privilegios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '540px', paddingRight: '4px' }}>
              {modulos.map((modulo) => {
                const privsModulo = privilegios.filter((p) => p.modulo === modulo);
                return (
                  <div
                    key={modulo}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '14px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: 'rgba(255, 255, 255, 0.45)',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '8px',
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
                              display: 'grid',
                              gridTemplateColumns: '24px 80px 1fr',
                              alignItems: 'center',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              gap: '12px',
                              backgroundColor: isSelected ? 'rgba(173, 173, 251, 0.08)' : 'transparent',
                              border: `1px solid ${isSelected ? 'rgba(173, 173, 251, 0.2)' : 'transparent'}`,
                              transition: 'all 0.1s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePrivilegio(perm.id)}
                              style={{
                                accentColor: '#ADADFB',
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                              }}
                            />

                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#ADADFB',
                                fontFamily: 'monospace',
                                backgroundColor: 'rgba(173, 173, 251, 0.1)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                textAlign: 'center',
                              }}
                            >
                              {perm.codigo}
                            </span>

                            <span
                              style={{
                                fontSize: '13px',
                                color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                              }}
                            >
                              {perm.nombre}
                            </span>
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

        {/* Separador inferior */}
        <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', marginTop: '8px' }} />

        {/* Botones de Acción */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/roles')}
            style={{
              width: '120px',
              height: '44px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backgroundColor: 'rgba(255, 255, 255, 0.10)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !nombre.trim()}
            style={{
              width: '160px',
              height: '44px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#ADADFB',
              color: '#17171C',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              cursor: !nombre.trim() ? 'not-allowed' : 'pointer',
              opacity: !nombre.trim() ? 0.45 : 1,
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Crear rol'}
          </button>
        </div>
      </div>
    </DashboardLayoutTemplate>
  );
};
