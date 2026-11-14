import React from 'react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'pills',
  className = '',
}) => {
  if (variant === 'underline') {
    return (
      <div className={`flex border-b border-slate-200 gap-6 ${className}`}>
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'pb-3 text-sm font-semibold transition-all relative flex items-center gap-2',
                isActive
                  ? 'text-[#E6007E]'
                  : 'text-slate-500 hover:text-[#14213D]'
              )}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={clsx(
                    'text-[11px] px-1.5 py-0.2 rounded-full font-mono',
                    isActive ? 'bg-[#FFF0F6] text-[#E6007E]' : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E6007E] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-1 ${className}`}>
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5',
              isActive
                ? 'bg-white text-[#14213D] shadow-sm'
                : 'text-slate-600 hover:text-[#14213D]'
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold',
                  isActive ? 'bg-slate-100 text-[#14213D]' : 'bg-slate-200/60 text-slate-500'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

