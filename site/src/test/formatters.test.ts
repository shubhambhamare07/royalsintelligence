import { describe, it, expect } from 'vitest';
import { formatRating, formatInterval, formatZScore, formatPercent, formatCount, formatPerHundred } from '../lib/format/numbers';
import { getTierBadgeClass } from '../lib/format/labels';

describe('Formatters and Precision Rules', () => {
  it('formats rating strictly to 2 decimal places with tabular lining', () => {
    expect(formatRating(95.5723)).toBe('95.57');
    expect(formatRating(90.95)).toBe('90.95');
    expect(formatRating(null)).toBe('—');
    expect(formatRating(undefined)).toBe('—');
  });

  it('formats 90% credible intervals with bracket notation', () => {
    expect(formatInterval([76.64, 100.0])).toBe('[76.64, 100.00]');
    expect(formatInterval(null)).toBe('—');
  });

  it('formats signed z-scores with explicit +/- prefix', () => {
    expect(formatZScore(1.823)).toBe('+1.82');
    expect(formatZScore(-0.452)).toBe('-0.45');
    expect(formatZScore(0)).toBe('0.00');
  });

  it('formats per-hundred metrics correctly', () => {
    expect(formatPerHundred(26.72)).toBe('+26.72');
    expect(formatPerHundred(-14.3)).toBe('-14.30');
  });

  it('formats percentages correctly', () => {
    expect(formatPercent(0.8659, 1)).toBe('86.6%');
    expect(formatPercent(86.59, 1)).toBe('86.6%');
  });

  it('formats integer counts with Indian standard grouping', () => {
    expect(formatCount(200961)).toBe('2,00,961');
    expect(formatCount(959)).toBe('959');
  });

  it('assigns correct tier badge classes', () => {
    expect(getTierBadgeClass('Elite')).toContain('bg-[#14213D]');
    expect(getTierBadgeClass('Proven')).toContain('bg-[#0077B6]');
    expect(getTierBadgeClass('Promising')).toContain('bg-[#00B4D8]');
    expect(getTierBadgeClass('Developing')).toContain('bg-[#E0F2FE]');
    expect(getTierBadgeClass('Unproven')).toContain('bg-slate-100');
  });
});

