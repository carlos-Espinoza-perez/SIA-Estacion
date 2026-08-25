import React from 'react';

export interface TableColumn<T> {
  /** Clave única de columna */
  key: string;
  /** Encabezado visible */
  header: string;
  /** Ancho de columna (px o string CSS) */
  width?: number | string;
  /** Alineación del contenido */
  align?: 'left' | 'center' | 'right';
  /** Render personalizado; recibe la fila completa */
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  /** Columnas de la tabla */
  columns: TableColumn<T>[];
  /** Filas de datos */
  data: T[];
  /** Función para extraer una key única de cada fila */
  rowKey: (row: T) => string | number;
  /** Texto del footer (ej. "Mostrando 12 de 1,284 eventos") */
  footerText?: string;
  /** Sin datos — mensaje vacío */
  emptyMessage?: string;
  /** Callback al hacer clic en una fila */
  onRowClick?: (row: T) => void;
  /** Propiedades de paginación (opcional) */
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const FONT: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
};

const HEADER_CELL: React.CSSProperties = {
  ...FONT,
  fontSize: '12px',
  fontWeight: 400,
  color: 'rgba(255, 255, 255, 0.4)',
  padding: '0 0 16px 0',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  userSelect: 'none',
};

const ROW_CELL: React.CSSProperties = {
  ...FONT,
  fontSize: '14px',
  fontWeight: 400,
  color: '#FFFFFF',
  padding: '20px 0',
  verticalAlign: 'middle',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
};

export function Table<T>({
  columns,
  data,
  rowKey,
  footerText,
  emptyMessage = 'Sin resultados',
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
}: TableProps<T>) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'auto',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
        }}
      >
        {/* Colgroup para anchuras */}
        <colgroup>
          {columns.map((col) => (
            <col
              key={col.key}
              style={{ width: col.width ?? 'auto' }}
            />
          ))}
        </colgroup>

        {/* Encabezados */}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...HEADER_CELL,
                  textAlign: col.align ?? 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Cuerpo */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  ...ROW_CELL,
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '13px',
                  padding: '40px 0',
                  border: 'none',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  transition: 'background 0.1s ease',
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
                onMouseOver={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                    'rgba(255,255,255,0.025)')
                }
                onMouseOut={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                    'transparent')
                }
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      ...ROW_CELL,
                      textAlign: col.align ?? 'left',
                      /* última fila sin borde inferior */
                      borderBottom:
                        idx === data.length - 1
                          ? 'none'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Footer / Paginación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'Inter, sans-serif' }}>
          {footerText}
        </div>
        
        {currentPage !== undefined && totalPages !== undefined && onPageChange && totalPages > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: currentPage <= 1 ? 'rgba(255, 255, 255, 0.2)' : 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
              }}
            >
              Anterior
            </button>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'Inter, sans-serif' }}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: currentPage >= totalPages ? 'rgba(255, 255, 255, 0.2)' : 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
              }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
