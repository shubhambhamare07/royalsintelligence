export function formatRating(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return val.toFixed(2);
}

export function formatInterval(interval: [number, number] | null | undefined): string {
  if (!interval || interval.length < 2) return '—';
  return `[${interval[0].toFixed(2)}, ${interval[1].toFixed(2)}]`;
}

export function formatZScore(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}`;
}

export function formatPercent(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  // If val is 0-1 probability, scale to 0-100
  const pct = val <= 1.0 && val >= 0 ? val * 100 : val;
  return `${pct.toFixed(decimals)}%`;
}

export function formatCount(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN').format(Math.round(val));
}

export function formatPerHundred(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}`;
}

