import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { EventoAuditoria, TipoEventoAuditoria } from '../../types/auditoria';
import { auditoriaService } from '../../services/auditoriaService';
import { estacionService } from '../../services/estacionService';
import { Estacion } from '../../types/estacion';
import { Button } from '../../components/atoms/Button/Button';
import { Spinner } from '../../components/atoms/Spinner/Spinner';
import { useToast } from '../../context/ToastContext';

export const AuditoriaPage: React.FC = () => {
  const { showToast } = useToast();
  const [eventos, setEventos] = useState<EventoAuditoria[]>([]);
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'eventos' | 'reportes'>('eventos');

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoEventoAuditoria | 'Todos'>('Todos');
  const [estacionFiltro, setEstacionFiltro] = useState('Todas');
  const [isExporting, setIsExporting] = useState(false);

  // Paginación server-side
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // Cargar estaciones reales del backend para el filtro
  useEffect(() => {
    estacionService.getEstaciones().then(setEstaciones).catch(console.error);
  }, []);

  const cargarEventos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await auditoriaService.getEventos({
        busqueda: busquedaDebounced.trim(),
        tipo: tipoFiltro,
        estacion: estacionFiltro,
        pagina: currentPage,
        limite: itemsPorPagina,
      });

      setEventos(result.data);
      if (result.paginacion) {
        setTotalPages(result.paginacion.totalPaginas);
        setTotalRegistros(result.paginacion.totalRegistros);
      } else {
        setTotalPages(1);
        setTotalRegistros(result.data.length);
      }
    } catch (error: any) {
      showToast(error.message || 'Error al cargar eventos de auditoría', 'error');
    } finally {
      setLoading(false);
    }
  }, [busquedaDebounced, tipoFiltro, estacionFiltro, currentPage, itemsPorPagina, showToast]);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // Lista de nombres de estaciones reales
  const estacionesNombres = useMemo(() => {
    const nombres = estaciones.map((e) => e.nombre);
    return ['Todas', ...Array.from(new Set(nombres))];
  }, [estaciones]);

  const getTipoColor = (tipo: TipoEventoAuditoria) => {
    switch (tipo) {
      case 'Acceso':
        return '#71DD8C'; // Verde
      case 'Ítem':
        return '#7DBBFF'; // Azul
      case 'Operación':
        return '#FBBF24'; // Ámbar
      case 'Seguridad':
        return '#B899EB'; // Púrpura
      case 'Configuración':
        return '#ADADFB'; // Índigo
      default:
        return 'rgba(255, 255, 255, 0.4)';
    }
  };

  const handleExportar = async () => {
    setIsExporting(true);
    try {
      const csvContent = await auditoriaService.exportarCSV({
        busqueda,
        tipo: tipoFiltro,
        estacion: estacionFiltro,
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Bitácora exportada en formato CSV', 'success');
    } catch {
      showToast('Error al exportar la bitácora', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const indiceInicio = totalRegistros === 0 ? 0 : (currentPage - 1) * itemsPorPagina + 1;
  const indiceFin = Math.min(currentPage * itemsPorPagina, totalRegistros);

  return (
    <DashboardLayoutTemplate breadcrumbTitle="Auditoría">
      <div
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box',
          width: '100%',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Encabezado: Título + Pestañas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#FFFFFF',
                margin: 0,
              }}
            >
              Auditoría y Bitácora
            </h2>
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.45)' }}>
              Registro inmutable de acciones, cambios de seguridad y accesos consultados directamente en base de datos
            </span>
          </div>

          {/* Pestañas Eventos / Reportes */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              padding: '3px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Button
              variant={activeTab === 'eventos' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('eventos')}
            >
              Eventos ({totalRegistros})
            </Button>
            <Button
              variant={activeTab === 'reportes' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('reportes')}
            >
              Reportes
            </Button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Input de Búsqueda */}
          <div
            style={{
              position: 'relative',
              width: '280px',
              maxWidth: '100%',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="2"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar persona, actor o detalle..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                height: '36px',
                paddingLeft: '34px',
                paddingRight: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Selector de Tipo de Evento */}
          <div style={{ position: 'relative' }}>
            <select
              value={tipoFiltro}
              onChange={(e) => {
                setTipoFiltro(e.target.value as any);
                setCurrentPage(1);
              }}
              style={{
                height: '36px',
                padding: '0 32px 0 12px',
                borderRadius: '8px',
                backgroundColor: '#2A2A2A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '13px',
                appearance: 'none',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="Todos">Tipo de evento: Todos</option>
              <option value="Seguridad">Seguridad (Roles/Usuarios)</option>
              <option value="Acceso">Acceso</option>
              <option value="Operación">Operación (Préstamos)</option>
              <option value="Ítem">Ítem (Inventario)</option>
              <option value="Configuración">Configuración</option>
            </select>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1.5"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Selector de Estación Real */}
          <div style={{ position: 'relative' }}>
            <select
              value={estacionFiltro}
              onChange={(e) => {
                setEstacionFiltro(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                height: '36px',
                padding: '0 32px 0 12px',
                borderRadius: '8px',
                backgroundColor: '#2A2A2A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '13px',
                appearance: 'none',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {estacionesNombres.map((est) => (
                <option key={est} value={est}>
                  {est === 'Todas' ? 'Estación: Todas' : est}
                </option>
              ))}
            </select>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1.5"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div style={{ flex: 1 }} />

          {/* Botón Exportar */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleExportar}
            isLoading={isExporting}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          >
            Exportar CSV
          </Button>
        </div>

        {/* Contenedor Principal de Auditoría */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxSizing: 'border-box',
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px' }}>
              <Spinner size={32} color="var(--primary)" />
            </div>
          ) : (
            <>
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
                          width: '170px',
                        }}
                      >
                        Fecha y hora
                      </th>
                      <th
                        style={{
                          padding: '12px 14px',
                          textAlign: 'left',
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontSize: '12px',
                          width: '140px',
                        }}
                      >
                        Tipo
                      </th>
                      <th
                        style={{
                          padding: '12px 14px',
                          textAlign: 'left',
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontSize: '12px',
                          width: '180px',
                        }}
                      >
                        Actor
                      </th>
                      <th
                        style={{
                          padding: '12px 14px',
                          textAlign: 'left',
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontSize: '12px',
                        }}
                      >
                        Descripción
                      </th>
                      <th
                        style={{
                          padding: '12px 14px',
                          textAlign: 'left',
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontSize: '12px',
                          width: '140px',
                        }}
                      >
                        Estación
                      </th>
                      <th
                        style={{
                          padding: '12px 14px',
                          textAlign: 'left',
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontSize: '12px',
                          width: '90px',
                        }}
                      >
                        Origen
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: '40px 14px',
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontSize: '13px',
                          }}
                        >
                          No se encontraron eventos con los filtros seleccionados
                        </td>
                      </tr>
                    ) : (
                      eventos.map((ev, idx) => {
                        const dotColor = getTipoColor(ev.tipo);
                        const isSystemOrUnknown = ev.actor === 'Usuario' || ev.actor === 'Sistema';

                        return (
                          <tr
                            key={ev.id + '-' + idx}
                            style={{
                              borderBottom:
                                idx === eventos.length - 1
                                  ? 'none'
                                  : '1px solid rgba(255, 255, 255, 0.05)',
                              transition: 'background-color 0.1s ease',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {/* Fecha y hora */}
                            <td
                              style={{
                                padding: '14px 14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                                fontSize: '12.5px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {ev.fechaHora}
                            </td>

                            {/* Tipo con Indicador Circular de Color */}
                            <td style={{ padding: '14px 14px' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <div
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: dotColor,
                                    flexShrink: 0,
                                  }}
                                />
                                <span style={{ color: '#FFFFFF', fontWeight: 500, fontSize: '12.5px' }}>
                                  {ev.tipo}
                                </span>
                              </div>
                            </td>

                            {/* Actor */}
                            <td
                              style={{
                                padding: '14px 14px',
                                color: isSystemOrUnknown ? 'rgba(255, 255, 255, 0.6)' : '#FFFFFF',
                                fontWeight: isSystemOrUnknown ? 400 : 500,
                                fontSize: '13px',
                              }}
                            >
                              {ev.actor}
                            </td>

                            {/* Descripción */}
                            <td
                              style={{
                                padding: '14px 14px',
                                color: '#FFFFFF',
                                fontSize: '13px',
                                lineHeight: '1.4',
                              }}
                            >
                              {ev.descripcion}
                            </td>

                            {/* Estación */}
                            <td
                              style={{
                                padding: '14px 14px',
                                color: ev.estacion === '—' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.75)',
                                fontSize: '12.5px',
                              }}
                            >
                              {ev.estacion}
                            </td>

                            {/* Origen */}
                            <td
                              style={{
                                padding: '14px 14px',
                                color: 'rgba(255, 255, 255, 0.55)',
                                fontSize: '12.5px',
                              }}
                            >
                              {ev.origen}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Controles de Paginación Server-Side */}
              {totalRegistros > 0 && (
                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '12.5px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  {/* Selector de Items por Página */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>Mostrando</span>
                    <select
                      value={itemsPorPagina}
                      onChange={(e) => {
                        setItemsPorPagina(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{
                        height: '30px',
                        borderRadius: '6px',
                        backgroundColor: '#2A2A2A',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        padding: '0 8px',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>
                      registros ({indiceInicio} - {indiceFin} de {totalRegistros})
                    </span>
                  </div>

                  {/* Botones de Navegación de Página */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {/* Botón Primera Página */}
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                      style={{
                        height: '30px',
                        padding: '0 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        color: currentPage === 1 ? 'rgba(255, 255, 255, 0.2)' : '#FFFFFF',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                      title="Primera página"
                    >
                      «
                    </button>

                    {/* Botón Página Anterior */}
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      style={{
                        height: '30px',
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        color: currentPage === 1 ? 'rgba(255, 255, 255, 0.2)' : '#FFFFFF',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Anterior
                    </button>

                    {/* Indicador de Páginas */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, idx, arr) => {
                        const prevPage = arr[idx - 1];
                        const showEllipsis = prevPage && p - prevPage > 1;
                        const isSelected = p === currentPage;

                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && <span style={{ padding: '0 4px', color: 'rgba(255, 255, 255, 0.3)' }}>...</span>}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(p)}
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                backgroundColor: isSelected ? '#ADADFB' : 'rgba(255, 255, 255, 0.04)',
                                color: isSelected ? '#17171C' : '#FFFFFF',
                                fontWeight: isSelected ? 700 : 400,
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    {/* Botón Página Siguiente */}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      style={{
                        height: '30px',
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        color: currentPage === totalPages ? 'rgba(255, 255, 255, 0.2)' : '#FFFFFF',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Siguiente
                    </button>

                    {/* Botón Última Página */}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      style={{
                        height: '30px',
                        padding: '0 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        color: currentPage === totalPages ? 'rgba(255, 255, 255, 0.2)' : '#FFFFFF',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                      title="Última página"
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayoutTemplate>
  );
};
