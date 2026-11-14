/**
 * site/src/lib/simulator/worker.ts
 *
 * Web Worker for running Monte Carlo simulations off the main browser thread.
 */

import { MatchSimulatorEngine, SimulatorParams } from './engine';

export interface WorkerSimulateMessage {
  action: 'simulate';
  params: SimulatorParams;
  battingXi: (number | string)[];
  bowlingSquad: (number | string)[];
  target: number | null;
  nSims: number;
  seed: number;
  includeLowEvidence: boolean;
}

self.onmessage = (e: MessageEvent<WorkerSimulateMessage>) => {
  const data = e.data;
  if (data.action === 'simulate') {
    try {
      const engine = new MatchSimulatorEngine(data.params);
      const results = engine.simulateMonteCarlo(
        data.battingXi,
        data.bowlingSquad,
        data.target,
        data.nSims,
        data.seed,
        data.includeLowEvidence,
        (simulated, total) => {
          self.postMessage({
            type: 'progress',
            simulated,
            total,
            progress: Math.round((simulated / total) * 100),
          });
        }
      );

      self.postMessage({
        type: 'complete',
        results,
      });
    } catch (err: any) {
      self.postMessage({
        type: 'error',
        error: err.message || 'Simulation error',
      });
    }
  }
};

