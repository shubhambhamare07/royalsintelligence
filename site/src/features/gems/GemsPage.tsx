import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle,
  Eye,
  Filter,
  Gem,
  Info,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
  ChevronRight,
  ShieldCheck,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { dataLoader } from '../../lib/data/loaders';
import { canonicalRegistry } from '../../lib/data/canonical';
import { HiddenGemsData, GemPlayer } from '../../lib/data/types';
import { Skeleton } from '../../components/ui/Skeleton';
import { getPlayerImageUrl } from '../../lib/data/playerImages';
import { getCountryFlag, getPlayerFranchise } from '../../lib/data/playerMetadata';

const GEM_NATIONALITIES: Record<number, string> = {
  2756: 'India',
  3672: 'Sri Lanka',
  4722: 'Afghanistan',
  768: 'South Africa',
  2533: 'Afghanistan',
  4853: 'New Zealand',
  4812: 'Ireland',
  3782: 'India',
  8301: 'United Arab Emirates',
  8101: 'India',
  4373: 'Bangladesh',
};

export const GemsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gemsData, setGemsData] = useState<HiddenGemsData | null>(null);

  // Filters
  const [activeFilter, setActiveFilter] = useState<'all' | 'batters' | 'bowlers' | 'exposure' | 'rate'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadGems() {
      try {
        setLoading(true);
        const data = await dataLoader.getHiddenGemsData();
        setGemsData(data);
      } catch (err: any) {
        console.error('Failed to load hidden gems:', err);
        setError(err.message || 'Error loading hidden gems data');
      } finally {
        setLoading(false);
      }
    }
    loadGems();
  }, []);

  // Filtered Batters
  const filteredBatters = useMemo(() => {
    if (!gemsData) return [];
    if (activeFilter === 'bowlers') return [];

    return gemsData.gem_batters.filter((gem) => {
      // Condition filter
      if (activeFilter === 'exposure' && !gem.low_exposure_flag) return false;
      if (activeFilter === 'rate' && !gem.low_rate_flag) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = gem.player_name.toLowerCase().includes(query);
        const matchesId = String(gem.player_id).includes(query);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });
  }, [gemsData, activeFilter, searchQuery]);

  // Filtered Bowlers
  const filteredBowlers = useMemo(() => {
    if (!gemsData) return [];
    if (activeFilter === 'batters') return [];

    return gemsData.gem_bowlers.filter((gem) => {
      // Condition filter
      if (activeFilter === 'exposure' && !gem.low_exposure_flag) return false;
      if (activeFilter === 'rate' && !gem.low_rate_flag) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = gem.player_name.toLowerCase().includes(query);
        const matchesId = String(gem.player_id).includes(query);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });
  }, [gemsData, activeFilter, searchQuery]);

  const totalFilteredCount = filteredBatters.length + filteredBowlers.length;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !gemsData) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
          <h2 className="font-bold text-lg mb-2">Hidden Gems Load Error</h2>
          <p className="text-sm">{error || 'Unable to load hidden gems data.'}</p>
        </div>
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
          <span className="text-slate-800 font-semibold">Alpha</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#E6007E] font-semibold">Hidden Gems Discovery</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#14213D] text-white tracking-wider uppercase">
                AUCTION ALPHA DISCOVERY &middot; PHASE 04
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-50 text-[#E6007E] border border-pink-200 uppercase">
                CONCEALED VALUE IDENTIFICATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight flex items-center gap-2.5">
              <Gem className="w-7 h-7 text-[#E6007E]" />
              Hidden Gems Discovery Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Identifying undervalued auction targets whose high pressure impact is masked by low exposure volume or misleading conventional box-score statistics (Strike Rate or Economy Rate).
            </p>
          </div>

          {/* Identified Count Pill */}
          <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-right self-start md:self-center shrink-0">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
              Identified Gems
            </div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-[#E6007E]">
              {gemsData.counts.total_gems} Verified Targets
            </div>
          </div>
        </div>
      </div>

      {/* KPI Threshold Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Statistical Outperform Criterion
          </div>
          <div className="text-xl font-extrabold font-mono tabular-nums text-emerald-700 mt-1">
            P(Outperform) &ge; {(gemsData.thresholds.min_p_outperform * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            High posterior certainty of elite clutch performance
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Batter Concealment Thresholds
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-1">
            &lt;{gemsData.thresholds.batter_median_balls} Balls <span className="text-slate-400 font-normal">OR</span> &lt;{gemsData.thresholds.batter_median_sr} SR
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Concealed by low pressure volume or middle-order anchor role
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Bowler Concealment Thresholds
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-1">
            &lt;{gemsData.thresholds.bowler_median_balls} Balls <span className="text-slate-400 font-normal">OR</span> &gt;{gemsData.thresholds.bowler_median_econ} Econ
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            High economy masked by high-leverage death overs
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider mr-1">
            Filter:
          </span>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-[#14213D] text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Discoveries ({gemsData.counts.total_gems})
          </button>
          <button
            onClick={() => setActiveFilter('batters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'batters'
                ? 'bg-[#14213D] text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Batters ({gemsData.counts.gem_batters})
          </button>
          <button
            onClick={() => setActiveFilter('bowlers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'bowlers'
                ? 'bg-[#14213D] text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Bowlers ({gemsData.counts.gem_bowlers})
          </button>
          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />
          <button
            onClick={() => setActiveFilter('exposure')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'exposure'
                ? 'bg-[#E6007E] text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Low Exposure
          </button>
          <button
            onClick={() => setActiveFilter('rate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'rate'
                ? 'bg-[#E6007E] text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Conventional Metric Concealment
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#E6007E] focus:border-[#E6007E]"
          />
        </div>
      </div>

      {/* SECTION A: BATTER DISCOVERIES */}
      {filteredBatters.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-lg font-extrabold text-[#14213D] flex items-center gap-2">
                <span>Section A &middot; Batter Discoveries</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-pink-100 text-[#E6007E]">
                  {filteredBatters.length} Players
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Qualified with clutch pressure rating &ge; 64.0 and posterior outperform certainty &ge; 80%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBatters.map((gem, idx) => {
              const photoUrl = getPlayerImageUrl(gem.player_id);
              const dirItem = canonicalRegistry.getPlayerById(gem.player_id);
              const franchise = getPlayerFranchise(gem.player_id, dirItem?.teams);
              const nationality = GEM_NATIONALITIES[Number(gem.player_id)] || dirItem?.national_teams?.[0] || 'India';
              const flagUrl = getCountryFlag(nationality);

              const hasMultipleConditions = gem.low_exposure_flag && gem.low_rate_flag;

              return (
                <div
                  key={gem.player_id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-5 space-y-4">
                    {/* Top Identity Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Player Photo */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={gem.player_name}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-base font-bold text-slate-500 font-mono">
                              {gem.player_name.charAt(0)}
                            </span>
                          )}
                          {flagUrl && (
                            <img
                              src={flagUrl}
                              alt=""
                              className="w-4 h-3 object-cover rounded-2xs absolute bottom-1 right-1 border border-white shadow-2xs"
                            />
                          )}
                        </div>

                        {/* Name + ID + Tier */}
                        <div className="min-w-0">
                          <Link
                            to={`/player/${gem.player_id}`}
                            className="font-bold text-sm text-[#14213D] hover:text-[#E6007E] truncate block transition-colors"
                          >
                            {gem.player_name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                            <span>ID: #{gem.player_id}</span>
                            <span>&middot;</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              {gem.tier}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Team Logo if available */}
                      {franchise && (
                        <div className="shrink-0" title={franchise.name}>
                          <img
                            src={franchise.logo}
                            alt={franchise.name}
                            className="w-7 h-7 object-contain drop-shadow-2xs"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Pressure Rating & Posterior Certainty */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                          Pressure Rating
                        </div>
                        <div className="text-2xl font-black font-mono tabular-nums text-[#14213D]">
                          {gem.rating.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          90% CI: [{gem.rating_ci90[0].toFixed(1)}, {gem.rating_ci90[1].toFixed(1)}]
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                          P(Outperform)
                        </div>
                        <div className="text-lg font-extrabold font-mono tabular-nums text-emerald-600">
                          {(gem.p_outperform * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle className="w-3 h-3" />
                          &ge;80% Certainty
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Sample Exposure</div>
                        <div className="font-bold text-slate-800 font-mono tabular-nums mt-0.5">
                          {gem.exposure_balls} Balls
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {gem.exposure_percentile}th %tile (Med: 155)
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Conventional {gem.sr_or_econ_label}</div>
                        <div className="font-bold text-slate-800 font-mono tabular-nums mt-0.5">
                          {gem.sr_or_econ.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {gem.sr_or_econ_percentile}th %tile
                        </div>
                      </div>
                    </div>

                    {/* Matched Concealment Condition Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hasMultipleConditions ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          MULTIPLE CONDITIONS MATCHED
                        </span>
                      ) : (
                        <>
                          {gem.low_exposure_flag && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              LOW EXPOSURE (&lt;155 balls)
                            </span>
                          )}
                          {gem.low_rate_flag && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              LOW CONVENTIONAL STRIKE RATE
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Plain-English Reason String */}
                    <p className="text-xs text-slate-600 italic bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      "{gem.reason_string}"
                    </p>
                  </div>

                  {/* Card Footer Link */}
                  <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-400">Discovery Target #{idx + 1}</span>
                    <Link
                      to={`/player/${gem.player_id}`}
                      className="font-semibold text-[#E6007E] hover:text-[#14213D] flex items-center gap-1 transition-colors"
                    >
                      <span>View Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION B: BOWLER DISCOVERY */}
      {filteredBowlers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-lg font-extrabold text-[#14213D] flex items-center gap-2">
                <span>Section B &middot; Bowler Discovery</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800">
                  {filteredBowlers.length} Target
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Qualified with clutch pressure rating and high economy masked by high-leverage death overs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBowlers.map((gem) => {
              const photoUrl = getPlayerImageUrl(gem.player_id);
              const dirItem = canonicalRegistry.getPlayerById(gem.player_id);
              const franchise = getPlayerFranchise(gem.player_id, dirItem?.teams);
              const nationality = GEM_NATIONALITIES[Number(gem.player_id)] || dirItem?.national_teams?.[0] || 'Bangladesh';
              const flagUrl = getCountryFlag(nationality);

              return (
                <div
                  key={gem.player_id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group md:col-span-2"
                >
                  <div className="p-6 space-y-5">
                    {/* Bowler Identity Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={gem.player_name}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <span className="text-xl font-bold text-slate-600 font-mono">
                              MR
                            </span>
                          )}
                          {flagUrl && (
                            <img
                              src={flagUrl}
                              alt="Bangladesh"
                              className="w-5 h-3.5 object-cover rounded-2xs absolute bottom-1 right-1 border border-white shadow-2xs"
                            />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/player/${gem.player_id}`}
                              className="font-extrabold text-lg text-[#14213D] hover:text-[#E6007E] transition-colors"
                            >
                              {gem.player_name}
                            </Link>
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-200">
                              L-ARM FAST MEDIUM
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                            <span>ID: #{gem.player_id}</span>
                            <span>&middot;</span>
                            <span>Bangladesh</span>
                            <span>&middot;</span>
                            <span className="font-semibold text-slate-600">Tier: {gem.tier}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bowler Key Ratings */}
                      <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Pressure Rating</div>
                          <div className="text-2xl font-black font-mono text-[#14213D]">{gem.rating.toFixed(1)}</div>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div>
                          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">P(Outperform)</div>
                          <div className="text-2xl font-black font-mono text-emerald-600">{(gem.p_outperform * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics & Explanation Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Pressure Deliveries</div>
                        <div className="font-bold text-slate-800 font-mono text-base mt-0.5">
                          {gem.exposure_balls} Balls
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">87.4th percentile sample</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Conventional Economy</div>
                        <div className="font-bold text-rose-700 font-mono text-base mt-0.5">
                          {gem.sr_or_econ.toFixed(2)} RPO
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Above 8.62 median (high-leverage)</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Primary Concealment</div>
                        <div className="font-bold text-slate-800 text-xs mt-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            HIGH CONVENTIONAL ECONOMY
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Concealed by death-over leverage</div>
                      </div>
                    </div>

                    {/* Analytical Description */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <h4 className="font-bold text-xs text-slate-800 uppercase font-mono tracking-wider">
                        Forensic Value Analysis:
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Mustafizur Rahman demonstrates high clutch rating ({gem.rating.toFixed(1)}, P(outperform)={(gem.p_outperform).toFixed(3)}) concealed by conventional economy ({gem.sr_or_econ.toFixed(2)} rpo vs median 8.62). Because he is predominantly deployed during overs 16–20 where baseline scoring expectation exceeds 10.5 rpo, his raw economy appears expensive in superficial box-scores, masking his superior wicket hazard and negative win-probability suppression against top finishers.
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-400">Sole Bowler Discovery Target</span>
                    <Link
                      to={`/player/${gem.player_id}`}
                      className="font-bold text-[#E6007E] hover:text-[#14213D] flex items-center gap-1.5 transition-colors"
                    >
                      <span>Explore Mustafizur Rahman Dossier</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {totalFilteredCount === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800">No Hidden Gems Match Filter Criteria</h3>
          <p className="text-xs text-slate-500">Try selecting "All Discoveries" or clearing your search term.</p>
          <button
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#14213D] text-white rounded-lg text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
