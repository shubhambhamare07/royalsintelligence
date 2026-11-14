import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export interface ConfidenceMeterProps {
  nDeliveries: number;
  nEffective: number;
  threshold?: number;
  className?: string;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  nDeliveries,
  nEffective,
  threshold = 60,
  className = '',
}) => {
  const isHighConfidence = nEffective >= 150;
  const isModerate = nEffective >= threshold && nEffective < 150;

  const statusLabel = isHighConfidence
    ? 'High Sample Confidence'
    : isModerate
    ? 'Moderate Sample Confidence'
    : 'Low Exposure (Heavy Shrinkage)';

  const iconColor = isHighConfidence
    ? 'text-emerald-500'
    : isModerate
    ? 'text-blue-500'
    : 'text-amber-500';

  const tooltipText = (
    <div className="space-y-1">
      <div className="font-bold">{statusLabel}</div>
      <div>Observed Pressure Deliveries: <span className="font-mono">{nDeliveries}</span></div>
      <div>Effective Information Sample (neff): <span className="font-mono">{nEffective.toFixed(1)}</span></div>
      <div className="text-[10px] text-slate-300">
        Empirical Bayes shrinkage applies automatically to protect against small-sample variance.
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipText} sourceKey="STAT-NEFF-EXP">
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-50 border border-slate-200 cursor-help ${className}`}>
        {isHighConfidence || isModerate ? (
          <ShieldCheck className={`w-3.5 h-3.5 ${iconColor}`} />
        ) : (
          <AlertCircle className={`w-3.5 h-3.5 ${iconColor}`} />
        )}
        <span className="font-mono text-slate-700">{nDeliveries}b</span>
        <span className="text-[10px] text-slate-400 font-mono">({nEffective.toFixed(0)} neff)</span>
      </div>
    </Tooltip>
  );
};

