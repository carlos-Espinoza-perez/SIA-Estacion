import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar',
  width = 170,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '0 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          color: selected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
          transition: 'border-color 0.15s ease, background-color 0.15s ease',
          textAlign: 'left',
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')
        }
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#2a2a2a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            zIndex: 50,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'none',
                  border: 'none',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'block',
                  transition: 'background 0.1s ease',
                }}
                onMouseOver={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'none';
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
