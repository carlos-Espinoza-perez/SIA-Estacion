import React from 'react';
import { Card } from '../../atoms/Card/Card';
import { Badge, BadgeProps } from '../../atoms/Badge/Badge';

export interface StatMetricProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    variant: BadgeProps['variant'];
  };
  subtitle?: string;
  accentColor?: string;
}

export const StatMetric: React.FC<StatMetricProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  accentColor = 'var(--primary)',
}) => {
  return (
    <Card glass padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {title}
          </span>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '4px',
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: `${accentColor}20`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>

      {(trend || subtitle) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          {trend && (
            <Badge variant={trend.variant} size="sm">
              {trend.value}
            </Badge>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};
