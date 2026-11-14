import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white border-t border-[#E2E8F0] py-6 px-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-bold text-[#14213D] text-sm">
            ROYALS INTELLIGENCE — IPL 2027 AUCTION PLATFORM
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-xl">
            Official quantitative pressure evaluation and decision support platform for Rajasthan Royals.
            Statistical ratings derived from Empirical Bayes hierarchical shrinkage over verified ball-by-ball delivery archives.
          </p>
        </div>

        <div className="text-right text-[11px] font-mono space-y-1">
          <div>Model: <span className="text-[#14213D] font-bold">pressure-v1.1</span></div>
          <div>Config Hash: <span className="text-slate-600">da080d49d24d…</span></div>
          <div className="text-emerald-700 font-bold">Gate G3 Status: PASSED</div>
        </div>
      </div>
    </footer>
  );
};

