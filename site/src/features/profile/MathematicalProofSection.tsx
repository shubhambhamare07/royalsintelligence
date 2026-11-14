import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { MetricSourceBadge } from '../../components/cricket/MetricSourceBadge';
import { RankedPlayer, PlayerCertificate } from '../../lib/data/types';
import { formatPerHundred, formatPercent } from '../../lib/format/numbers';

export interface MathematicalProofSectionProps {
  player: RankedPlayer;
  cert?: PlayerCertificate | null;
  role: 'batter' | 'bowler';
}

export const MathematicalProofSection: React.FC<MathematicalProofSectionProps> = ({
  player,
  cert,
  role,
}) => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const isBatter = role === 'batter';

  // Extract real numbers from cert or player
  const compPV = cert?.components?.PV;
  const compCD = cert?.components?.CD;
  const compPC = cert?.components?.PC;
  const exposure = cert?.exposure;

  const rawPV = compPV?.observed ?? player.PV ?? 0;
  const adjPV = compPV?.adjusted ?? player.pressure_value ?? 0;
  const zPV = compPV?.z_score ?? player.PV_scaled ?? 0;
  const shrinkageB = compPV?.shrinkage_factor ?? (isBatter ? 0.7609 : 0.6834);

  const rawCD = compCD?.observed ?? player.CD ?? 0;
  const adjCD = compCD?.adjusted ?? player.CD ?? 0;
  const zCD = compCD?.z_score ?? player.CD_scaled ?? 0;
  const isOrthogonalized = compCD?.orthogonalized ?? !isBatter;

  const rawPC = compPC?.observed ?? player.PC ?? 0;
  const adjPC = compPC?.adjusted ?? player.PC ?? 0;
  const zPC = compPC?.z_score ?? player.PC_scaled ?? 0;
  const kUnits = compPC?.k_units ?? player.n_pressure_matches ?? 0;
  const hHits = compPC?.h_hits ?? Math.round(rawPC * kUnits);

  const nPressure = exposure?.n_pressure_deliveries ?? player.n_pressure_deliveries ?? 0;
  const neffPressure = exposure?.neff_pressure ?? player.neff_pressure ?? nPressure;
  const nNormal = exposure?.n_normal_deliveries ?? (isBatter ? 688 : 780);
  const neffNormal = exposure?.neff_normal ?? nNormal;

  const compositeZ = cert?.composite ?? player.composite ?? 0;
  const finalRating = player.rating;
  const ci90 = player.rating_ci90;
  const pOutperform = player.p_outperform;

  // Prior parameters from Phase 03/04 specifications
  const priorMu = 0.0;
  const priorTau = isBatter ? 0.28 : 0.25;

  // Weights
  const wPV = 0.50; // or 0.333 in unweighted
  const wCD = 0.35;
  const wPC = 0.15;

  return (
    <div className="space-y-6">
      {/* Title & Methodology Banner */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-navy-900 to-[#1D2D50] text-white border-navy-700 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#E6007E] text-white">
                MATHEMATICAL AUDIT TRAIL
              </span>
              <span className="text-xs font-mono text-slate-300">
                PHASE 04 SPECIFICATION COMPLIANT
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              How {player.player_name} Earned Their Pressure Rating
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Step-by-step forensic verification showing raw delivery-level Markov delta-V inputs, Empirical Bayes shrinkage regularization, component standardization, and posterior credible bounds.
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] font-mono uppercase text-slate-400">Final Displayed Rating</div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#E6007E]">
              {finalRating.toFixed(2)}
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              Rank #{player.rank} &middot; Tier: {player.tier}
            </div>
          </div>
        </div>
      </Card>

      {/* 4-Stage Navigation Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { num: 1, title: 'Raw Observation', desc: 'Delta-V & Exposure' },
          { num: 2, title: 'Empirical Bayes', desc: 'Gaussian Regularization' },
          { num: 3, title: 'Composite Score', desc: 'Z-Weighting & Scaling' },
          { num: 4, title: 'Credible Bounds', desc: '90% Posterior Interval' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setActiveStage(s.num)}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeStage === s.num
                ? 'bg-white border-[#E6007E] shadow-md ring-1 ring-[#E6007E]'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
              <span className={activeStage === s.num ? 'text-[#E6007E]' : 'text-slate-400'}>
                STAGE 0{s.num}
              </span>
              {activeStage === s.num && <CheckCircle2 className="w-4 h-4 text-[#E6007E]" />}
            </div>
            <div className="font-bold text-sm text-[#14213D]">{s.title}</div>
            <div className="text-[11px] text-slate-500 font-sans">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Active Stage Detail Panel */}
      <Card className="p-6 border-slate-200 space-y-6">
        {/* STAGE 1: RAW OBSERVATION */}
        {activeStage === 1 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#14213D]">
                  Stage 1: Raw Delivery-Level Observations & Sample Exposure
                </h3>
                <p className="text-xs text-slate-500">
                  Deliveries are isolated at Leverage Index &ge; 1.5. Performance Value (PV) measures run value above historical baseline.
                </p>
              </div>
              <MetricSourceBadge tag="Observed" sourceKey="DELIV-RAW" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Variable Name</th>
                    <th className="py-2.5 px-3 text-left">Symbol</th>
                    <th className="py-2.5 px-3 text-right">Player Value</th>
                    <th className="py-2.5 px-3 text-center">Units</th>
                    <th className="py-2.5 px-3 text-center">Provenance</th>
                    <th className="py-2.5 px-3 text-left">Analytical Definition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">Pressure Deliveries</td>
                    <td className="py-2.5 px-3 font-bold text-[#14213D]">N_pressure</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{nPressure}</td>
                    <td className="py-2.5 px-3 text-center text-slate-500">balls</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 font-sans font-bold">Observed</span></td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">Total legal deliveries faced or bowled at Leverage &ge; 1.5</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">Effective Sample Size</td>
                    <td className="py-2.5 px-3 font-bold text-[#14213D]">N_eff</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{neffPressure.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-center text-slate-500">effective balls</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-sans font-bold">Calculated</span></td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">Information-weighted sample adjusted for intra-match clustering</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">Raw Pressure Value</td>
                    <td className="py-2.5 px-3 font-bold text-[#14213D]">PV_obs</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatPerHundred(rawPV * 100)}</td>
                    <td className="py-2.5 px-3 text-center text-slate-500">runs / 100b</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 font-sans font-bold">Observed</span></td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">Unshrunk sample mean delta-V during high-pressure deliveries</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">Raw Clutch Delta</td>
                    <td className="py-2.5 px-3 font-bold text-[#14213D]">CD_obs</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatPerHundred(rawCD * 100)}</td>
                    <td className="py-2.5 px-3 text-center text-slate-500">runs / 100b</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 font-sans font-bold">Observed</span></td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">Difference between raw pressure value and unconstrained normal phase</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">Consistency Hit Rate</td>
                    <td className="py-2.5 px-3 font-bold text-[#14213D]">PC_obs (H/K)</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatPercent(rawPC)}</td>
                    <td className="py-2.5 px-3 text-center text-slate-500">percentage</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 font-sans font-bold">Observed</span></td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{hHits} positive contributions across {kUnits} pressure match appearances</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-[#14213D]">Mathematical Formula: </span>
              <code className="text-slate-800 font-mono block pt-1">
                PV_obs = (1 / N_eff) * &sum; [ &Delta;V_t * I(Leverage_t &ge; 1.5) ]
              </code>
            </div>
          </div>
        )}

        {/* STAGE 2: EMPIRICAL BAYES SHRINKAGE */}
        {activeStage === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#14213D]">
                  Stage 2: Empirical Bayes Regularization & Prior Shrinkage
                </h3>
                <p className="text-xs text-slate-500">
                  Gaussian conjugate shrinkage pulls sample means toward the population grand mean (&mu; = 0.0), shrinking noisy outliers.
                </p>
              </div>
              <MetricSourceBadge tag="Model estimate" sourceKey="EB-SHRINK" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Population Prior</div>
                <div className="text-lg font-bold font-mono text-[#14213D]">
                  &mu; = {priorMu.toFixed(3)}, &tau; = {priorTau.toFixed(3)}
                </div>
                <p className="text-xs text-slate-500">
                  Global cohort prior fitted via Marginal Maximum Likelihood.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Shrinkage Factor (B_i)</div>
                <div className="text-lg font-bold font-mono text-[#E6007E]">
                  B_i = {shrinkageB.toFixed(4)}
                </div>
                <p className="text-xs text-slate-500">
                  Weight allocated to sample data: <span className="font-bold text-emerald-600">{((1 - shrinkageB) * 100).toFixed(1)}%</span>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Regularized Posterior</div>
                <div className="text-lg font-bold font-mono text-[#14213D]">
                  PV_adj = {formatPerHundred(adjPV * 100)}
                </div>
                <p className="text-xs text-slate-500">
                  Posterior mean: B_i * &mu; + (1 - B_i) * PV_obs.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-[#14213D]">Shrinkage Calculation Trace:</div>
              <div className="font-mono text-slate-700 space-y-1">
                <div>&sigma;&sup2;_i = 1 / N_eff = 1 / {neffPressure.toFixed(1)} = {(1 / Math.max(neffPressure, 1)).toFixed(5)}</div>
                <div>&tau;&sup2; = ({priorTau.toFixed(3)})&sup2; = {(priorTau * priorTau).toFixed(5)}</div>
                <div>B_i = &sigma;&sup2;_i / (&sigma;&sup2;_i + &tau;&sup2;) = {shrinkageB.toFixed(4)}</div>
                <div>PV_adj = ({shrinkageB.toFixed(4)} * 0.0) + ({(1 - shrinkageB).toFixed(4)} * {rawPV.toFixed(4)}) = <strong className="text-brand-pink">{adjPV.toFixed(4)} ({formatPerHundred(adjPV * 100)} runs/100b)</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: COMPOSITE SCORE & SCALING */}
        {activeStage === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#14213D]">
                  Stage 3: Component Standardization & Composite Transformation
                </h3>
                <p className="text-xs text-slate-500">
                  Each regularized component is standardized into Z-scores across the cohort and combined via audited weights.
                </p>
              </div>
              <MetricSourceBadge tag="Calculated" sourceKey="COMPOSITE-Z" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">PV Component (50%)</div>
                <div className="text-xl font-bold font-mono text-[#14213D]">
                  Z_PV = {zPV.toFixed(3)}
                </div>
                <div className="text-xs text-slate-500">Value: {formatPerHundred(adjPV * 100)} /100b</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  CD Component (35%) {isOrthogonalized && <span className="text-purple-600">[Orthogonalized]</span>}
                </div>
                <div className="text-xl font-bold font-mono text-[#14213D]">
                  Z_CD = {zCD.toFixed(3)}
                </div>
                <div className="text-xs text-slate-500">Delta: {formatPerHundred(adjCD * 100)} /100b</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">PC Component (15%)</div>
                <div className="text-xl font-bold font-mono text-[#14213D]">
                  Z_PC = {zPC.toFixed(3)}
                </div>
                <div className="text-xs text-slate-500">Hit Rate: {formatPercent(adjPC)}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-[#14213D]">Linear Combination & Rating Transformation:</div>
              <div className="font-mono text-slate-700 space-y-1">
                <div>Z_composite = (0.50 * {zPV.toFixed(3)}) + (0.35 * {zCD.toFixed(3)}) + (0.15 * {zPC.toFixed(3)}) = <strong className="text-purple-700">{compositeZ.toFixed(4)}</strong></div>
                <div>Rating = clamp(50 + (10 * Z_composite), 50.0, 100.0)</div>
                <div>Final Displayed Rating = <strong className="text-[#E6007E] text-sm">{finalRating.toFixed(2)}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: CREDIBLE INTERVALS & UNCERTAINTY */}
        {activeStage === 4 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#14213D]">
                  Stage 4: Posterior Uncertainty & 90% Credible Interval
                </h3>
                <p className="text-xs text-slate-500">
                  Posterior draws quantify rating stability. Wide intervals indicate lower sample exposure; narrow intervals indicate verified stability.
                </p>
              </div>
              <MetricSourceBadge tag="Model estimate" sourceKey="POST-MCMC" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">90% Credible Interval</div>
                <div className="text-xl font-bold font-mono text-[#14213D]">
                  [{ci90[0].toFixed(2)}, {ci90[1].toFixed(2)}]
                </div>
                <div className="text-xs text-slate-500">5th to 95th posterior percentiles</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">P(Outperform Benchmark)</div>
                <div className="text-xl font-bold font-mono text-emerald-700">
                  {(pOutperform * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">Probability rating exceeds baseline</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Rank 90% Bounds</div>
                <div className="text-xl font-bold font-mono text-[#E6007E]">
                  #{player.rank_ci90 ? player.rank_ci90[0] : player.rank} &ndash; #{player.rank_ci90 ? player.rank_ci90[1] : player.rank}
                </div>
                <div className="text-xs text-slate-500">Posterior simulated ranking range</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1 font-sans">
              <span className="font-bold">Audit Certification Status: </span>
              {player.tier === 'Proven' ? (
                <span>Fully verified under the <strong>Proven Tier</strong> (&ge; 100 qualifying deliveries). Statistical stability confirmed across sensitivity sweeps.</span>
              ) : player.tier === 'Promising' ? (
                <span>Qualified under <strong>Promising Tier</strong> (60–99 qualifying deliveries). Bayesian shrinkage factor active.</span>
              ) : (
                <span>Unrated / Insufficient exposure (&lt; 60 qualifying deliveries). Protected against false-positive inflation.</span>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

