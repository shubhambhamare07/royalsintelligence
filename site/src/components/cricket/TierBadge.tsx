import React from 'react';
import { PlayerTier } from '../../lib/data/types';
import { getTierBadgeClass } from '../../lib/format/labels';

export interface TierBadgeProps {
  tier: PlayerTier | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'md',
  className = '',
}) => {
  const badgeClass = getTierBadgeClass(tier);
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span className={`inline-flex items-center font-bold rounded-full border tracking-wide uppercase ${sizeClass} ${badgeClass} ${className}`}>
      {tier}
    </span>
  );
};

