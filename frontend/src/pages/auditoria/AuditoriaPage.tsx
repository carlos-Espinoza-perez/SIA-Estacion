import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { EventoAuditoria, TipoEventoAuditoria } from '../../types/auditoria';
import { auditoriaService } from '../../services/auditoriaService';
import { Button } from '../../components/atoms/Button/Button';
import { useToast } from '../../context/ToastContext';

export const AuditoriaPage: React.FC = () => {
  const { showToast } = useToast();
  const [eventos, setEventos] = useState<EventoAuditoria[]>([]);
  const [activeTab, setActiveTab] = useState<'eventos' | 'reportes'>('eventos');
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoEventoAuditoria | 'Todos'>('Todos');
  const [estacionFiltro, setEstacionFiltro] = useState('Todas');
  const [isExporting, setIsExporting] = useState(false);

  const cargarEventos = () => {
    auditoriaService
      .getEventos({
        busqueda,
        tipo: tipoFiltro,
        estacion: estacionFiltro,
      })
      .then(setEventos);
  };

  useEffect(() => {
    cargarEventos();
  }, [busqueda, tipoFiltro, estacionFiltro]);

  const estacionesUnicas = useMemo(() => {
    const list = ['Todas', 'Entrada principal', 'Laboratorio A', 'Cafetería', 'Salida norte', 'Taller', 'Laboratorio B'];
    return list;
  }, []);

  const getTipoColor = (tipo: TipoEventoAuditoria) => {
    switch (tipo) {
      case 'Acceso':
        return '#71DD8C'; // Green
      case 'Ítem':
        return '#7DBBFF'; // Blue
      case 'Seguridad':
        return '#B899EB'; // Purple / Magenta
      case 'Configuración':
        return '#ADADFB'; // Lavender / Indigo
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
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              margin: 0,
            }}
          >
            Auditoría
          </h2>

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
            Eventos
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
              placeholder="Buscar persona, ítem o folio"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                paddingLeft: '34px',
                paddingRight: '12px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Filtro: Tipo de evento */}
          <div style={{ position: 'relative' }}>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as TipoEventoAuditoria | 'Todos')}
              style={{
                height: '36px',
                backgroundColor: '#262626',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0 30px 0 12px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              <option value="Todos">Tipo de evento: Todos</option>
              <option value="Acceso">Tipo de evento: Acceso</option>
              <option value="Ítem">Tipo de evento: Ítem</option>
              <option value="Seguridad">Tipo de evento: Seguridad</option>
              <option value="Configuración">Tipo de evento: Configuración</option>
            </select>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Filtro: Estación */}
          <div style={{ position: 'relative' }}>
            <select
              value={estacionFiltro}
              onChange={(e) => setEstacionFiltro(e.target.value)}
              style={{
                height: '36px',
                backgroundColor: '#262626',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0 30px 0 12px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              {estacionesUnicas.map((est) => (
                <option key={est} value={est}>
                  {est === 'Todas' ? 'Estación: Todas' : `Estación: ${est}`}
                </option>
              ))}
            </select>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Rango de Fechas */}
          <div
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.8)',
              userSelect: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            01 – 28 jul 2026
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
            Exportar
          </Button>
        </div>

        {/* Contenedor Principal de Auditoría */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxSizing: 'border-box',
          }}
        >
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
                      width: '150px',
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
                      width: '160px',
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
                      width: '92px',
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
                        padding: '36px 14px',
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
                    const isSystemOrUnknown = ev.actor === 'No identificado' || ev.actor === 'Sistema';

                    return (
                      <tr
                        key={ev.id}
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
                            fontSize: '13px',
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
                            <span style={{ color: '#FFFFFF', fontWeight: 500, fontSize: '13px' }}>
                              {ev.tipo}
                            </span>
                          </div>
                        </td>

                        {/* Actor */}
                        <td
                          style={{
                            padding: '14px 14px',
                            color: isSystemOrUnknown ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF',
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
                            fontSize: '13px',
                          }}
                        >
                          {ev.estacion}
                        </td>

                        {/* Origen */}
                        <td
                          style={{
                            padding: '14px 14px',
                            color: 'rgba(255, 255, 255, 0.55)',
                            fontSize: '13px',
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

          {/* Footer de la Tabla */}
          <div
            style={{
              paddingTop: '14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{eventos.length} de 4,812 eventos · registro inmutable</span>
          </div>
        </div>
      </div>
    </DashboardLayoutTemplate>
  );
};
