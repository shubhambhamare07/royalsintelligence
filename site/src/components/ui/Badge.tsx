import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'pink' | 'navy' | 'gold' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full border transition-colors';

  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    pink: 'bg-[#FFF0F6] text-[#E6007E] border-[#FFD6E7]',
    navy: 'bg-[#14213D] text-white border-[#14213D]',
    gold: 'bg-[#FAF5EA] text-[#B5914A] border-[#EEDCB4]',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </span>
  );
};

