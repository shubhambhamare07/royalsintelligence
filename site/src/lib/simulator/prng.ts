/**
 * site/src/lib/simulator/prng.ts
 *
 * Deterministic Seeded Pseudo-Random Number Generator and Distribution Samplers.
 * Uses Mulberry32 with SplitMix32 seed initialization to provide reproducible random streams.
 * Includes Gamma distribution sampling via Marsaglia-Tsang algorithm.
 */

export class SeededPRNG {
  private state: number;

  constructor(seed: number = 42) {
    this.state = this.splitMix32(seed);
  }

  private splitMix32(a: number): number {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return (t ^ (t >>> 15)) >>> 0;
  }

  /**
   * Returns a pseudo-random float in [0, 1)
   */
  public random(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Sample standard normal distribution N(0, 1) using Box-Muller transform
   */
  public normal(): number {
    let u1 = this.random();
    let u2 = this.random();
    while (u1 <= 1e-15) {
      u1 = this.random();
    }
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }

  /**
   * Sample Gamma(shape=alpha, scale=1/beta) using Marsaglia and Tsang method
   */
  public gamma(alpha: number, beta: number = 1.0): number {
    if (alpha <= 0) return 1.0 / beta;

    if (alpha < 1.0) {
      // Weibull / Ahrens-Dieter boost for alpha < 1
      const u = this.random();
      return (this.gamma(alpha + 1.0, beta) * Math.pow(u, 1.0 / alpha));
    }

    const d = alpha - 1.0 / 3.0;
    const c = 1.0 / Math.sqrt(9.0 * d);

    while (true) {
      let z: number;
      let v: number;

      do {
        z = this.normal();
        v = 1.0 + c * z;
      } while (v <= 0);

      v = v * v * v;
      const u = this.random();

      if (u < 1.0 - 0.0331 * z * z * z * z) {
        return (d * v) / beta;
      }

      if (Math.log(u) < 0.5 * z * z + d * (1.0 - v + Math.log(v))) {
        return (d * v) / beta;
      }
    }
  }

  /**
   * Weighted choice returning index 0..weights.length - 1
   */
  public choice(weights: number[] | Float64Array): number {
    const r = this.random();
    let cumulative = 0.0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (r < cumulative) {
        return i;
      }
    }
    return weights.length - 1;
  }
}

