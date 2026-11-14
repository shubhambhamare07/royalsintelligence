import React, { useState } from 'react';
import { getPlayerImageUrl } from '../../lib/data/playerImages';

export interface PlayerPortraitProps {
  playerId?: string | number;
  playerName?: string;
  imageSrc?: string;
  className?: string;
  alt?: string;
}

export const PlayerPortrait: React.FC<PlayerPortraitProps> = ({
  playerId,
  imageSrc,
  playerName = '',
  className = '',
  alt = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const effectiveSrc = imageSrc || getPlayerImageUrl(playerId);

  if (effectiveSrc && !imageError) {
    return (
      <div className={`relative w-full h-full flex items-end justify-center overflow-hidden ${className}`}>
        <img
          src={effectiveSrc}
          alt={alt || playerName}
          className="max-h-full max-w-full object-contain object-bottom select-none transition-opacity duration-150"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Clean fallback initials avatar preserving exact container dimensions
  const initials = playerName
    ? playerName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'RR';

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-slate-100/60 text-slate-400 font-bold text-xs select-none rounded ${className}`}
      aria-label={`Photo placeholder for ${playerName}`}
    >
      <span className="tracking-wider">{initials}</span>
    </div>
  );
};
