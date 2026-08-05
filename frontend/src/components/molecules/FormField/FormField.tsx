import React from 'react';
import { Input, InputProps } from '../../atoms/Input/Input';

export interface FormFieldProps extends InputProps {
  label: string;
  helperText?: string;
  required?: boolean;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, helperText, required, error, id, ...inputProps }, ref) => {
    const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>

        <Input id={inputId} ref={ref} error={error} {...inputProps} />

        {error ? (
          <span style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '2px' }}>
            {error}
          </span>
        ) : helperText ? (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
