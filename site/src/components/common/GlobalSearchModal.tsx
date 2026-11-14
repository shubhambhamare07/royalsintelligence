import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ArrowRight,
  User,
  Sliders,
  ShieldCheck,
  FileText,
  Activity,
  Award,
  Layers,
  Sparkles,
  Zap,
  PlaySquare,
  Command,
  Database
} from 'lucide-react';
import { canonicalRegistry } from '../../lib/data/canonical';
import { dataLoader } from '../../lib/data/loaders';
import { PlayerDirectoryItem, MatchIndexItem } from '../../lib/data/types';
import { PlayerAvatar } from '../cricket/PlayerAvatar';

interface NavToolItem {
  id: string;
  title: string;
  category: 'tool' | 'page';
  description: string;
  path: string;
  icon: any;
  badge?: string;
}

const STATIC_ROUTES: NavToolItem[] = [
  {
    id: 'simulator',
    title: 'Match Simulator (Monte Carlo)',
    category: 'tool',
    description: 'Seeded Monte Carlo match engine with phase transitions and chase target simulation',
    path: '/simulator',
    icon: Sliders,
    badge: 'Phase 7C'
  },
  {
    id: 'golden',
    title: 'Simulator Golden Test Harness',
    category: 'tool',
    description: '5,000-case parity verification against Python reference kernel (tolerance ≤ 1e-7)',
    path: '/simulator/golden',
    icon: ShieldCheck,
    badge: '5,000 Cases'
  },
  {
    id: 'squad-builder',
    title: 'Auction Squad Builder',
    category: 'tool',
    description: 'Interactive auction workspace with ₹120.0 Cr purse tracker and overseas roster limits',
    path: '/squad-builder',
    icon: Layers,
    badge: '₹120 Cr'
  },
  {
    id: 'anomalies',
    title: 'Anomaly & Residual Engine',
    category: 'tool',
    description: 'Statistical outlier detection across 1,782 match deliveries with |Z| ≥ 2.5σ',
    path: '/anomalies',
    icon: Activity,
    badge: '1,782 Outliers'
  },
  {
    id: 'validation',
    title: 'Model Validation Centre',
    category: 'tool',
    description: 'Formal pre-registered audit gates, calibration curves, and unredacted model governance',
    path: '/validation',
    icon: ShieldCheck,
    badge: 'G2 / G-G7 Fail'
  },
  {
    id: 'rankings',
    title: 'Pressure Rankings & Leaderboard',
    category: 'page',
    description: 'Frozen player ratings, Top 10 batters and bowlers, tier classifications',
    path: '/rankings',
    icon: Award,
    badge: '306 Roles'
  },
  {
    id: 'players',
    title: 'Master Player Directory',
    category: 'page',
    description: 'Searchable directory of all 959 players with pressure ratings and match samples',
    path: '/players',
    icon: User,
    badge: '959 Players'
  },
  {
    id: 'matches',
    title: 'Match Centre & Replays',
    category: 'page',
    description: '883 T20 and IPL match timelines, turning points, and pressure trajectories',
    path: '/matches',
    icon: PlaySquare,
    badge: '883 Matches'
  },
  {
    id: 'methodology',
    title: 'Methodology Explorer',
    category: 'page',
    description: 'Mathematical derivations, Bayesian shrinkage formulas, and score tracing',
    path: '/methodology',
    icon: FileText
  },
  {
    id: 'lab',
    title: 'Sensitivity Lab',
    category: 'tool',
    description: 'Interactive sensitivity experiments and prior weight perturbation audits',
    path: '/lab',
    icon: Sliders
  },
  {
    id: 'gems',
    title: 'Hidden Gems Discovery',
    category: 'tool',
    description: 'Undervalued high-pressure performers identified through empirical residuals',
    path: '/gems',
    icon: Sparkles
  }
];

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'players' | 'matches' | 'tools'>('all');
  const [matchesIndex, setMatchesIndex] = useState<MatchIndexItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Load matches index once
  useEffect(() => {
    let mounted = true;
    dataLoader.getMatchesIndex().then((data) => {
      if (mounted && data) setMatchesIndex(data);
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Filter results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const allPlayers = canonicalRegistry.getAllDirectoryPlayers();

    // Tools matching
    const matchedTools = STATIC_ROUTES.filter((tool) => {
      if (activeCategory === 'players' || activeCategory === 'matches') return false;
      if (!q) return true;
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.id.toLowerCase().includes(q)
      );
    });

    // Players matching
    const matchedPlayers = (activeCategory === 'tools' || activeCategory === 'matches') ? [] : (
      !q ? allPlayers.slice(0, 10) : allPlayers.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          String(p.player_id).includes(q) ||
          (p.derived_role && p.derived_role.toLowerCase().includes(q))
        );
      }).slice(0, 15)
    );

    // Matches matching
    const matchedMatches = (activeCategory === 'tools' || activeCategory === 'players') ? [] : (
      !q ? matchesIndex.slice(0, 5) : matchesIndex.filter((m) => {
        return (
          String(m.match_id).includes(q) ||
          (m.home_team && m.home_team.toLowerCase().includes(q)) ||
          (m.away_team && m.away_team.toLowerCase().includes(q)) ||
          (m.comp_name && m.comp_name.toLowerCase().includes(q)) ||
          (m.season && String(m.season).includes(q))
        );
      }).slice(0, 10)
    );

    return {
      tools: matchedTools,
      players: matchedPlayers,
      matches: matchedMatches,
      flattened: [
        ...matchedTools.map((t) => ({ type: 'tool' as const, item: t })),
        ...matchedPlayers.map((p) => ({ type: 'player' as const, item: p })),
        ...matchedMatches.map((m) => ({ type: 'match' as const, item: m }))
      ]
    };
  }, [query, activeCategory, matchesIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    const total = results.flattened.length;
    if (total === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + total) % total);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = results.flattened[selectedIndex];
      if (current) {
        selectItem(current);
      }
    }
  };

  const selectItem = (entry: { type: 'tool' | 'player' | 'match'; item: any }) => {
    onClose();
    if (entry.type === 'tool') {
      navigate(entry.item.path);
    } else if (entry.type === 'player') {
      navigate(`/player/${entry.item.player_id}`);
    } else if (entry.type === 'match') {
      navigate(`/match/${entry.item.match_id}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/70 backdrop-blur-md animate-in fade-in-50 duration-150">
      <div
        className="w-full max-w-2xl bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-[#14213D]/60">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search 959 players, 883 matches, tools, or analytical models... (ESC to close)"
            className="flex-1 bg-transparent border-none text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0A0E1A]/80 border-b border-slate-800/80 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full transition-colors ${
              activeCategory === 'all'
                ? 'bg-[#E6007E] text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveCategory('tools')}
            className={`px-3 py-1 rounded-full transition-colors ${
              activeCategory === 'tools'
                ? 'bg-[#E6007E] text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Tools & Modules ({results.tools.length})
          </button>
          <button
            onClick={() => setActiveCategory('players')}
            className={`px-3 py-1 rounded-full transition-colors ${
              activeCategory === 'players'
                ? 'bg-[#E6007E] text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Players ({results.players.length})
          </button>
          <button
            onClick={() => setActiveCategory('matches')}
            className={`px-3 py-1 rounded-full transition-colors ${
              activeCategory === 'matches'
                ? 'bg-[#E6007E] text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Matches ({results.matches.length})
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/50">
          {results.flattened.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Database className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <div className="text-sm font-semibold text-slate-300">No matching records found</div>
              <div className="text-xs text-slate-500 mt-1">Try searching by player name (e.g. "Klaasen"), team, or match venue.</div>
            </div>
          ) : (
            results.flattened.map((entry, idx) => {
              const isSelected = idx === selectedIndex;

              if (entry.type === 'tool') {
                const tool = entry.item as NavToolItem;
                const Icon = tool.icon;
                return (
                  <div
                    key={`tool-${tool.id}`}
                    onClick={() => selectItem(entry)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#14213D] border border-[#E6007E]/50' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-pink-950/40 border border-pink-900/60 text-[#E6007E]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {tool.title}
                          {tool.badge && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tool.description}</div>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-[#E6007E]' : 'text-slate-600'}`} />
                  </div>
                );
              }

              if (entry.type === 'player') {
                const player = entry.item as PlayerDirectoryItem;
                return (
                  <div
                    key={`player-${player.player_id}`}
                    onClick={() => selectItem(entry)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#14213D] border border-[#E6007E]/50' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PlayerAvatar playerId={player.player_id} playerName={player.name} size="sm" />
                      <div>
                        <div className="text-sm font-bold text-white">{player.name}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          ID: {player.player_id} • {player.derived_role} {player.batting_hand ? `• ${player.batting_hand}` : ''} {player.bowling_type ? `• ${player.bowling_type}` : ''}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-[#E6007E]' : 'text-slate-600'}`} />
                  </div>
                );
              }

              if (entry.type === 'match') {
                const match = entry.item as MatchIndexItem;
                return (
                  <div
                    key={`match-${match.match_id}`}
                    onClick={() => selectItem(entry)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#14213D] border border-[#E6007E]/50' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-950/40 border border-teal-900/60 text-[#00D4B8]">
                        <PlaySquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {match.home_team} vs {match.away_team}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          Match #{match.match_id} • {match.comp_name} • {match.season}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-[#E6007E]' : 'text-slate-600'}`} />
                  </div>
                );
              }

              return null;
            })
          )}
        </div>

        {/* Modal Footer Keyboard Legend */}
        <div className="p-3 bg-[#0A0E1A] border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Enter</kbd> to select
            </span>
          </div>
          <span>ROYALS INTELLIGENCE SEARCH</span>
        </div>
      </div>
    </div>
  );
};
