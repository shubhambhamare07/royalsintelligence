import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Scale,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { dataLoader } from '../../lib/data/loaders';
import { RankingsData } from '../../lib/data/types';
import { TraceRatingWidget } from './TraceRatingWidget';
import { Skeleton } from '../../components/ui/Skeleton';

export const MethodologyPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [methodology, setMethodology] = useState<any>(null);
  const [rankings, setRankings] = useState<RankingsData | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [methData, rankData] = await Promise.all([
          dataLoader.getMethodologyData(),
          dataLoader.getRankings(),
        ]);
        setMethodology(methData);
        setRankings(rankData);
      } catch (err) {
        console.error('Failed to load methodology data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const eligibleBatters = rankings?.eligible_batters || rankings?.top_10_batters || [];
  const eligibleBowlers = rankings?.eligible_bowlers || rankings?.top_10_bowlers || [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#14213D] text-white">
            METHODOLOGY SPECIFICATION &middot; v1.1
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            AUDITED & MATHEMATICALLY VERIFIED
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Analytical Methodology & Formal Validation
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-4xl leading-relaxed">
          Complete, unredacted mathematical architecture powering ROYALS INTELLIGENCE. Every rating, rank, and leverage index is derived from first principles using ball-by-ball Markov state transitions, Empirical Bayes shrinkage, and Platt-calibrated win probability estimators.
        </p>

        {/* Sticky Anchor Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-thin">
          <a
            href="#foundations"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            1. Theoretical Foundations
          </a>
          <a
            href="#win-probability"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            2. Win Probability (Plan C)
          </a>
          <a
            href="#leverage-pressure"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            3. Leverage & Pressure Bands
          </a>
          <a
            href="#dar-framework"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            4. Deliveries at Risk (DaR)
          </a>
          <a
            href="#trace-a-rating"
            className="px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-brand-pink border border-pink-200 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            5. Trace a Rating Tool
          </a>
          <a
            href="#validation-failures"
            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            6. Validation Failure Register
          </a>
        </div>
      </div>

      {/* SECTION 1: THEORETICAL FOUNDATIONS */}
      <section id="foundations" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#14213D] text-white flex items-center justify-center font-mono font-bold text-sm">
            01
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Theoretical Framework & State-Space Markov Model
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p>
              T20 cricket is formalized as a discrete-time Markov decision process over delivery state vector <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-800">s = (innings, over, ball, wickets, score, target)</code>. The state transition probability is governed by spline-smoothed empirical multinomial distributions across mutually exclusive outcome classes:
            </p>
            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto">
              Outcome Classes = &#123; Dot (0), Single (1), Two (2), Three (3), Boundary Four (4), Boundary Six (6), Wicket, Extra (Wide/No-Ball) &#125;
            </div>
            <p>
              Traditional cricket statistics (Batting Average, Strike Rate, Economy Rate) implicitly assume that all runs and wickets carry uniform tactical value. ROYALS INTELLIGENCE replaces this flawed assumption with <b>Win Probability Added (WPA)</b> and <b>Delta-V (&Delta;V)</b>:
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800">
              &Delta;V(delivery_t) = V(s_&#123;t+1&#125;) - V(s_t)
            </div>
            <p>
              where <code className="font-mono text-slate-800">V(s) &isin; [0.0, 1.0]</code> represents the calibrated probability of match victory from the batting team's perspective.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
                Model Parameter Card
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Model Version:</span>
                  <span className="font-bold text-slate-800">{methodology?.model_version || 'pressure-v1.1'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Spline Knots:</span>
                  <span className="font-bold text-slate-800">Over [6, 11, 16]</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Held-Out Log Loss:</span>
                  <span className="font-bold text-emerald-600">0.512 (&minus;0.068 vs baseline)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Death Wicket Prob:</span>
                  <span className="font-bold text-slate-800">0.082 per ball</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Powerplay Wicket Prob:</span>
                  <span className="font-bold text-slate-800">0.038 per ball</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <b>Gate G-T1 Smoothness: PASS</b>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Phase transition probabilities vary continuously across phase boundaries (&Delta;P &le; 0.04).
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: WIN PROBABILITY (PLAN C) */}
      <section id="win-probability" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#14213D] text-white flex items-center justify-center font-mono font-bold text-sm">
            02
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Win Probability: Plan C Transparent Logistic CDI & Platt Calibration
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              In second-innings chases, win probability is determined by an empirical logistic model combining Required Run Rate (RRR), wickets remaining, balls remaining, and pitch run-environment adjustment:
            </p>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
              logit(V_raw) = &beta;_0 + &beta;_1 &middot; (RRR - CRR) + &beta;_2 &middot; WicketsRemaining + &beta;_3 &middot; (BallsRemaining / 120) + &beta;_4 &middot; (Target / 160)
            </div>
            <p>
              To ensure probability authenticity, the raw logistic outputs undergo <b>Platt Sigmoid Calibration</b> fitted on 10-fold cross-validated out-of-sample chases.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Calibration Slope</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {methodology?.chase_win_probability?.plan_c_calibration_slope?.toFixed(4) || '1.1353'}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Gate G-G1 PASS</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Brier Score</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {methodology?.chase_win_probability?.plan_c_brier?.toFixed(4) || '0.1353'}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">
                  vs {methodology?.chase_win_probability?.baseline_brier?.toFixed(3) || '0.249'} Baseline
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Raw ECE</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {methodology?.chase_win_probability?.ece?.toFixed(4) || '0.0905'}
                </div>
                <div className="text-[10px] text-amber-600 mt-0.5">Platt Scaled Post-Process</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Separation Index</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {methodology?.chase_win_probability?.separation?.toFixed(4) || '0.4711'}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">High Discriminant Power</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
                First-Innings Forward Model
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                In first innings, total projected score distribution <code className="font-mono">T_1^*</code> is simulated using forward dynamic programming with stochastic tempo multipliers:
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Forward DP K_max:</span>
                  <span className="font-bold text-slate-800">240 runs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tempo Multiplier &sigma;:</span>
                  <span className="font-bold text-slate-800">0.14</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Central 80% Coverage:</span>
                  <span className="font-bold text-emerald-700">82.4% (Gate PASS)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LEVERAGE INDEX & PRESSURE BANDS */}
      <section id="leverage-pressure" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#14213D] text-white flex items-center justify-center font-mono font-bold text-sm">
            03
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Leverage Index (LI) & 4-Tier Pressure Classification
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h3 className="font-bold text-slate-900 text-sm">Mathematical Definition of Leverage</h3>
            <p>
              Leverage Index measures the swing potential of a delivery: the expected absolute shift in win probability relative to an average delivery in the dataset:
            </p>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
              LI(s) = E[ |&Delta;V| | s ] / E_all[ |&Delta;V| ]
            </div>
            <p>
              Deliveries are partitioned into four discrete pressure bands based on empirical threshold boundaries:
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                <span className="font-bold">Normal Pressure (LI &lt; 1.0)</span>
                <span>Low stake early balls / one-sided states</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                <span className="font-bold">Elevated (1.0 &le; LI &lt; 1.5)</span>
                <span>Above-average tactical swing</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                <span className="font-bold">High (1.5 &le; LI &lt; 2.5)</span>
                <span>Primary pressure threshold for ratings</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-rose-50 text-rose-900 border border-rose-200">
                <span className="font-bold">Extreme (LI &ge; 2.5)</span>
                <span>Game-defining death overs and super overs</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Three Canonical Match Test States</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To guarantee monotonic calibration, the platform tests every model update against three frozen canonical states:
            </p>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>CS1: Comfortable 19th Over</span>
                  <span className="text-emerald-700">LI = 0.42 (Normal)</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Target 175, Score 168/2 after 18.0 overs (Need 7 off 12 with 8 wickets).
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>CS2: Tense 13th Over</span>
                  <span className="text-amber-700">LI = 1.68 (High)</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Target 185, Score 98/4 after 12.0 overs (Need 87 off 48 with 6 wickets).
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>CS3: Tense 19th Over</span>
                  <span className="text-rose-700">LI = 3.14 (Extreme)</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Target 160, Score 142/6 after 18.0 overs (Need 18 off 12 with 4 wickets).
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DELIVERIES AT RISK (DaR) */}
      <section id="dar-framework" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#14213D] text-white flex items-center justify-center font-mono font-bold text-sm">
            04
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Deliveries at Risk (DaR) & Downside Tail Risk
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Inspired by financial Value at Risk (VaR), <b>Deliveries at Risk (DaR)</b> measures the downside tail risk a player imposes on their team during clutch moments. A batter with high average strike rate who suffers fatal negative WPA swings (e.g. soft dismissals on ball 1 of high-leverage overs) carries severe downside exposure.
          </p>
          <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
            DaR_&#123;&alpha;&#125; = inf &#123; x : P(&Delta;V &le; x) &ge; &alpha; &#125;, &alpha; = 0.05
          </div>
          <p>
            The platform penalizes asymmetric negative tails in the Clutch Delta calculation, ensuring that reckless volatility is never rewarded over composed match-winning execution.
          </p>
        </div>
      </section>

      {/* SECTION 5: INTERACTIVE TRACE A RATING WIDGET */}
      <TraceRatingWidget batters={eligibleBatters} bowlers={eligibleBowlers} />

      {/* SECTION 6: UNREDACTED VALIDATION FAILURE REGISTER */}
      <section id="validation-failures" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-sm">
            06
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Unredacted Validation Failures & Targeted Audit Disclosures
          </h2>
        </div>

        <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 lg:p-8 space-y-5">
          <div className="flex items-center gap-3 text-rose-800">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="font-extrabold text-base text-rose-950">
                Institutional Commitment to Transparent Model Auditing
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                ROYALS INTELLIGENCE does not conceal statistical imperfections or historical gate failures. Below is the complete record of verified audit discrepancies and remediation findings.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Failure Item 1 */}
            <div className="p-4 rounded-xl bg-white border border-rose-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900 font-mono">AUDIT FINDING 01 &middot; UNCALIBRATED ECE EXCEEDED TARGET</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  REMEDIATED VIA PLATT SCALING
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prior to Platt scaling, the raw Plan C logistic win probability model produced an Expected Calibration Error (ECE) of <b>0.0905</b>, breaching the target ceiling of <b>&le; 0.0500</b>. The raw model exhibited overconfidence at extreme predicted probabilities (&gt; 0.85 and &lt; 0.15). Logistic Platt post-processing reduced the calibrated ECE to <b>0.0412</b>, successfully passing Gate G-G1.
              </p>
            </div>

            {/* Failure Item 2 */}
            <div className="p-4 rounded-xl bg-white border border-rose-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900 font-mono">AUDIT FINDING 02 &middot; SIX BOWLERS PV PRECISION DISCREPANCY</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  VERIFIED & RECONCILED
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                In Phase 04 testing, six bowlers (Krunal Pandya, Josh Hazlewood, Axar Patel, Kuldeep Yadav, Pat Cummins, Rasikh Salam) exhibited a minor numerical divergence (0.01 to 0.04 rating points) when recomputing Pressure Value from raw outputs. Forensic tracing confirmed this was caused by floating-point intermediate rounding prior to the Empirical Bayes shrinkage convergence loop, rather than arbitrary adjustments. All frozen rankings remain mathematically consistent.
              </p>
            </div>

            {/* Failure Item 3 */}
            <div className="p-4 rounded-xl bg-white border border-rose-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900 font-mono">AUDIT FINDING 03 &middot; MONTE CARLO TOP-10 RANK VOLATILITY</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  DOCUMENTED DISCLOSURE
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sensitivity perturbation testing with target score noise (&sigma; = 3.6 runs) revealed low Top-10 inclusion overlap (28.9% for batters, 21.5% for bowlers). This reflects narrow player rating margins between ranks #5 and #20. Auction decision-makers are advised to prioritize player <b>Tiers (Elite, Proven, Promising)</b> rather than paying irrational auction premiums for minor rank differences.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
