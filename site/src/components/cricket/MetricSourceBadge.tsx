import React from 'react';
import { ProvenanceTag } from '../../lib/data/types';
import { PROVENANCE_METAS } from '../../lib/format/labels';
import { Tooltip } from '../ui/Tooltip';

export interface MetricSourceBadgeProps {
  tag: ProvenanceTag;
  sourceKey?: string;
  className?: string;
}

export const MetricSourceBadge: React.FC<MetricSourceBadgeProps> = ({
  tag,
  sourceKey,
  className = '',
}) => {
  const meta = PROVENANCE_METAS[tag] || PROVENANCE_METAS['Calculated'];

  return (
    <Tooltip content={meta.description} sourceKey={sourceKey}>
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border cursor-help ${meta.badgeClass} ${className}`}
      >
        {tag}
      </span>
    </Tooltip>
  );
};

