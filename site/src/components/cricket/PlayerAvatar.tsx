import React, { useState } from 'react';
import { getPlayerImageUrl } from '../../lib/data/playerImages';

export interface PlayerAvatarProps {
  playerId: string | number;
  playerName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  teamShortName?: string;
}

const AVATAR_PALETTES = [
  { from: '#14213D', to: '#1D2D50', text: '#FFFFFF', border: '#C6A15B' },
  { from: '#004BA0', to: '#0B132B', text: '#FFFFFF', border: '#D1AB3E' },
  { from: '#3A225D', to: '#1A0B2E', text: '#FFFFFF', border: '#F7D54E' },
  { from: '#E6007E', to: '#14213D', text: '#FFFFFF', border: '#C6A15B' },
  { from: '#0077B6', to: '#023E8A', text: '#FFFFFF', border: '#90E0EF' },
  { from: '#DD1F2D', to: '#660708', text: '#FFFFFF', border: '#DDA032' },
  { from: '#0057E7', to: '#0A2540', text: '#FFFFFF', border: '#FA4D00' },
  { from: '#1B2133', to: '#0A0C13', text: '#FFFFFF', border: '#BE9B5E' },
];

function getInitials(name: string): string {
  if (!name) return 'RR';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getDeterministicPalette(id: string | number) {
  const num = typeof id === 'number' ? id : (parseInt(id, 10) || id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
  const index = Math.abs(num) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  playerId,
  playerName,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(playerName);
  const palette = getDeterministicPalette(playerId);

  const dimensions = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const verifiedSrc = getPlayerImageUrl(playerId);
  const fallbackSrc = `/assets/players/player_${playerId}.webp`;
  const primarySrc = verifiedSrc || fallbackSrc;

  if (!imageError) {
    return (
      <div className={`relative shrink-0 rounded-full overflow-hidden border border-slate-200 bg-slate-100 ${dimensions[size]} ${className}`}>
        <img
          src={primarySrc}
          alt={playerName}
          className="w-full h-full object-cover object-top"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Deterministic SVG sports avatar
  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden flex items-center justify-center font-bold tracking-wider select-none shadow-xs border ${dimensions[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
        color: palette.text,
        borderColor: palette.border,
      }}
      title={`${playerName} (ID: ${playerId})`}
    >
      <span className="relative z-10 font-mono drop-shadow-xs">{initials}</span>
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-3/4 h-2 rounded-b-full opacity-40"
        style={{ backgroundColor: palette.border }}
      />
    </div>
  );
};
