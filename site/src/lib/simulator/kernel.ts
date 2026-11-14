/**
 * site/src/lib/simulator/kernel.ts
 *
 * Core Delivery-Level Probability Kernel for Match Simulation.
 * Replicates Python models/simulator/kernel.py:
 *   p(k) ∝ p0(k | balls_left, wickets, env, free_hit)
 *          × ContextMultiplier(k | need_gap, order_bucket, bowler_type)
 *          × rho_bat(k)
 *          × rho_bowl(k)
 * Normalized across 5 mutually exclusive outcome classes:
 *   {dot, non_boundary, boundary, wicket, extra}
 */

export const SIM_CLASSES = ['dot', 'non_boundary', 'boundary', 'wicket', 'extra'] as const;
export type SimClass = typeof SIM_CLASSES[number];

export function computeDeliveryProbabilities(
  baseP: number[] | Float64Array,
  ctxM: number[] | Float64Array,
  batTilt: number[] | Float64Array,
  bowlTilt: number[] | Float64Array
): number[] {
  let s = 0.0;
  const rawP = new Array(5);

  for (let i = 0; i < 5; i++) {
    const val = baseP[i] * ctxM[i] * batTilt[i] * bowlTilt[i];
    rawP[i] = val;
    s += val;
  }

  if (s <= 0 || !Number.isFinite(s)) {
    return [0.30, 0.42, 0.18, 0.05, 0.05];
  }

  const invS = 1.0 / s;
  for (let i = 0; i < 5; i++) {
    rawP[i] *= invS;
  }

  return rawP;
}

