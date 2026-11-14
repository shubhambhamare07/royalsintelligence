/**
 * Central authoritative player photograph registry
 * Maps canonical player IDs to verified local player photographs from ASSETS/TOP 10
 */

export const TOP_PLAYER_IMAGES: Record<number, string> = {
  // Top 10 Batters
  6931: '/assets/players/top10/pathum-nissanka.webp',
  4260: '/assets/players/top10/heinrich-klaasen.webp',
  1318: '/assets/players/top10/andre-russell.webp',
  2756: '/assets/players/top10/shashank-singh.webp',
  143: '/assets/players/top10/dinesh-karthik.png',
  3672: '/assets/players/top10/kusal-mendis.png',
  3916: '/assets/players/top10/jitesh-sharma.webp',
  4722: '/assets/players/top10/rashid-khan.webp',
  1699: '/assets/players/top10/suryakumar-yadav.webp',
  4106: '/assets/players/top10/daryl-mitchell.png',

  // Top 10 Bowlers
  8661: '/assets/players/top10/matheesha-pathirana.webp',
  4219: '/assets/players/top10/krunal-pandya.webp',
  781: '/assets/players/top10/sunil-narine.webp',
  830: '/assets/players/top10/josh-hazlewood.webp',
  2876: '/assets/players/top10/axar-patel.webp',
  3644: '/assets/players/top10/kuldeep-yadav.webp',
  360: '/assets/players/top10/bhuvneshwar-kumar.webp',
  1758: '/assets/players/top10/pat-cummins.webp',
  7920: '/assets/players/top10/nathan-ellis.png',
  7327: '/assets/players/top10/rasikh-salam.webp',
};

/**
 * Returns the verified photograph URL for a given canonical player ID, or null if none exists.
 */
export function getPlayerImageUrl(playerId: number | string | undefined | null): string | null {
  if (!playerId) return null;
  const idNum = typeof playerId === 'number' ? playerId : parseInt(String(playerId), 10);
  if (isNaN(idNum)) return null;
  return TOP_PLAYER_IMAGES[idNum] || null;
}

