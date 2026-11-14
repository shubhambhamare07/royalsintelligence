import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Cpu,
  FastForward,
  GitCompare,
  HelpCircle,
  Info,
  Layers,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { dataLoader } from '../../lib/data/loaders';
import { canonicalRegistry } from '../../lib/data/canonical';
import { SimulatorParams, SimulationResults } from '../../lib/simulator/engine';
import { SimulationController } from '../../lib/simulator/controller';
import { Skeleton } from '../../components/ui/Skeleton';
import { getPlayerImageUrl } from '../../lib/data/playerImages';
import { getCountryFlag, getPlayerFranchise } from '../../lib/data/playerMetadata';

// Authoritative Presets
const RR_PRESET_BATTERS = [
  '6931', // Pathum Nissanka
  '4260', // Heinrich Klaasen
  '1318', // Andre Russell
  '2756', // Shashank Singh
  '143',  // Dinesh Karthik
  '3672', // Kusal Mendis
  '3916', // Jitesh Sharma
  '4722', // Rashid Khan
  '1699', // Suryakumar Yadav
  '4106', // Daryl Mitchell
  '7920', // Nathan Ellis
];

const ELITE_PRESET_BOWLERS = [
  '8661', // Matheesha Pathirana (4)
  '4219', // Krunal Pandya (4)
  '781',  // Sunil Narine (4)
  '830',  // Josh Hazlewood (4)
  '2876', // Axar Patel (4)
];

const ATTACK_PRESET_BATTERS = [
  '1699', // Suryakumar Yadav
  '4260', // Heinrich Klaasen
  '1318', // Andre Russell
  '6931', // Pathum Nissanka
  '2756', // Shashank Singh
  '4722', // Rashid Khan
  '3672', // Kusal Mendis
  '3916', // Jitesh Sharma
  '143',  // Dinesh Karthik
  '4106', // Daryl Mitchell
  '8661', // Matheesha Pathirana
];

