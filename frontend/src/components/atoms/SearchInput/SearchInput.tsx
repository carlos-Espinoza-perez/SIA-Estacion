import React from 'react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  width = 300,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width,
        height: '36px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Icono búsqueda */}
      <div
        style={{
          position: 'absolute',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: '100%',
          paddingLeft: '34px',
          paddingRight: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          color: '#FFFFFF',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')
        }
      />
    </div>
  );
};
