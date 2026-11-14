import React, { useState } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  sourceKey?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, sourceKey }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2.5 bg-[#14213D] text-white text-xs rounded-lg shadow-elevated border border-slate-700 pointer-events-none transition-opacity duration-150">
          <div>{content}</div>
          {sourceKey && (
            <div className="mt-1 pt-1 border-t border-slate-600/60 text-[10px] text-slate-300 font-mono flex items-center justify-between">
              <span>Source:</span>
              <span className="text-[#C6A15B] font-semibold">{sourceKey}</span>
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#14213D]" />
        </div>
      )}
    </div>
  );
};

