import React from 'react';
import { Tooltip } from './Tooltip';
import { HelpCircle } from 'lucide-react';

export interface UnavailableBadgeProps {
  reason?: string;
  sourceKey?: string;
  className?: string;
}

export const UnavailableBadge: React.FC<UnavailableBadgeProps> = ({
  reason = 'Metric unavailable: insufficient qualifying deliveries.',
  sourceKey,
  className = '',
}) => {
  return (
    <Tooltip content={reason} sourceKey={sourceKey}>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500 rounded border border-slate-200 cursor-help ${className}`}>
        <span>Unavailable</span>
        <HelpCircle className="w-3 h-3 text-slate-400" />
      </span>
    </Tooltip>
  );
};

