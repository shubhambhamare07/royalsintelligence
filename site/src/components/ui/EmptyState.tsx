import React from 'react';
import { SearchX } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        {icon || <SearchX className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-bold text-[#14213D] mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

