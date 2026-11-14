import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';
import { getPlayerImageUrl } from '../../lib/data/playerImages';

export interface InclusionItem {
  id: string;
  name: string;
  rank: number;
  rating: number;
  prob: number; // 0.0 to 1.0
  isFragile: boolean;
}

interface InclusionBarChartProps {
  items: InclusionItem[];
  title?: string;
  role: 'batter' | 'bowler';
  totalSimulations?: number;
}

export const InclusionBarChart: React.FC<InclusionBarChartProps> = ({
  items,
  title,
  role,
  totalSimulations = 500,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Chart Header */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical frequency of remaining in Top 10 across {totalSimulations} Monte Carlo runs with target noise (σ ≈ 3.6 runs)
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] shrink-0 font-medium">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              &ge;50% Robust
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              20&ndash;50% Moderate
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-[#E6007E] border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6007E]" />
              &lt;20% Fragile
            </span>
          </div>
        </div>
      )}

      {/* Column Headers with 0% - 100% Scale */}
      <div className="grid grid-cols-12 gap-2 text-[11px] font-mono text-slate-400 uppercase tracking-wider pb-1 px-2 border-b border-slate-100 items-center">
        <div className="col-span-4 font-semibold text-slate-500">Player &amp; Baseline</div>
        <div className="col-span-5 relative">
          <div className="flex justify-between w-full text-[10px] text-slate-400 font-mono">
            <span>0%</span>
            <span>25%</span>
            <span className="text-slate-600 font-bold">50% Line</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        <div className="col-span-3 text-right font-semibold text-slate-500">Survival &amp; Status</div>
      </div>

      {/* Rows Container */}
      <div className="space-y-2 relative">
        {/* Continuous 50% vertical dashed guide line across all rows */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none border-l border-dashed border-slate-300 z-0"
          style={{ left: 'calc(33.333% + (41.666% * 0.5) + 4px)' }}
          title="50% Inclusion Threshold"
        />

        {items.map((item) => {
          const pct = Math.round(item.prob * 1000) / 10;
          const photoUrl = getPlayerImageUrl(item.id);

          // Classification logic
          let classification: { label: string; badgeClass: string; barClass: string; textClass: string };
          if (item.prob >= 0.5) {
            classification = {
              label: 'ROBUST (≥50%)',
              badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              barClass: 'bg-emerald-500',
              textClass: 'text-emerald-700',
            };
          } else if (item.prob >= 0.2) {
            classification = {
              label: 'MODERATE (20-50%)',
              badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
              barClass: 'bg-amber-500',
              textClass: 'text-amber-700',
            };
          } else {
            classification = {
              label: 'FRAGILE (<20%)',
              badgeClass: 'bg-rose-50 text-[#E6007E] border-rose-200',
              barClass: 'bg-[#E6007E]',
              textClass: 'text-[#E6007E]',
            };
          }

          return (
            <div
              key={item.id}
              className="grid grid-cols-12 items-center gap-2 py-2 px-2 rounded-lg hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-200 relative z-10"
            >
              {/* Player Identity (Rank + Photo + Name + Rating) */}
              <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 flex items-center justify-center rounded bg-[#14213D] text-white font-mono text-[11px] font-bold shrink-0">
                  #{item.rank}
                </span>

                {/* Player Photo or Fallback Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      {item.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <Link
                    to={`/player/${item.id}`}
                    className="font-bold text-slate-900 text-xs hover:text-[#E6007E] truncate block transition-colors"
                  >
                    {item.name}
                  </Link>
                  <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                    Rating: <span className="font-semibold text-slate-600">{item.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Container with percentage OUTSIDE the bar */}
              <div className="col-span-5 flex items-center gap-2">
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full ${classification.barClass} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.max(item.prob * 100, 2)}%` }}
                  />
                </div>
                <span className={`text-xs font-mono font-bold tabular-nums w-12 text-right shrink-0 ${classification.textClass}`}>
                  {pct.toFixed(1)}%
                </span>
              </div>

              {/* Dedicated Classification Badge Column (No overlap!) */}
              <div className="col-span-3 flex items-center justify-end">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${classification.badgeClass}`}
                >
                  {classification.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
