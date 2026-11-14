import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export interface RankingBannerProps {
  modelVersion?: string;
  configHash?: string;
  battersCount?: number;
  bowlersCount?: number;
  className?: string;
}

export const RankingBanner: React.FC<RankingBannerProps> = ({
  modelVersion = 'pressure-v1.1',
  configHash = 'da080d49d24d19d126d69763ebaaaf994c6abfeaf2efd3b2161e2224c39ee6bb',
  battersCount = 155,
  bowlersCount = 151,
  className = '',
}) => {
  return (
    <div className={`w-full bg-[#14213D] text-white px-5 py-3.5 rounded-xl border border-slate-700/60 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#E6007E]/20 border border-[#E6007E]/40 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#E6007E]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">FROZEN RANKINGS LEDGER</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              GATE G3 PASSED
            </span>
          </div>
          <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5 font-mono">
            <span>Model: {modelVersion}</span>
            <span>•</span>
            <span className="truncate max-w-[140px] md:max-w-[200px]" title={configHash}>
              Hash: {configHash.substring(0, 12)}…
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-300 border-t md:border-t-0 pt-2 md:pt-0 border-slate-700/60">
        <div>
          Qualified Batters: <span className="font-mono text-white font-bold">{battersCount}</span>
        </div>
        <div>
          Qualified Bowlers: <span className="font-mono text-white font-bold">{bowlersCount}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#C6A15B] bg-[#C6A15B]/10 px-2 py-1 rounded border border-[#C6A15B]/20">
          <Info className="w-3.5 h-3.5" />
          <span>Strict Threshold: n ≥ 60 balls</span>
        </div>
      </div>
    </div>
  );
};
