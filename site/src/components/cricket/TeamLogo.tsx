import React from 'react';
import { getTeamBranding } from '../../lib/data/teams';

export interface TeamLogoProps {
  teamName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  teamName,
  size = 'md',
  className = '',
}) => {
  const branding = getTeamBranding(teamName);

  const dimensions = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  if (!branding) {
    return (
      <div className={`rounded-md bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] font-mono ${dimensions[size]} ${className}`}>
        {teamName.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={branding.logo_path}
      alt={branding.team_name}
      className={`object-contain shrink-0 ${dimensions[size]} ${className}`}
      title={branding.team_name}
    />
  );
};

