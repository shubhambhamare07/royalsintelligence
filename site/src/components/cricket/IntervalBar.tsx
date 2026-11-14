import React from 'react';
import { formatInterval } from '../../lib/format/numbers';

export interface IntervalBarProps {
  point: number;
  ci: [number, number];
  min?: number;
  max?: number;
  showLabels?: boolean;
  className?: string;
}

export const IntervalBar: React.FC<IntervalBarProps> = ({
  point,
  ci,
  min = 50,
  max = 100,
  showLabels = false,
  className = '',
}) => {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const toPct = (v: number) => ((clamp(v) - min) / (max - min)) * 100;

  const leftPct = toPct(ci[0]);
  const rightPct = toPct(ci[1]);
  const widthPct = Math.max(2, rightPct - leftPct);
  const pointPct = toPct(point);

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      <div className="relative w-full h-2.5 bg-slate-100 rounded-full border border-slate-200/80 overflow-hidden">
        {/* Credible interval whisker band */}
        <div
          className="absolute top-0 bottom-0 bg-[#E6007E]/25 rounded-full"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
        {/* Point estimate dot */}
        <div
          className="absolute top-0 bottom-0 w-2.5 -ml-1 bg-[#14213D] rounded-full border border-white shadow-xs"
          style={{ left: `${pointPct}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>{min}</span>
          <span className="font-semibold text-[#14213D]">
            {formatInterval(ci)}
          </span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

