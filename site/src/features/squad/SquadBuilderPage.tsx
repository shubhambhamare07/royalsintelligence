import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Coins,
  Download,
  Filter,
  Globe,
  HelpCircle,
  Info,
  Plus,
  RotateCcw,
  Save,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { dataLoader } from '../../lib/data/loaders';
import { canonicalRegistry } from '../../lib/data/canonical';
import { RankedPlayer, PlayerDirectoryItem, RankingsData } from '../../lib/data/types';
import { Skeleton } from '../../components/ui/Skeleton';

export interface SquadPlayerItem {
  player_id: string;
  name: string;
  role: 'batter' | 'bowler' | 'all-rounder';
  rating: number;
  tier: string;
  isOverseas: boolean;
  hypotheticalPriceCr: number; // In Crores INR
}

const DEFAULT_SQUAD_PRESET: SquadPlayerItem[] = [
  { player_id: '6931', name: 'Pathum Nissanka', role: 'batter', rating: 95.57, tier: 'Proven', isOverseas: true, hypotheticalPriceCr: 8.5 },
  { player_id: '4260', name: 'Heinrich Klaasen', role: 'batter', rating: 94.94, tier: 'Proven', isOverseas: true, hypotheticalPriceCr: 14.0 },
  { player_id: '8661', name: 'Matheesha Pathirana', role: 'bowler', rating: 90.95, tier: 'Proven', isOverseas: true, hypotheticalPriceCr: 12.0 },
  { player_id: '1318', name: 'Andre Russell', role: 'all-rounder', rating: 83.87, tier: 'Promising', isOverseas: true, hypotheticalPriceCr: 12.5 },
  { player_id: '2756', name: 'Shashank Singh', role: 'batter', rating: 82.05, tier: 'Promising', isOverseas: false, hypotheticalPriceCr: 5.5 },
  { player_id: '4219', name: 'Krunal Pandya', role: 'bowler', rating: 81.61, tier: 'Proven', isOverseas: false, hypotheticalPriceCr: 7.0 },
];

