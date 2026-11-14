import React from 'react';
import { MetricSourceBadge } from '../cricket/MetricSourceBadge';
import { ProvenanceTag } from '../../lib/data/types';
import { Skeleton } from '../ui/Skeleton';

export interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  sourceKey?: string;
  provenance?: ProvenanceTag;
  loading?: boolean;
  children: React.ReactNode;
  height?: string | number;
  className?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  sourceKey,
  provenance = 'Model estimate',
  loading = false,
  children,
  height = '320px',
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-card flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#14213D] tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {provenance && (
          <MetricSourceBadge tag={provenance} sourceKey={sourceKey} />
        )}
      </div>

      {/* Chart Canvas */}
      <div
        className="w-full relative flex items-center justify-center"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {loading ? (
          <div className="w-full h-full flex flex-col gap-3 p-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

