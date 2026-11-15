import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ArrowRight } from 'lucide-react';
import { canonicalRegistry } from '../../lib/data/canonical';
import { PlayerDirectoryItem } from '../../lib/data/types';
import { PlayerAvatar } from '../../components/cricket/PlayerAvatar';
import { GlobalSearchModal } from '../../components/common/GlobalSearchModal';

export interface TopNavProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerDirectoryItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isHome = location.pathname === '/';

  // Dynamic breadcrumb for sub-pages
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith('/players')) return 'Master Player Directory';
    if (path.startsWith('/rankings')) return 'Pressure Performance Rankings';
    if (path.startsWith('/player/')) return 'Individual Player Profile';
    if (path.startsWith('/compare')) return 'Player Comparison Matrix';
    if (path.startsWith('/dna')) return 'Pressure DNA & Situational Lab';
    if (path.startsWith('/simulator/golden')) return 'Simulator Golden Test Harness';
    if (path.startsWith('/simulator')) return 'Match Simulator';
    if (path.startsWith('/anomalies')) return 'Anomaly & Residual Engine';
    if (path.startsWith('/validation')) return 'Model Validation Centre';
    if (path.startsWith('/gems')) return 'Hidden Gems Discovery';
    if (path.startsWith('/methodology')) return 'Methodology Explorer';
    return 'Analytics';
  };

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick live player search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    const all = canonicalRegistry.getAllDirectoryPlayers();
    const q = searchQuery.toLowerCase().trim();
    const matches = all
      .filter((p) => p.name.toLowerCase().includes(q) || String(p.player_id).includes(q))
      .slice(0, 6);
    setSearchResults(matches);
    setIsSearchOpen(true);
  }, [searchQuery]);

  return (
    <header className="h-[56px] bg-white border-b border-[#E5E6EE] px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="mobile-nav-toggle lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {isHome ? (
          <div className="flex items-center text-sm whitespace-nowrap">
            <span className="font-bold text-slate-900 text-sm">Home</span>
            <span className="text-slate-300 mx-2.5 font-normal">|</span>
            <span className="text-slate-500 font-medium text-xs md:text-sm">IPL 2027 Auction Intelligence</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm whitespace-nowrap">
            <span className="text-xs font-semibold text-slate-400">ROYALS INTEL</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-900">{getBreadcrumb()}</span>
          </div>
        )}
      </div>

      {/* Right: Global Search */}
      <div className="flex items-center gap-4">
        <div className="relative w-64 md:w-80">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsSearchOpen(true);
              }}
              placeholder="Search players, teams, or metrics..."
              className="w-full pl-8 pr-11 py-1.5 text-xs bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E60067]/20 focus:border-[#E60067] transition-all"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              title="Open Global Search (Ctrl+K)"
              className="absolute right-2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-200/70 hover:bg-slate-300 rounded transition-colors flex items-center"
            >
              <span>⌘K</span>
            </button>
          </div>

          {/* Quick Search Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in-50 duration-150">
              <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/50">
                Quick Player Matches ({searchResults.length})
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {searchResults.map((player) => (
                  <button
                    key={player.player_id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      navigate(`/player/${player.player_id}`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar playerId={player.player_id} playerName={player.name} size="sm" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">{player.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {player.player_id} • {player.derived_role}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};
