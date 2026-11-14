import React from 'react';
import { getTeamBranding } from '../../lib/data/teams';
import { TeamLogo } from './TeamLogo';

export interface TeamBadgeProps {
  teamName: string;
  className?: string;
  showLogo?: boolean;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  teamName,
  className = '',
  showLogo = true,
}) => {
  const branding = getTeamBranding(teamName);

  if (!branding) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
        {teamName}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border shadow-2xs ${className}`}
      style={{
        backgroundColor: `${branding.primary_color}10`,
        borderColor: `${branding.primary_color}35`,
        color: '#14213D',
      }}
    >
      {showLogo && <TeamLogo teamName={teamName} size="sm" />}
      <span>{branding.short_name}</span>
    </span>
  );
};

