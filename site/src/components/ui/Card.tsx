import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  bordered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  bordered = true,
  padding = 'md',
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-xl transition-all duration-200',
          bordered && 'border border-[#E2E8F0]',
          hover && 'hover:shadow-card-hover hover:border-slate-300',
          paddings[padding],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

