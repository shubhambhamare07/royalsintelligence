/**
 * site/src/lib/simulator/controller.ts
 *
 * Simulation Controller managing Web Worker lifecycle, progress, and cancellation.
 */

import { MatchSimulatorEngine, SimulatorParams, SimulationResults } from './engine';

export interface SimulationConfig {
  battingXi: (number | string)[];
  bowlingSquad: (number | string)[];
  target?: number | null;
  nSims?: number;
  seed?: number;
  includeLowEvidence?: boolean;
}

export class SimulationController {
  private worker: Worker | null = null;
  private isCancelled = false;

  constructor(private params: SimulatorParams) {}

  public runSimulation(
    config: SimulationConfig,
    onProgress?: (progressPercent: number, simulated: number, total: number) => void
  ): Promise<SimulationResults> {
    this.isCancelled = false;

    // Check if Web Worker is available in browser environment
    const hasWorker =
      typeof window !== 'undefined' && typeof Worker !== 'undefined';

    if (hasWorker) {
      return new Promise<SimulationResults>((resolve, reject) => {
        try {
          // Terminate previous worker if active
          this.cancel();
          this.isCancelled = false;

          this.worker = new Worker(new URL('./worker.ts', import.meta.url), {
            type: 'module',
          });

          this.worker.onmessage = (e) => {
            if (this.isCancelled) return;
            const msg = e.data;
            if (msg.type === 'progress') {
              if (onProgress) {
                onProgress(msg.progress, msg.simulated, msg.total);
              }
            } else if (msg.type === 'complete') {
              this.worker?.terminate();
              this.worker = null;
              resolve(msg.results);
            } else if (msg.type === 'error') {
              this.worker?.terminate();
              this.worker = null;
              reject(new Error(msg.error));
            }
          };

          this.worker.onerror = (err) => {
            this.worker?.terminate();
            this.worker = null;
            // If worker fails to instantiate (e.g. cross-origin/blob), fall back to inline
            this.runInline(config, onProgress).then(resolve).catch(reject);
          };

          this.worker.postMessage({
            action: 'simulate',
            params: this.params,
            battingXi: config.battingXi,
            bowlingSquad: config.bowlingSquad,
            target: config.target ?? null,
            nSims: config.nSims ?? 2000,
            seed: config.seed ?? 42,
            includeLowEvidence: config.includeLowEvidence ?? false,
          });
        } catch (err) {
          // Fallback to inline
          this.runInline(config, onProgress).then(resolve).catch(reject);
        }
      });
    }

    // Node / Vitest fallback
    return this.runInline(config, onProgress);
  }

  private runInline(
    config: SimulationConfig,
    onProgress?: (progressPercent: number, simulated: number, total: number) => void
  ): Promise<SimulationResults> {
    return new Promise<SimulationResults>((resolve) => {
      const engine = new MatchSimulatorEngine(this.params);
      const results = engine.simulateMonteCarlo(
        config.battingXi,
        config.bowlingSquad,
        config.target ?? null,
        config.nSims ?? 2000,
        config.seed ?? 42,
        config.includeLowEvidence ?? false,
        (sim, tot) => {
          if (onProgress && !this.isCancelled) {
            onProgress(Math.round((sim / tot) * 100), sim, tot);
          }
        }
      );
      resolve(results);
    });
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

