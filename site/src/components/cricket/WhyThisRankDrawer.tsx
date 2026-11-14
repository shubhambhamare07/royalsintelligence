import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { RankedPlayer } from '../../lib/data/types';
import { PlayerAvatar } from './PlayerAvatar';
import { TierBadge } from './TierBadge';
import { RatingDisplay } from './RatingDisplay';
import { IntervalBar } from './IntervalBar';
import { ConfidenceMeter } from './ConfidenceMeter';
import { MetricSourceBadge } from './MetricSourceBadge';
import { formatZScore, formatPerHundred, formatPercent } from '../../lib/format/numbers';
import { ExternalLink, Award, Dna, GitCompare } from 'lucide-react';

export interface WhyThisRankDrawerProps {
  player: RankedPlayer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhyThisRankDrawer: React.FC<WhyThisRankDrawerProps> = ({
  player,
  isOpen,
  onClose,
}) => {
  if (!player) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#C6A15B]" />
          <span>RANK #{player.rank} BREAKDOWN</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Player Identity Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <PlayerAvatar playerId={player.player_id} playerName={player.player_name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-[#14213D] truncate">{player.player_name}</h3>
              <TierBadge tier={player.tier} size="sm" />
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
              <span>ID: {player.player_id}</span>
              <span>•</span>
              <span className="capitalize">{player.role}</span>
            </div>
          </div>
        </div>

        {/* Certified Rating Summary */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Empirical Bayes Rating
            </span>
            <MetricSourceBadge tag="Model estimate" sourceKey="EB-SHRINK-V1.1" />
          </div>

          <div className="flex items-baseline justify-between">
            <RatingDisplay value={player.rating} size="lg" />
            <div className="text-right">
              <div className="text-xs text-slate-500">90% Credible Interval</div>
              <div className="text-sm font-mono font-bold text-[#14213D]">
                [{player.rating_ci90[0].toFixed(2)}, {player.rating_ci90[1].toFixed(2)}]
              </div>
            </div>
          </div>

          <IntervalBar point={player.rating} ci={player.rating_ci90} showLabels min={50} max={100} />

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Top-10 Inclusion Probability:</span>
            <span className="font-mono font-bold text-[#E6007E]">
              {formatPercent(player.top10_inclusion_prob)}
            </span>
          </div>
        </div>

        {/* 3 Core Analytical Components */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Certified Component Scores
          </h4>

          {/* PV */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[#14213D]">Pressure Value (PV)</div>
              <div className="text-xs text-slate-500">Runs generated per 100 pressure balls</div>
            </div>
            <div className="text-right font-mono">
              <div className="text-sm font-bold text-[#14213D]">
                {formatPerHundred(player.pressure_value * 100)} /100b
              </div>
              <div className="text-xs text-slate-500">
                z-score: {formatZScore(player.PV_scaled)}
              </div>
            </div>
          </div>

          {/* CD */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[#14213D]">Clutch Delta (CD)</div>
              <div className="text-xs text-slate-500">Differential vs normal match phase</div>
            </div>
            <div className="text-right font-mono">
              <div className="text-sm font-bold text-[#14213D]">
                {formatPerHundred(player.CD * 100)} /100b
              </div>
              <div className="text-xs text-slate-500">
                z-score: {formatZScore(player.CD_scaled)}
              </div>
            </div>
          </div>

          {/* PC */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[#14213D]">Pressure Consistency (PC)</div>
              <div className="text-xs text-slate-500">Hit rate across pressure appearances</div>
            </div>
            <div className="text-right font-mono">
              <div className="text-sm font-bold text-[#14213D]">
                {formatPercent(player.PC)}
              </div>
              <div className="text-xs text-slate-500">
                z-score: {formatZScore(player.PC_scaled)}
              </div>
            </div>
          </div>
        </div>

        {/* Certified Natural Language Explanation */}
        <div className="p-4 rounded-xl bg-[#14213D] text-white border border-slate-700 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#C6A15B]">
            Analytical Summary
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {player.explanation}
          </p>
        </div>

        {/* Sample Exposure */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
          <span className="text-xs font-medium text-slate-600">Sample Exposure:</span>
          <ConfidenceMeter
            nDeliveries={player.n_pressure_deliveries}
            nEffective={player.neff_pressure}
          />
        </div>

        {/* Navigation Action Links */}
        <div className="pt-2 space-y-2">
          <Link
            to={`/player/${player.player_id}`}
            onClick={onClose}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#E6007E] text-white font-semibold text-xs hover:bg-[#CC0070] transition-colors shadow-xs"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View Full Player Profile
            </span>
            <span>→</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/dna/${player.player_id}`}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-[#14213D] hover:bg-slate-50 transition-colors"
            >
              <Dna className="w-4 h-4 text-[#E6007E]" />
              <span>Pressure DNA</span>
            </Link>

            <Link
              to={`/compare?ids=${player.player_id}`}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-[#14213D] hover:bg-slate-50 transition-colors"
            >
              <GitCompare className="w-4 h-4 text-[#14213D]" />
              <span>Compare</span>
            </Link>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