export const SquadBuilderPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [directory, setDirectory] = useState<PlayerDirectoryItem[]>([]);

  // Squad State
  const [totalPurseCr, setTotalPurseCr] = useState<number>(120.0);
  const [squad, setSquad] = useState<SquadPlayerItem[]>(() => {
    const saved = localStorage.getItem('royals_intel_squad');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_SQUAD_PRESET;
      }
    }
    return DEFAULT_SQUAD_PRESET;
  });

  // Discovery Filter State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'batter' | 'bowler'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { rankings: rankData, directory: dirData } = await dataLoader.initializeApp();
        setRankings(rankData);
        setDirectory(dirData);
      } catch (err) {
        console.error('Failed to load squad builder data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Save to localStorage
  const handleSaveSquad = () => {
    localStorage.setItem('royals_intel_squad', JSON.stringify(squad));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(squad, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `squad_scenario_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add player to squad
  const handleAddPlayer = (p: RankedPlayer) => {
    const pId = String(p.player_id);
    if (squad.some((s) => s.player_id === pId)) return;
    if (squad.length >= 25) return;

    // Detect overseas based on nationality if known, default heuristic
    const isOverseas = !['India', 'IND'].includes((p as any).country || '') &&
      ['6931', '4260', '8661', '1318', '3672', '4722', '4106', '781', '830', '1758', '7920'].includes(pId);

    const newPlayer: SquadPlayerItem = {
      player_id: pId,
      name: p.player_name,
      role: p.role,
      rating: p.rating,
      tier: p.tier,
      isOverseas,
      hypotheticalPriceCr: 4.0, // default placeholder bid
    };

    setSquad([...squad, newPlayer]);
  };

  const handleRemovePlayer = (pId: string) => {
    setSquad(squad.filter((s) => s.player_id !== pId));
  };

  const handleUpdatePrice = (pId: string, price: number) => {
    setSquad(
      squad.map((s) => (s.player_id === pId ? { ...s, hypotheticalPriceCr: Math.max(0.2, price) } : s))
    );
  };

  // Squad Composition Calculations
  const totalSpentCr = useMemo(() => {
    return squad.reduce((acc, s) => acc + s.hypotheticalPriceCr, 0);
  }, [squad]);

  const remainingPurseCr = totalPurseCr - totalSpentCr;
  const overseasCount = squad.filter((s) => s.isOverseas).length;
  const battersCount = squad.filter((s) => s.role === 'batter').length;
  const bowlersCount = squad.filter((s) => s.role === 'bowler').length;
  const avgRating = squad.length > 0 ? squad.reduce((acc, s) => acc + s.rating, 0) / squad.length : 0;

  // Filter available candidate pool
  const availableCandidates = useMemo(() => {
    if (!rankings) return [];
    const inSquadIds = new Set(squad.map((s) => s.player_id));
    const allRanked = [
      ...(rankings.eligible_batters || rankings.top_10_batters),
      ...(rankings.eligible_bowlers || rankings.top_10_bowlers),
    ];

    return allRanked.filter((p) => {
      const pId = String(p.player_id);
      if (inSquadIds.has(pId)) return false;
      const matchRole = roleFilter === 'all' || p.role === roleFilter;
      const matchTier = tierFilter === 'all' || p.tier === tierFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.player_name.toLowerCase().includes(q) ||
        pId.includes(q);

      return matchRole && matchTier && matchSearch;
    });
  }, [rankings, squad, roleFilter, tierFilter, search]);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#14213D] text-white">
              AUCTION STRATEGY SUITE &middot; PHASE 07C
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              HYPOTHETICAL SQUAD BUILDER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Coins className="w-7 h-7 text-emerald-600" />
            Auction Squad Builder &amp; Purse Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Construct and test hypothetical IPL 2027 auction squads with live budget tracking, role composition balance, overseas caps, and average squad pressure ratings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveSquad}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4 text-emerald-600" />
            {savedNotice ? 'Saved!' : 'Save Scenario'}
          </button>
          <button
            onClick={handleExportJson}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-600" /> Export JSON
          </button>
          <button
            onClick={() => setSquad(DEFAULT_SQUAD_PRESET)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Reset to Default Preset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Purse & Squad Constraints Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Remaining Purse Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            <span>Remaining Purse</span>
            <span className="text-slate-600">Total ₹{totalPurseCr} Cr</span>
          </div>
          <div
            className={`text-3xl font-extrabold font-mono mt-1 ${
              remainingPurseCr >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            ₹{remainingPurseCr.toFixed(2)} Cr
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Spent: ₹{totalSpentCr.toFixed(2)} Cr ({((totalSpentCr / totalPurseCr) * 100).toFixed(1)}%)
          </div>
        </div>

        {/* Squad Size & Slots Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            <span>Squad Size</span>
            <span className="text-slate-600">18&ndash;25 Slots</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
            {squad.length} <span className="text-sm font-normal text-slate-400">/ 25 max</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {squad.length < 18 ? (
              <span className="text-amber-600 font-bold">Need {18 - squad.length} more (min 18)</span>
            ) : (
              <span className="text-emerald-600 font-bold">Valid squad size (&ge;18)</span>
            )}
          </div>
        </div>

        {/* Overseas Cap Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            <span>Overseas Players</span>
            <span className="text-slate-600">Max 8 Allowed</span>
          </div>
          <div
            className={`text-3xl font-extrabold font-mono mt-1 ${
              overseasCount <= 8 ? 'text-blue-700' : 'text-rose-600'
            }`}
          >
            {overseasCount} <span className="text-sm font-normal text-slate-400">/ 8</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {overseasCount <= 8 ? 'Complies with IPL rules' : 'Exceeds overseas limit!'}
          </div>
        </div>

        {/* Squad Average Pressure Rating */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            <span>Squad Avg Clutch Rating</span>
            <span className="text-brand-pink font-bold">Quality</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-brand-pink mt-1">
            {avgRating.toFixed(1)}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Batters: {battersCount} &middot; Bowlers: {bowlersCount}
          </div>
        </div>
      </div>

      {/* Main Builder Grid: Left Roster (7 cols) vs Right Player Pool (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Squad Roster (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                Active Squad Roster ({squad.length} Players)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust user-entered hypothetical bids (in Crores) to test purse feasibility.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 font-bold">Purse:</span>
              <input
                type="number"
                value={totalPurseCr}
                onChange={(e) => setTotalPurseCr(parseFloat(e.target.value) || 120)}
                className="w-20 px-2 py-1 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-brand-pink"
              />
              <span className="text-xs font-mono text-slate-500">Cr</span>
            </div>
          </div>

          {squad.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono border border-dashed border-slate-200 rounded-xl">
              Squad is empty. Select players from the discovery pool on the right.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Player</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Tier</th>
                    <th className="py-2.5 px-3 text-right">Rating</th>
                    <th className="py-2.5 px-3 text-right">Hypo Bid (₹ Cr)</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {squad.map((p) => (
                    <tr key={p.player_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/player/${p.player_id}`}
                            className="font-bold text-slate-900 hover:text-brand-pink transition-colors truncate block"
                          >
                            {p.name}
                          </Link>
                          {p.isOverseas && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-100 text-blue-800" title="Overseas Player">
                              OS
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono uppercase text-[11px] text-slate-600">
                        {p.role}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-pink-100 text-brand-pink">
                          {p.tier}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        {p.rating.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <span className="font-mono text-slate-400">₹</span>
                          <input
                            type="number"
                            step="0.25"
                            min="0.2"
                            max="30"
                            value={p.hypotheticalPriceCr}
                            onChange={(e) => handleUpdatePrice(p.player_id, parseFloat(e.target.value) || 0)}
                            className="w-16 px-1.5 py-1 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-brand-pink"
                          />
                          <span className="font-mono text-slate-400">Cr</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleRemovePlayer(p.player_id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* User-Defined Assumptions Callout */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 leading-relaxed font-sans flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <b>Governance Note:</b> All bids and budget usages displayed are user-entered hypothetical scenarios. ROYALS INTELLIGENCE does not fabricate predicted auction bids or simulate unauthorized auction market dynamics.
            </span>
          </div>
        </div>

        {/* Right Column: Player Pool Discovery Drawer (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5">
          <div className="space-y-3 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base text-slate-900">
                Available Player Pool
              </h2>
              <span className="text-xs font-mono text-slate-500">
                {availableCandidates.length} Candidates
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  roleFilter === 'all' ? 'bg-[#14213D] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => setRoleFilter('batter')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  roleFilter === 'batter' ? 'bg-[#14213D] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Batters
              </button>
              <button
                onClick={() => setRoleFilter('bowler')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  roleFilter === 'bowler' ? 'bg-[#14213D] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Bowlers
              </button>
            </div>
          </div>

          {/* Candidate Cards List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {availableCandidates.slice(0, 30).map((p) => (
              <div
                key={p.player_id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-400 font-bold text-[11px]">#{p.rank}</span>
                    <span className="font-bold text-slate-900 truncate">{p.player_name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {p.role.toUpperCase()} &middot; Rating <b className="text-brand-pink">{p.rating.toFixed(1)}</b> &middot; {p.tier}
                  </div>
                </div>

                <button
                  onClick={() => handleAddPlayer(p)}
                  disabled={squad.length >= 25}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shrink-0 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