export const SimulatorPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<SimulatorParams | null>(null);
  const [controller, setController] = useState<SimulationController | null>(null);

  // Active Wizard Step (1 to 6, or 'whatif')
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showWhatIf, setShowWhatIf] = useState<boolean>(false);

  // Configuration State
  const [battingXi, setBattingXi] = useState<string[]>(RR_PRESET_BATTERS);
  const [bowlingSquad, setBowlingSquad] = useState<string[]>(ELITE_PRESET_BOWLERS);
  const [bowlerOvers, setBowlerOvers] = useState<Record<string, number>>({
    '8661': 4,
    '4219': 4,
    '781': 4,
    '830': 4,
    '2876': 4,
  });

  const [inningsMode, setInningsMode] = useState<'inn1' | 'chase'>('inn1');
  const [target, setTarget] = useState<number>(180);
  const [nSims, setNSims] = useState<number>(2000);
  const [seed, setSeed] = useState<number>(42);
  const [includeLowEvidence, setIncludeLowEvidence] = useState<boolean>(false);

  // Runtime State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [simulatedCount, setSimulatedCount] = useState<number>(0);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search in Step 1
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');

  // What-If Scenario State
  const [scenarioAResults, setScenarioAResults] = useState<SimulationResults | null>(null);
  const [scenarioBResults, setScenarioBResults] = useState<SimulationResults | null>(null);
  const [scenarioBXi, setScenarioBXi] = useState<string[]>(ATTACK_PRESET_BATTERS);
  const [isSimulatingB, setIsSimulatingB] = useState<boolean>(false);

  useEffect(() => {
    async function loadSimulatorData() {
      try {
        setLoading(true);
        const [simParams, rankData] = await Promise.all([
          dataLoader.getSimulatorParams(),
          dataLoader.getRankings(),
        ]);
        setParams(simParams);
        setController(new SimulationController(simParams));
      } catch (err: any) {
        console.error('Failed to load simulator parameters:', err);
        setError(err.message || 'Error loading simulator parameter tables');
      } finally {
        setLoading(false);
      }
    }
    loadSimulatorData();
  }, []);

  // Total overs allocated
  const totalOversAllocated = useMemo(() => {
    return Object.values(bowlerOvers).reduce((sum, v) => sum + (v || 0), 0);
  }, [bowlerOvers]);

  // Execute Simulation
  const handleRunSimulation = async () => {
    if (!controller || !params) return;
    try {
      setIsSimulating(true);
      setProgress(0);
      setSimulatedCount(0);
      setError(null);

      const res = await controller.runSimulation(
        {
          battingXi,
          bowlingSquad,
          target: inningsMode === 'chase' ? target : null,
          nSims,
          seed,
          includeLowEvidence,
        },
        (pct, sim) => {
          setProgress(pct);
          setSimulatedCount(sim);
        }
      );

      setResults(res);
      setScenarioAResults(res);
      setCurrentStep(6); // Automatically navigate to step 6 to view outcomes
    } catch (err: any) {
      setError(err.message || 'Simulation execution failed');
    } finally {
      setIsSimulating(false);
    }
  };

  // Run What-If Scenario B
  const handleRunWhatIfSimulation = async () => {
    if (!controller || !params) return;
    try {
      setIsSimulatingB(true);
      const res = await controller.runSimulation(
        {
          battingXi: scenarioBXi,
          bowlingSquad,
          target: inningsMode === 'chase' ? target : null,
          nSims,
          seed: seed + 1,
          includeLowEvidence,
        }
      );
      setScenarioBResults(res);
    } catch (err: any) {
      setError(err.message || 'Scenario B simulation failed');
    } finally {
      setIsSimulatingB(false);
    }
  };

  const handleCancel = () => {
    if (controller) {
      controller.cancel();
      setIsSimulating(false);
    }
  };

  // Batting Order adjustments
  const movePlayerUp = (index: number) => {
    if (index === 0) return;
    const newXi = [...battingXi];
    const temp = newXi[index - 1];
    newXi[index - 1] = newXi[index];
    newXi[index] = temp;
    setBattingXi(newXi);
  };

  const movePlayerDown = (index: number) => {
    if (index === battingXi.length - 1) return;
    const newXi = [...battingXi];
    const temp = newXi[index + 1];
    newXi[index + 1] = newXi[index];
    newXi[index] = temp;
    setBattingXi(newXi);
  };

  const removePlayerFromXi = (id: string) => {
    if (battingXi.length <= 1) return;
    setBattingXi(battingXi.filter((p) => p !== id));
  };

  const addPlayerToXi = (id: string) => {
    if (battingXi.length >= 11) return;
    if (!battingXi.includes(id)) {
      setBattingXi([...battingXi, id]);
    }
  };

  // Adjust bowler overs
  const updateBowlerOvers = (id: string, delta: number) => {
    const current = bowlerOvers[id] || 0;
    const next = Math.max(0, Math.min(4, current + delta));
    setBowlerOvers({
      ...bowlerOvers,
      [id]: next,
    });
  };

  // ECharts Option for Score Distribution
  const chartOption = useMemo(() => {
    if (!results || !results.score_distribution) return null;
    const scores = results.score_distribution.map((d) => d.score);
    const counts = results.score_distribution.map((d) => d.count);

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#14213D',
        borderColor: '#334155',
        textStyle: { color: '#F8FAFC', fontSize: 12 },
        formatter: (items: any) => {
          const item = items[0];
          if (!item) return '';
          const s = item.name;
          const c = item.value;
          const pct = ((c / results.n_sims) * 100).toFixed(2);
          return `
            <div style="font-weight: 700; color: #FFFFFF;">Score: ${s} runs</div>
            <div style="font-family: monospace; font-size: 11px; color: #E6007E; margin-top: 2px;">
              ${c} iterations (${pct}%)
            </div>
          `;
        },
      },
      grid: {
        top: 30,
        right: 25,
        bottom: 45,
        left: 45,
      },
      xAxis: {
        type: 'category',
        data: scores,
        name: 'Projected Total Runs',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { color: '#64748B', fontSize: 11, fontWeight: 600 },
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: { color: '#64748B', fontFamily: 'monospace', fontSize: 10, interval: Math.floor(scores.length / 10) },
      },
      yAxis: {
        type: 'value',
        name: 'Frequency',
        nameTextStyle: { color: '#64748B', fontSize: 11, fontWeight: 600 },
        axisLabel: { color: '#64748B', fontFamily: 'monospace' },
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      },
      series: [
        {
          name: 'Score Frequency',
          type: 'line',
          smooth: true,
          data: counts,
          lineStyle: { color: '#E6007E', width: 2.5 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(230, 0, 126, 0.35)' },
                { offset: 1, color: 'rgba(230, 0, 126, 0.02)' },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              {
                xAxis: String(results.median_score),
                lineStyle: { color: '#14213D', width: 2, type: 'dashed' },
                label: {
                  show: true,
                  formatter: `Median: ${results.median_score}`,
                  position: 'insideEndTop',
                  color: '#14213D',
                  fontWeight: 'bold',
                },
              },
            ],
          },
        },
      ],
    };
  }, [results]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb & Label Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
          <Link to="/" className="hover:text-[#E6007E] transition-colors">ROYALS INTEL</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">Simulator</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#E6007E] font-semibold">Strategy Engine</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#14213D] text-white tracking-wider uppercase">
                STRATEGY SUITE &middot; PHASE 05
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-50 text-[#E6007E] border border-pink-200 uppercase">
                INTERACTIVE 6-STEP SIMULATOR
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight flex items-center gap-2.5">
              <Sliders className="w-7 h-7 text-[#E6007E]" />
              IPL Match Strategy Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Step-by-step interactive strategy simulator: build your Playing XI, configure batting order, assign bowling overs, specify match conditions, and run Monte Carlo simulations in a dedicated Web Worker.
            </p>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              onClick={() => setShowWhatIf(!showWhatIf)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                showWhatIf
                  ? 'bg-[#E6007E] text-white border-[#E6007E] shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#E6007E]'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>What If You Change Your XI?</span>
            </button>
            <Link
              to="/simulator/golden"
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#E6007E] hover:border-[#E6007E] transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Golden Parity</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6-STEP WIZARD PROGRESS BAR */}
      {!showWhatIf && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { step: 1, title: 'Step 1', subtitle: 'Build Playing XI', icon: Users, count: `${battingXi.length}/11` },
            { step: 2, title: 'Step 2', subtitle: 'Batting Order', icon: ArrowUpDown, count: '1-11' },
            { step: 3, title: 'Step 3', subtitle: 'Bowling Attack', icon: Zap, count: `${totalOversAllocated}/20 ov` },
            { step: 4, title: 'Step 4', subtitle: 'Match Scenario', icon: Sliders, count: inningsMode === 'inn1' ? '1st Inn' : `Chase ${target}` },
            { step: 5, title: 'Step 5', subtitle: 'Simulate Match', icon: Play, count: `${nSims} runs` },
            { step: 6, title: 'Step 6', subtitle: 'Explore Outcomes', icon: Trophy, count: results ? `${results.mean_score} avg` : 'Pending' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step || (item.step === 6 && !!results);

            return (
              <button
                key={item.step}
                onClick={() => setCurrentStep(item.step)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-[#14213D] text-white border-[#14213D] shadow-sm'
                    : isCompleted
                    ? 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isActive ? 'text-pink-300' : 'text-slate-400'}`}>
                    {item.title}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                </div>
                <div className="text-xs font-bold mt-1 truncate">
                  {item.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* "WHAT IF YOU CHANGE YOUR XI?" COMPARISON STUDIO */}
      {showWhatIf && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E6007E] text-white uppercase">
                  COUNTERFACTUAL TACTICAL LAB
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[#14213D] flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-[#E6007E]" />
                What If You Change Your XI? — Scenario A vs Scenario B
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare baseline Playing XI (Scenario A) against an alternate combination (Scenario B) to isolate marginal runs, win probability shift, and phase leverage.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunWhatIfSimulation}
                disabled={isSimulatingB}
                className="px-4 py-2 rounded-xl bg-[#E6007E] hover:bg-pink-600 text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
              >
                {isSimulatingB ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>Simulate Scenario B ({nSims} runs)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenario A Card */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Baseline Combination</span>
                  <h3 className="font-extrabold text-slate-900 text-sm">Scenario A: Primary Lineup</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200">
                  {battingXi.length} Batters
                </span>
              </div>

              {scenarioAResults ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase">Mean Total</div>
                      <div className="text-2xl font-black text-[#14213D] mt-0.5">{scenarioAResults.mean_score}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase">Median Total</div>
                      <div className="text-2xl font-black text-slate-800 mt-0.5">{scenarioAResults.median_score}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase">Phase Run Distribution</div>
                    <div className="grid grid-cols-3 gap-1 mt-1 text-center font-bold">
                      <div>PP: {scenarioAResults.mean_pp_runs}</div>
                      <div>Mid: {scenarioAResults.mean_mid_runs}</div>
                      <div>Death: {scenarioAResults.mean_death_runs}</div>
                    </div>
                  </div>
                  {scenarioAResults.win_prob !== undefined && (
                    <div className="p-3 bg-pink-50 rounded-lg border border-pink-100 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">Chase Win Probability</div>
                      <div className="text-xl font-black text-[#E6007E]">{(scenarioAResults.win_prob * 100).toFixed(1)}%</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 font-mono">
                  Run primary simulation in Step 5 first to populate Scenario A.
                </div>
              )}
            </div>

            {/* Scenario B Card */}
            <div className="p-5 rounded-xl bg-pink-50/40 border border-pink-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-pink-200">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#E6007E]">Alternative Combination</span>
                  <h3 className="font-extrabold text-slate-900 text-sm">Scenario B: All-Out Attack Attack Order</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-[#E6007E] border border-pink-200">
                  {scenarioBXi.length} Batters
                </span>
              </div>

              {scenarioBResults ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase">Mean Total</div>
                      <div className="text-2xl font-black text-[#14213D] mt-0.5">{scenarioBResults.mean_score}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase">Median Total</div>
                      <div className="text-2xl font-black text-slate-800 mt-0.5">{scenarioBResults.median_score}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase">Phase Run Distribution</div>
                    <div className="grid grid-cols-3 gap-1 mt-1 text-center font-bold">
                      <div>PP: {scenarioBResults.mean_pp_runs}</div>
                      <div>Mid: {scenarioBResults.mean_mid_runs}</div>
                      <div>Death: {scenarioBResults.mean_death_runs}</div>
                    </div>
                  </div>
                  {scenarioBResults.win_prob !== undefined && (
                    <div className="p-3 bg-pink-50 rounded-lg border border-pink-100 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">Chase Win Probability</div>
                      <div className="text-xl font-black text-[#E6007E]">{(scenarioBResults.win_prob * 100).toFixed(1)}%</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500 font-mono space-y-2">
                  <p>Click "Simulate Scenario B" to compute marginal delta.</p>
                </div>
              )}
            </div>
          </div>

          {/* Delta Comparison Bar */}
          {scenarioAResults && scenarioBResults && (
            <div className="p-5 rounded-xl bg-[#14213D] text-white space-y-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E6007E]" />
                Counterfactual Marginal Impact &Delta; (Scenario B &minus; Scenario A)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-white/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Mean Run Delta</span>
                  <span className={`text-xl font-bold ${(scenarioBResults.mean_score - scenarioAResults.mean_score) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {(scenarioBResults.mean_score - scenarioAResults.mean_score) >= 0 ? '+' : ''}
                    {(scenarioBResults.mean_score - scenarioAResults.mean_score).toFixed(1)} runs
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Median Delta</span>
                  <span className="text-xl font-bold text-white">
                    {(scenarioBResults.median_score - scenarioAResults.median_score) >= 0 ? '+' : ''}
                    {scenarioBResults.median_score - scenarioAResults.median_score} runs
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Death Phase Delta</span>
                  <span className="text-xl font-bold text-white">
                    {(scenarioBResults.mean_death_runs - scenarioAResults.mean_death_runs) >= 0 ? '+' : ''}
                    {(scenarioBResults.mean_death_runs - scenarioAResults.mean_death_runs).toFixed(1)} runs
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Boundary Delta</span>
                  <span className="text-xl font-bold text-white">
                    {((scenarioBResults.mean_fours + scenarioBResults.mean_sixes) - (scenarioAResults.mean_fours + scenarioAResults.mean_sixes)).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 1: BUILD PLAYING XI */}
      {!showWhatIf && currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-mono uppercase text-slate-400 font-bold">Step 1 of 6</div>
              <h2 className="text-lg font-extrabold text-[#14213D] mt-0.5">
                Build Playing XI ({battingXi.length} / 11 Players Selected)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select 11 canonical players to form your match combination. Use marquee presets or construct custom squad.
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Presets:</span>
              <button
                onClick={() => setBattingXi(RR_PRESET_BATTERS)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                RR Marquee XI
              </button>
              <button
                onClick={() => setBattingXi(ATTACK_PRESET_BATTERS)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                All-Out Attack
              </button>
            </div>
          </div>

          {/* Current Selection List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-500 font-bold tracking-wider">
              Selected Playing XI ({battingXi.length} Players)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {battingXi.map((pId, idx) => {
                const photoUrl = getPlayerImageUrl(pId);
                const name = canonicalRegistry.getCanonicalName(pId);

                return (
                  <div
                    key={pId}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 group hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-slate-400 font-mono text-xs font-bold shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        {photoUrl ? (
                          <img src={photoUrl} alt={name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono text-xs font-bold text-slate-600">
                            {name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{name}</div>
                        <div className="text-[10px] font-mono text-slate-400">ID: {pId}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => removePlayerFromXi(pId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                      title="Remove player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Players Search Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase text-slate-500 font-bold tracking-wider">
                Add Players from Canonical Registry
              </h3>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player directory..."
                  value={playerSearchQuery}
                  onChange={(e) => setPlayerSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E6007E]"
                />
              </div>
            </div>

            {/* Quick Available Pool */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
              {['143', '360', '768', '781', '830', '1318', '1699', '1758', '2533', '2756', '2876', '3644', '3672', '3782', '3916', '4106', '4219', '4260', '4373', '4722', '4812', '4853', '6931', '7327', '7920', '8101', '8301', '8661']
                .filter((id) => {
                  const name = canonicalRegistry.getCanonicalName(id);
                  if (battingXi.includes(id)) return false;
                  if (!playerSearchQuery.trim()) return true;
                  return name.toLowerCase().includes(playerSearchQuery.toLowerCase()) || id.includes(playerSearchQuery);
                })
                .slice(0, 18)
                .map((id) => (
                  <button
                    key={id}
                    onClick={() => addPlayerToXi(id)}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:border-[#E6007E] text-left transition-all group flex items-center justify-between"
                  >
                    <div className="truncate min-w-0 pr-1">
                      <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#E6007E]">
                        {canonicalRegistry.getCanonicalName(id)}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">#{id}</div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E6007E] shrink-0" />
                  </button>
                ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-[#14213D] text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <span>Next: Set Batting Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT BATTING ORDER */}
      {!showWhatIf && currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-mono uppercase text-slate-400 font-bold">Step 2 of 6</div>
              <h2 className="text-lg font-extrabold text-[#14213D] mt-0.5">
                Select Batting Order (1 to 11)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reorder positions using the Up / Down controls. Entry order dictates arrival at wicket fall.
              </p>
            </div>

            <button
              onClick={() => setBattingXi(RR_PRESET_BATTERS)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Order
            </button>
          </div>

          {/* Batting Order List */}
          <div className="space-y-2 max-w-3xl mx-auto">
            {battingXi.map((pId, idx) => {
              const photoUrl = getPlayerImageUrl(pId);
              const name = canonicalRegistry.getCanonicalName(pId);

              // Role tag
              let roleTag = 'Middle Order';
              if (idx < 2) roleTag = 'Opening Pair';
              else if (idx < 4) roleTag = 'Top Order';
              else if (idx > 7) roleTag = 'Tailender / Finisher';

              return (
                <div
                  key={pId}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#14213D] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0">
                      {photoUrl ? (
                        <img src={photoUrl} alt={name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-xs font-bold text-slate-600">
                          {name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{name}</div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span>ID: #{pId}</span>
                        <span>&middot;</span>
                        <span className="text-slate-600 font-semibold">{roleTag}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => movePlayerUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-700 transition-colors"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => movePlayerDown(idx)}
                      disabled={idx === battingXi.length - 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-700 transition-colors"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              &larr; Back to Squad
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-[#14213D] text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <span>Next: Allocate Bowling Attack</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT BOWLING ATTACK & OVERS */}
      {!showWhatIf && currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-mono uppercase text-slate-400 font-bold">Step 3 of 6</div>
              <h2 className="text-lg font-extrabold text-[#14213D] mt-0.5">
                Bowling Attack &amp; Overs Allocation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign overs to bowlers (max 4 per bowler). Total innings allocation must equal 20 legal overs.
              </p>
            </div>

            {/* Total Overs Counter */}
            <div className={`px-4 py-2 rounded-xl border font-mono text-right ${
              totalOversAllocated === 20
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="text-[10px] uppercase font-bold">Allocated Overs</div>
              <div className="text-lg font-extrabold">
                {totalOversAllocated} / 20 Overs {totalOversAllocated === 20 ? '✓' : ''}
              </div>
            </div>
          </div>

          {/* Bowlers Overs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bowlingSquad.map((pId) => {
              const photoUrl = getPlayerImageUrl(pId);
              const name = canonicalRegistry.getCanonicalName(pId);
              const overs = bowlerOvers[pId] || 0;

              return (
                <div
                  key={pId}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                      {photoUrl ? (
                        <img src={photoUrl} alt={name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-xs font-bold text-slate-600">
                          {name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{name}</div>
                      <div className="text-[10px] font-mono text-slate-400">ID: #{pId} &middot; Max 4 ov</div>
                    </div>
                  </div>

                  {/* Overs +/- Stepper */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateBowlerOvers(pId, -1)}
                      disabled={overs <= 0}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 font-bold text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-mono font-black text-sm text-[#14213D]">
                      {overs} ov
                    </span>
                    <button
                      onClick={() => updateBowlerOvers(pId, 1)}
                      disabled={overs >= 4}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 font-bold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              &larr; Back to Batting Order
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 rounded-xl bg-[#14213D] text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <span>Next: Configure Scenario</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIGURE MATCH SCENARIO */}
      {!showWhatIf && currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold">Step 4 of 6</div>
            <h2 className="text-lg font-extrabold text-[#14213D] mt-0.5">
              Configure Match Scenario &amp; Monte Carlo Parameters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select innings mode (Project total vs Chase target) and set simulation replicates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Innings Mode */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <label className="text-xs font-mono uppercase text-slate-500 font-bold block">
                Innings Mode
              </label>
              <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setInningsMode('inn1')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    inningsMode === 'inn1'
                      ? 'bg-[#14213D] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1st Innings (Total)
                </button>
                <button
                  onClick={() => setInningsMode('chase')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    inningsMode === 'chase'
                      ? 'bg-[#14213D] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2nd Innings (Chase)
                </button>
              </div>

              {inningsMode === 'chase' && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Target to Chase</span>
                    <span className="font-mono text-[#E6007E] font-black">{target} Runs</span>
                  </div>
                  <input
                    type="range"
                    min={120}
                    max={240}
                    value={target}
                    onChange={(e) => setTarget(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-[#E6007E]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>120 (Low)</span>
                    <span>180 (Par)</span>
                    <span>240 (Extreme)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Monte Carlo Parameters */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <label className="text-xs font-mono uppercase text-slate-500 font-bold block">
                Monte Carlo Replicates &amp; Seed
              </label>

              <div className="space-y-2">
                <label className="text-xs text-slate-600 font-semibold">Number of Iterations</label>
                <select
                  value={nSims}
                  onChange={(e) => setNSims(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold"
                >
                  <option value={500}>500 runs (Fast Preview)</option>
                  <option value={1000}>1,000 runs (Standard)</option>
                  <option value={2000}>2,000 runs (Recommended)</option>
                  <option value={5000}>5,000 runs (Deep Precision)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-600 font-semibold">Random PRNG Seed</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value, 10) || 42)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold"
                  />
                  <button
                    onClick={() => setSeed(Math.floor(Math.random() * 900000) + 10000)}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                    title="Randomize"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              &larr; Back to Bowling Attack
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-5 py-2.5 rounded-xl bg-[#14213D] text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <span>Next: Simulate Match</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SIMULATE MATCH */}
      {!showWhatIf && currentStep === 5 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 text-[#E6007E] flex items-center justify-center mx-auto shadow-2xs">
            <Cpu className="w-8 h-8" />
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-slate-400 font-bold">Step 5 of 6</div>
            <h2 className="text-2xl font-black text-[#14213D] mt-1">
              Ready to Execute Monte Carlo Simulation
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Will simulate {nSims.toLocaleString()} full 120-ball T20 innings trajectories with empirical transition kernel, bowler spells, and Bayesian tilt uncertainty.
            </p>
          </div>

          {/* Simulation Status / Progress Bar */}
          {isSimulating ? (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-spin text-[#E6007E]" />
                  Simulating stochastic matches in worker...
                </span>
                <span className="font-extrabold text-[#E6007E]">
                  {simulatedCount} / {nSims} ({progress}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#14213D] to-[#E6007E] transition-all duration-75 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button
                onClick={handleCancel}
                className="w-full py-2 text-xs font-bold text-slate-600 hover:text-rose-600 transition-colors"
              >
                Cancel Simulation
              </button>
            </div>
          ) : (
            <button
              onClick={handleRunSimulation}
              className="px-8 py-4 rounded-xl bg-[#E6007E] hover:bg-pink-600 text-white font-extrabold text-sm shadow-md transition-all inline-flex items-center gap-2.5"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>RUN MONTE CARLO SIMULATION ({nSims} REPLICATES)</span>
            </button>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-start">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              &larr; Back to Scenario Settings
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: EXPLORE OUTCOMES */}
      {!showWhatIf && currentStep === 6 && (
        <div className="space-y-6">
          {results ? (
            <div className="space-y-6">
              {/* Scoreboard HUD Banner */}
              <div className="p-6 rounded-2xl bg-[#14213D] text-white shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-pink-300 font-bold">
                      {results.win_prob !== undefined ? 'Target Chase Outcome' : 'Innings 1 Projection'}
                    </div>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-1">
                      {results.mean_score} <span className="text-base font-normal text-slate-300">runs average</span>
                    </div>
                  </div>

                  {results.win_prob !== undefined && (
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-pink-300 font-bold">
                        Chase Win Probability
                      </div>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-[#E6007E] mt-1">
                        {(results.win_prob * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] font-mono text-slate-300">
                        &plusmn;{((results.win_prob_se || 0) * 100).toFixed(1)}% SE
                      </div>
                    </div>
                  )}

                  <div className="text-right font-mono text-xs text-slate-300">
                    <div><b>Runs:</b> {results.n_sims.toLocaleString()}</div>
                    <div><b>Execution:</b> {results.duration_ms} ms</div>
                    <div><b>Seed:</b> #{seed}</div>
                  </div>
                </div>

                {/* Score Quantiles Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-300 block font-bold uppercase">Median Score</span>
                    <span className="text-xl font-bold text-white">{results.median_score}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-300 block font-bold uppercase">80% Interval</span>
                    <span className="text-xl font-bold text-white">[{results.p10}, {results.p90}]</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-300 block font-bold uppercase">Mean Wickets</span>
                    <span className="text-xl font-bold text-white">{results.mean_wickets}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-300 block font-bold uppercase">Min / Max</span>
                    <span className="text-xl font-bold text-white">{results.min_score} &ndash; {results.max_score}</span>
                  </div>
                </div>
              </div>

              {/* Score Distribution Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-base text-[#14213D]">
                      Projected Score Density Distribution
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Empirical distribution curve across all {results.n_sims.toLocaleString()} simulated match states.
                    </p>
                  </div>
                </div>
                {chartOption && (
                  <ReactECharts option={chartOption} style={{ height: '300px', width: '100%' }} />
                )}
              </div>

              {/* Phase Run Contribution Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-extrabold text-base text-[#14213D]">
                  T20 Innings Phase Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Powerplay (Overs 1&ndash;6)</span>
                    <div className="text-2xl font-black text-slate-800 mt-1">{results.mean_pp_runs}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{(results.mean_pp_runs / 6).toFixed(2)} RPO</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Middle Overs (Overs 7&ndash;15)</span>
                    <div className="text-2xl font-black text-slate-800 mt-1">{results.mean_mid_runs}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{(results.mean_mid_runs / 9).toFixed(2)} RPO</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Death Overs (Overs 16&ndash;20)</span>
                    <div className="text-2xl font-black text-slate-800 mt-1">{results.mean_death_runs}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{(results.mean_death_runs / 5).toFixed(2)} RPO</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
                  <span className="text-slate-600 font-semibold font-sans">Boundary Breakdown:</span>
                  <div className="flex items-center gap-6">
                    <span><b>Fours:</b> {results.mean_fours}</span>
                    <span><b>Sixes:</b> {results.mean_sixes}</span>
                    <span><b>Boundary Runs:</b> {(results.mean_fours * 4 + results.mean_sixes * 6).toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons to Restart or Compare */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  &larr; Modify Strategy from Step 1
                </button>
                <button
                  onClick={() => setShowWhatIf(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#E6007E] text-white text-xs font-bold hover:bg-pink-600 transition-colors flex items-center gap-1.5"
                >
                  <GitCompare className="w-4 h-4" />
                  <span>Launch "What If" Comparison</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">No simulation results yet. Go to Step 5 to run.</p>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-5 py-2 bg-[#14213D] text-white text-xs font-bold rounded-lg"
              >
                Go to Step 5
              </button>
            </div>
          )}
        </div>
      )}

      {/* Model Limitations & Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Model Validation &amp; Bias Warning: </span>
          The simulation engine exhibits a +10.12 run scoring bias on 2026 matches due to 2024 training era run-rate acceleration. Use for comparative scenario deltas rather than absolute predictions.
        </div>
      </div>
    </div>
  );
};
