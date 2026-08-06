import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { Rol, CategoriaPermiso } from '../../types/rol';
import { rolService, PERMISOS_SISTEMA } from '../../services/rolService';

const CATEGORIAS_ORDEN: CategoriaPermiso[] = [
  'ACCESOS',
  'ÍTEMS',
  'CATÁLOGOS',
  'ADMINISTRACIÓN',
  'AUDITORÍA',
];

export const CrearRolPage: React.FC = () => {
  const navigate = useNavigate();

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
  const [rolesExistentes, setRolesExistentes] = useState<Rol[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    rolService.getRoles().then(setRolesExistentes);
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !descripcion.trim()) return;

    setIsSubmitting(true);
    await rolService.crearRol({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      baseRolId: baseRolId || undefined,
      activo,
      permisos: permisosSeleccionados,
    });
    setIsSubmitting(false);
    navigate('/roles');
  };

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
                Nombre del rol
              </label>
              <input
                type="text"
                placeholder="Ej. Encargado de biblioteca"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
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
                  padding: '0 14px',
                  color: '#FFFFFF',
                  fontSize: '14px',
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
              <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 500 }}>
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
            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

            {/* Conteo de permisos */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                Permisos seleccionados
              </span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                {permisosSeleccionados.length} de {PERMISOS_SISTEMA.length}
              </span>
            </div>

            {/* Párrafo explicativo ASP.NET Core Identity */}
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.45)',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              Los permisos se guardan como Claims sobre ASP.NET Core Identity. Un rol nuevo no requiere cambios en el código ni un nuevo despliegue.
            </p>

            {/* Separador */}
            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

            {/* Advertencia de rol.gestionar */}
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.45)',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              Ningún rol puede autoasignarse <code>rol.gestionar</code>. Solo un Administrador existente puede concederlo.
            </p>
          </div>

          {/* Columna Derecha: Permisos disponibles */}
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
                Permisos disponibles
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
                  color: '#FFFFFF',
                  fontSize: '12px',
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

            {/* Lista de Categorías y Permisos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {CATEGORIAS_ORDEN.map((cat) => {
                const permisosCat = PERMISOS_SISTEMA.filter((p) => p.categoria === cat);
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {permisosCat.map((perm) => {
                        const isSelected = permisosSeleccionados.includes(perm.codigo);
                        return (
                          <div
                            key={perm.codigo}
                            onClick={() => togglePermiso(perm.codigo)}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '24px 210px 1fr',
                              alignItems: 'center',
                              padding: '8px 6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              gap: '12px',
                              transition: 'background-color 0.1s ease',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                              }}
                            >
                              {isSelected && '✓'}
                            </div>

                            {/* Código del Permiso */}
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: isSelected ? 600 : 500,
                                color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
                                fontFamily: 'monospace',
                              }}
                            >
                              {perm.codigo}
                            </span>

                            {/* Descripción del Permiso */}
                            <span
                              style={{
                                fontSize: '13px',
                                color: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)',
                              }}
                            >
                              {perm.descripcion}
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
          {/* Botón Cancelar */}
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
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.10)')}
          >
            Cancelar
          </button>

          {/* Botón Crear Rol */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !nombre.trim() || !descripcion.trim()}
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
            {isSubmitting ? 'Creando...' : 'Crear rol'}
          </button>
        </div>
      </div>
    </DashboardLayoutTemplate>
  );
};
