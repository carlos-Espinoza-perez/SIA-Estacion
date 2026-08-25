import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { personaService } from '../../../services/personaService';
import { itemService } from '../../../services/itemService';
import { estacionService } from '../../../services/estacionService';
import { Kbd } from '../../atoms/Kbd/Kbd';

export interface ModalBusquedaGlobalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CategoriaBusqueda = 'Todos' | 'Vistas' | 'Personas' | 'Ítems' | 'Estaciones';

interface ResultadoBusqueda {
  id: string;
  titulo: string;
  subtitulo: string;
  categoria: 'Vistas' | 'Personas' | 'Ítems' | 'Estaciones';
  badgeColor: string;
  path: string;
  icon?: React.ReactNode;
}

export const ModalBusquedaGlobal: React.FC<ModalBusquedaGlobalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaBusqueda>('Todos');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Autofoco al abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Lista base de vistas estáticas del sistema
  const vistasSistema: ResultadoBusqueda[] = useMemo(
    () => [
      {
        id: 'v-dashboard',
        titulo: 'Dashboard',
        subtitulo: 'Métricas generales, accesos recientes y estado del sistema',
        categoria: 'Vistas',
        badgeColor: '#3B82F6',
        path: '/dashboard',
      },
      {
        id: 'v-accesos',
        titulo: 'Registro de Accesos',
        subtitulo: 'Monitoreo de validaciones NFC y control perimetral',
        categoria: 'Vistas',
        badgeColor: '#10B981',
        path: '/accesos',
      },
      {
        id: 'v-operaciones',
        titulo: 'Operaciones y Préstamos',
        subtitulo: 'Gestión de préstamos de recursos, devoluciones y aprobaciones',
        categoria: 'Vistas',
        badgeColor: '#F59E0B',
        path: '/operaciones',
      },
      {
        id: 'v-personas',
        titulo: 'Directorio de Personas',
        subtitulo: 'Gestión de estudiantes, profesores y personal con credenciales',
        categoria: 'Vistas',
        badgeColor: '#8B5CF6',
        path: '/personas',
      },
      {
        id: 'v-items',
        titulo: 'Inventario de Ítems',
        subtitulo: 'Catálogo de recursos gestionables, códigos QR y categorías',
        categoria: 'Vistas',
        badgeColor: '#EC4899',
        path: '/items',
      },
      {
        id: 'v-estaciones',
        titulo: 'Estaciones de Trabajo',
        subtitulo: 'Terminales de validación, torniquetes y configuración de red',
        categoria: 'Vistas',
        badgeColor: '#06B6D4',
        path: '/estaciones',
      },
      {
        id: 'v-roles',
        titulo: 'Roles y Permisos',
        subtitulo: 'Matriz de claims de seguridad y perfiles de acceso',
        categoria: 'Vistas',
        badgeColor: '#6366F1',
        path: '/roles',
      },
      {
        id: 'v-auditoria',
        titulo: 'Bitácora de Auditoría',
        subtitulo: 'Registro cronológico inmutable de eventos y exportación',
        categoria: 'Vistas',
        badgeColor: '#EF4444',
        path: '/auditoria',
      },
    ],
    []
  );

  const [extraResultados, setExtraResultados] = useState<ResultadoBusqueda[]>([]);

  // Cargar datos indexados de servicios cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const cargarDatos = async () => {
      try {
        const [personasResult, items, estaciones] = await Promise.all([
          personaService.getPersonas(),
          itemService.getItems(),
          estacionService.getEstaciones(),
        ]);

        if (!isMounted) return;

        const personas = personasResult.data;

        const personasMapeadas: ResultadoBusqueda[] = personas.map((p) => ({
          id: `p-${p.id}`,
          titulo: p.nombre,
          subtitulo: `${p.carnet} · ${p.rol} (${p.carreraOArea})`,
          categoria: 'Personas',
          badgeColor: '#8B5CF6',
          path: '/personas',
        }));

        const itemsMapeados: ResultadoBusqueda[] = items.map((i) => ({
          id: `i-${i.id}`,
          titulo: i.nombre,
          subtitulo: `${i.codigo} · ${i.tipo} · ${i.estacion}`,
          categoria: 'Ítems',
          badgeColor: '#EC4899',
          path: '/items',
        }));

        const estacionesMapeadas: ResultadoBusqueda[] = estaciones.map((e) => ({
          id: `e-${e.id}`,
          titulo: e.nombre,
          subtitulo: `${e.ubicacion} · Encargado: ${e.encargado} (${e.estado})`,
          categoria: 'Estaciones',
          badgeColor: '#06B6D4',
          path: '/estaciones',
        }));

        setExtraResultados([
          ...personasMapeadas,
          ...itemsMapeados,
          ...estacionesMapeadas,
        ]);
      } catch (err) {
        console.error('Error al indexar datos para búsqueda global:', err);
      }
    };

    cargarDatos();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const todosLosResultados = useMemo(
    () => [...vistasSistema, ...extraResultados],
    [vistasSistema, extraResultados]
  );

  // Filtrado reactivo por query y chip de categoría
  const resultadosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todosLosResultados.filter((item) => {
      const matchCat =
        categoriaActiva === 'Todos' || item.categoria === categoriaActiva;
      if (!matchCat) return false;
      if (!q) return true;

      return (
        item.titulo.toLowerCase().includes(q) ||
        item.subtitulo.toLowerCase().includes(q) ||
        item.categoria.toLowerCase().includes(q)
      );
    });
  }, [todosLosResultados, query, categoriaActiva]);

  // Reset del cursor al cambiar búsqueda
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, categoriaActiva]);

  // Navegar al seleccionar un resultado
  const handleSelect = (item: ResultadoBusqueda) => {
    onClose();
    navigate(item.path);
  };

  // Manejo de teclado (flechas, enter, escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < resultadosFiltrados.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : resultadosFiltrados.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (resultadosFiltrados[selectedIndex]) {
        handleSelect(resultadosFiltrados[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  const categorias: CategoriaBusqueda[] = ['Todos', 'Vistas', 'Personas', 'Ítems', 'Estaciones'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop con desenfoque */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.68)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.18s ease',
        }}
      />

      {/* Caja de Búsqueda Flotante (Omnibox) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '640px',
          maxWidth: '92vw',
          maxHeight: '78vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#292929',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          animation: 'slideDown 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* 1. Header con Input de Búsqueda */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar personas, ítems, estaciones, vistas..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '15px',
              fontFamily: 'Inter, sans-serif',
            }}
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              ✕
            </button>
          )}

          <Kbd>ESC</Kbd>
        </div>

        {/* 2. Filtros de Categoría */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            overflowX: 'auto',
          }}
        >
          {categorias.map((cat) => {
            const isSelected = categoriaActiva === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                style={{
                  background: isSelected
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'transparent',
                  border: isSelected
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid transparent',
                  color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '12px',
                  fontWeight: isSelected ? 600 : 400,
                  fontFamily: 'Inter, sans-serif',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 3. Lista de Resultados */}
        <div
          ref={resultsContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 12px',
            maxHeight: '380px',
          }}
        >
          {resultadosFiltrados.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.35)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
              }}
            >
              No se encontraron resultados para "{query}"
            </div>
          ) : (
            resultadosFiltrados.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: isSelected
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.12s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: item.badgeColor,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#FFFFFF',
                          fontFamily: 'Inter, sans-serif',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.titulo}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontFamily: 'Inter, sans-serif',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.subtitulo}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {item.categoria}
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.35)',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        ↵
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. Footer con atajos de teclado */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> Navegar
            </span>
            <span>
              <Kbd>↵</Kbd> Seleccionar
            </span>
            <span>
              <Kbd>ESC</Kbd> Cerrar
            </span>
          </div>

          <div>
            Mostrando {resultadosFiltrados.length} resultado{resultadosFiltrados.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
