import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#E6007E] text-white hover:bg-[#CC0070] active:bg-[#B30062] focus:ring-[#E6007E] shadow-sm',
    secondary: 'bg-[#14213D] text-white hover:bg-[#1D2D50] active:bg-[#0B132B] focus:ring-[#14213D] shadow-sm',
    outline: 'border border-[#E2E8F0] bg-white text-[#14213D] hover:bg-slate-50 hover:border-slate-300 focus:ring-[#14213D]',
    ghost: 'text-[#14213D] hover:bg-slate-100 focus:ring-slate-400',
    gold: 'bg-[#C6A15B] text-[#14213D] hover:bg-[#B5914A] active:bg-[#A38038] focus:ring-[#C6A15B] font-bold shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

