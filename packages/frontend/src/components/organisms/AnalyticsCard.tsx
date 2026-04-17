import React from 'react';
import { Card } from '../molecules/Card';
import { cn } from '../../utils/cn';

export interface Metric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export interface AnalyticsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  metrics: Metric[];
  layout?: 'grid' | 'list';
}

export const AnalyticsCard = React.forwardRef<HTMLDivElement, AnalyticsCardProps>(
  ({ title, subtitle, metrics, layout = 'grid', className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        header={
          <div>
            <h2 className="text-xl font-bold text-text-primary">{title}</h2>
            {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
          </div>
        }
        className={className}
        {...props}
      >
        <div
          className={cn(
            'gap-4',
            layout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              : 'flex flex-col'
          )}
        >
          {metrics.map((metric) => (
            <div key={metric.id} className="p-4 rounded-lg bg-background-primary">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-text-secondary font-medium">{metric.label}</p>
                  {metric.trend && (
                    <span
                      className={cn(
                        'text-xs font-semibold mt-1',
                        metric.trend === 'up'
                          ? 'text-success'
                          : metric.trend === 'down'
                            ? 'text-error'
                            : 'text-text-secondary'
                      )}
                    >
                      {metric.trendValue}
                    </span>
                  )}
                </div>
                {metric.icon && <span className="text-2xl">{metric.icon}</span>}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-text-primary">{metric.value}</span>
                {metric.unit && (
                  <span className="text-xs text-text-secondary font-medium">{metric.unit}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
);

AnalyticsCard.displayName = 'AnalyticsCard';
