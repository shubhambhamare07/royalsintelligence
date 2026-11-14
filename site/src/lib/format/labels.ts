import { ProvenanceTag, PlayerTier } from '../data/types';

export interface ProvenanceMeta {
  tag: ProvenanceTag;
  description: string;
  badgeClass: string;
}

export const PROVENANCE_METAS: Record<ProvenanceTag, ProvenanceMeta> = {
  'Observed': {
    tag: 'Observed',
    description: 'Directly aggregated from verified ball-by-ball match deliveries.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  'Calculated': {
    tag: 'Calculated',
    description: 'Deterministic arithmetic calculation (e.g. Strike Rate, Economy Rate, Totals).',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  'Model estimate': {
    tag: 'Model estimate',
    description: 'Derived via Empirical Bayes hierarchical shrinkage and statistical model fitting.',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  'Unavailable': {
    tag: 'Unavailable',
    description: 'Metric not captured or insufficient sample size for certification.',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
  },
};

export function getTierBadgeClass(tier: PlayerTier | string): string {
  switch (tier) {
    case 'Elite':
      return 'bg-[#14213D] text-white border-[#14213D] shadow-sm';
    case 'Proven':
      return 'bg-[#0077B6] text-white border-[#0077B6]';
    case 'Promising':
      return 'bg-[#00B4D8] text-white border-[#00B4D8]';
    case 'Developing':
      return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
    case 'Fringe':
    case 'Unproven':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

