import React from 'react';
import { useCountUp } from '../../lib/motion/useCountUp';

export interface RatingDisplayProps {
  value: number;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  subtext?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  value,
  animate = true,
  size = 'md',
  className = '',
  subtext,
}) => {
  const animatedValue = useCountUp(value, 900, 2, animate);
  const displayValue = animate ? animatedValue : value.toFixed(2);

  const sizes = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-extrabold',
    lg: 'text-3xl font-extrabold tracking-tight',
    xl: 'text-5xl font-black tracking-tight',
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className={`font-mono tabular-nums text-[#14213D] flex items-baseline gap-1 ${sizes[size]}`}>
        <span>{displayValue}</span>
        <span className="text-[11px] font-sans font-bold text-slate-400">/100</span>
      </div>
      {subtext && (
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
          {subtext}
        </span>
      )}
    </div>
  );
};

