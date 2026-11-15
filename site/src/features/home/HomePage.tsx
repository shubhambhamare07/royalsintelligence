import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Target,
  Activity,
  Award,
  PlaySquare,
  ArrowRight,
  Info,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { PlayerPortrait } from '../../components/cricket/PlayerPortrait';

interface TopPlayerCardData {
  rank: number;
  playerId: number;
  name: string;
  rating: number;
  country: string;
  flagSrc: string;
  team: string;
  teamLogo: string;
  photoSrc: string;
}

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'batters' | 'bowlers'>('batters');
  const [page, setPage] = useState<0 | 1>(0); // 0 = Ranks 1-5, 1 = Ranks 6-10

  // Authoritative frozen rankings data with user assets and trade assignments
  const allBatters: TopPlayerCardData[] = [
    {
      rank: 1,
      playerId: 6931,
      name: 'Pathum Nissanka',
      rating: 95.57,
      country: 'Sri Lanka',
      flagSrc: '/assets/flags/lk.svg',
      team: 'DC',
      teamLogo: '/assets/teams/user_logos/dc.png',
      photoSrc: '/assets/players/top10/pathum-nissanka.webp',
    },
    {
      rank: 2,
      playerId: 4260,
      name: 'Heinrich Klaasen',
      rating: 94.94,
      country: 'South Africa',
      flagSrc: '/assets/flags/za.svg',
      team: 'SRH',
      teamLogo: '/assets/teams/user_logos/srh.png',
      photoSrc: '/assets/players/top10/heinrich-klaasen.webp',
    },
    {
      rank: 3,
      playerId: 1318,
      name: 'Andre Russell',
      rating: 83.87,
      country: 'West Indies',
      flagSrc: '/assets/flags/wi.svg',
      team: 'KKR',
      teamLogo: '/assets/teams/user_logos/kkr.png',
      photoSrc: '/assets/players/top10/andre-russell.webp',
    },
    {
      rank: 4,
      playerId: 2756,
      name: 'Shashank Singh',
      rating: 82.05,
      country: 'India',
      flagSrc: '/assets/flags/in.svg',
      team: 'PBKS',
      teamLogo: '/assets/teams/user_logos/pbks.png',
      photoSrc: '/assets/players/top10/shashank-singh.webp',
    },
    {
      rank: 5,
      playerId: 143,
      name: 'Dinesh Karthik',
      rating: 82.02,
      country: 'India',
      flagSrc: '/assets/flags/in.svg',
      team: 'RCB',
      teamLogo: '/assets/teams/user_logos/rcb.png',
      photoSrc: '/assets/players/top10/dinesh-karthik.png',
    },
    {
      rank: 6,
      playerId: 3672,
      name: 'Kusal Mendis',
      rating: 79.34,
      country: 'Sri Lanka',
      flagSrc: '/assets/flags/lk.svg',
      team: 'GT',
      teamLogo: '/assets/teams/user_logos/gt.png',
      photoSrc: '/assets/players/top10/kusal-mendis.png',
    },
    {
      rank: 7,
      playerId: 3916,
      name: 'Jitesh Sharma',
      rating: 78.72,
      country: 'India',
      flagSrc: '/assets/flags/in.svg',
      team: 'PBKS',
      teamLogo: '/assets/teams/user_logos/pbks.png',
      photoSrc: '/assets/players/top10/jitesh-sharma.webp',
    },
    {
      rank: 8,
      playerId: 4722,
      name: 'Rashid Khan',
      rating: 74.50,
      country: 'Afghanistan',
      flagSrc: '/assets/flags/af.svg',
      team: 'GT',
      teamLogo: '/assets/teams/user_logos/gt.png',
      photoSrc: '/assets/players/top10/rashid-khan.webp',
    },
    {
      rank: 9,
      playerId: 1699,
      name: 'Suryakumar Yadav',
      rating: 73.66,
      country: 'India',
      flagSrc: '/assets/flags/in.svg',
      team: 'MI',
      teamLogo: '/assets/teams/user_logos/mi.png',
      photoSrc: '/assets/players/top10/suryakumar-yadav.webp',
    },
    {
      rank: 10,
      playerId: 4106,
      name: 'Daryl Mitchell',
      rating: 72.68,
      country: 'New Zealand',
      flagSrc: '/assets/flags/nz.svg',
      team: 'CSK',
      teamLogo: '/assets/teams/user_logos/csk.png',
      photoSrc: '/assets/players/top10/daryl-mitchell.png',
    },
  ];

  const allBowlers: TopPlayerCardData[] = [
    {
      rank: 1,
      playerId: 8661,
      name: 'Matheesha Pathirana',
      rating: 90.95,
      country: 'Sri Lanka',
      flagSrc: '/assets/flags/lk.svg',
      team: 'KKR',
      teamLogo: '/assets/teams/user_logos/kkr.png',
      photoSrc: '/assets/players/top10/matheesha-pathirana.webp',
    },
    {
      rank: 2,
      playerId: 4219,
      name: 'Krunal Pandya',
      rating: 81.61,
      country: 'India',
      flagSrc: '/assets/flags/in.svg',
      team: 'LSG',
      teamLogo: '/assets/teams/user_logos/lsg.png',
      photoSrc: '/assets/players/top10/krunal-pandya.webp',
    },
    {
      rank: 3,
      playerId: 781,
      name: 'Sunil Narine',
      rating: 78.48,
      country: 'West Indies',
      flagSrc: '/assets/flags/wi.svg',
      team: 'KKR',
      teamLogo: '/assets/teams/user_logos/kkr.png',
      photoSrc: '/assets/players/top10/sunil-narine.webp',
    },
    {
      rank: 4,
      playerId: 830,
      name: 'Josh Hazlewood',
      rating: 76.70,
      country: 'Australia',
      flagSrc: '/assets/flags/au.svg',
      team: 'RCB',
      teamLogo: '/assets/teams/user_logos/rcb.png',
      photoSrc: '/assets/players/top10/josh-hazlewood.webp',
    },
    {
      rank: 5,
      playerId: 2876,
      name: 'Axar Patel',
      rating: 73.73,
      country: 'India',
      flagSrc: '/assets/flags/in.svg',
      team: 'DC',
      teamLogo: '/assets/teams/user_logos/dc.png',
      photoSrc: '/assets/players/top10/axar-patel.webp',
    },
    {
      rank: 6,
      playerId: 3644,
      name: 'Kuldeep Yadav',
      rating: 72.91,
      country: 'India',
      flagSrc: '/assets/flags/in.svg',
      team: 'DC',
      teamLogo: '/assets/teams/user_logos/dc.png',
      photoSrc: '/assets/players/top10/kuldeep-yadav.webp',
    },
    {
      rank: 7,
      playerId: 360,
      name: 'Bhuvneshwar Kumar',
      rating: 72.60,
      country: 'India',
      flagSrc: '/assets/flags/in.svg',
      team: 'RCB',
      teamLogo: '/assets/teams/user_logos/rcb.png',
      photoSrc: '/assets/players/top10/bhuvneshwar-kumar.webp',
    },
    {
      rank: 8,
      playerId: 1758,
      name: 'Patrick Cummins',
      rating: 72.38,
      country: 'Australia',
      flagSrc: '/assets/flags/au.svg',
      team: 'SRH',
      teamLogo: '/assets/teams/user_logos/srh.png',
      photoSrc: '/assets/players/top10/pat-cummins.webp',
    },
    {
      rank: 9,
      playerId: 7920,
      name: 'Nathan Ellis',
      rating: 72.24,
      country: 'Australia',
      flagSrc: '/assets/flags/au.svg',
      team: 'CSK',
      teamLogo: '/assets/teams/user_logos/csk.png',
      photoSrc: '/assets/players/top10/nathan-ellis.png',
    },
    {
      rank: 10,
      playerId: 7327,
      name: 'Rasikh Salam',
      rating: 71.30,
      country: 'India',
      flagSrc: '/assets/flags/in.svg',
      team: 'DC',
      teamLogo: '/assets/teams/user_logos/dc.png',
      photoSrc: '/assets/players/top10/rasikh-salam.webp',
    },
  ];

  const statCards = [
    { label: 'Total Players', value: '959', icon: Users },
    { label: 'Batter Qualifications', value: '155', icon: Target },
    { label: 'Bowler Qualifications', value: '151', icon: Activity },
    { label: 'Role Qualifications', value: '306', icon: Award },
    { label: 'Matches Analysed', value: '883', icon: PlaySquare },
  ];

  const playerPool = activeTab === 'batters' ? allBatters : allBowlers;
  const currentVisiblePlayers = playerPool.slice(page * 5, page * 5 + 5);

  return (
    <div className="w-full bg-white select-none px-6 py-3 box-border font-sans flex-1 flex flex-col justify-between max-w-[1720px] mx-auto min-h-0">
      {/* 1. Hero Section: Height 160px with Smooth Stadium Blend */}
      <section className="relative w-full h-[155px] lg:h-[162px] shrink-0 flex items-center overflow-hidden rounded-2xl bg-white border border-[#E5E6EE] shadow-2xs">
        {/* Right stadium photograph with smooth alpha ramp fade */}
        <div className="absolute right-0 top-0 bottom-0 w-3/5 h-full pointer-events-none select-none flex justify-end">
          <img
            src="/assets/brand/hero-stadium-generated.png"
            alt="IPL Stadium"
            className="h-full w-auto object-cover object-right"
          />
        </div>

        {/* Left Editorial Text */}
        <div className="relative z-10 pl-7 pr-6 py-4 max-w-xl">
          <h1 className="text-[28px] lg:text-[29px] font-extrabold tracking-tight text-[#14213D] leading-tight uppercase font-sans">
            THE INTELLIGENCE
            <br />
            BEHIND <span className="text-[#E60067]">THE AUCTION.</span>
          </h1>
          <p className="text-[13px] font-medium text-slate-500 mt-1">
            Pressure performance. Statistical evidence. Player intelligence.
          </p>
        </div>
      </section>

      {/* 2. Stat Cards (Row of 5): Height 74px with proportional padding */}
      <section className="grid grid-cols-5 gap-3 h-[74px] shrink-0 my-2">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-[#FFF5F8] border border-[#FCE7F0] rounded-xl px-4 py-2 flex items-center gap-3 h-[74px] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.99] motion-reduce:transform-none"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-[#FCE7F0] flex items-center justify-center text-[#E60067] shrink-0 shadow-2xs">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-slate-500 truncate">
                  {item.label}
                </div>
                <div className="text-xl font-black font-sans text-slate-900 tracking-tight tabular-nums mt-0.5">
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Main Dashboard Grid: Left 64%, Right 36% with Identical Bottom Alignment */}
      <section className="flex-1 flex gap-3.5 items-stretch min-h-[460px] pb-1">
        {/* Left: Top 10 Rankings Panel (64% width) */}
        <div className="w-[64%] shrink-0 bg-white border border-[#E5E6EE] rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between h-full">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-1.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-bold text-slate-900">Top 10 Rankings</h2>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('batters');
                    setPage(0);
                  }}
                  className={clsx(
                    'px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all duration-150',
                    activeTab === 'batters'
                      ? 'bg-[#E60067] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Top Batters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('bowlers');
                    setPage(0);
                  }}
                  className={clsx(
                    'px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all duration-150',
                    activeTab === 'bowlers'
                      ? 'bg-[#E60067] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Top Bowlers
                </button>
              </div>

              {/* Ranks 1-5 vs 6-10 Page Toggle */}
              <div className="flex items-center gap-1 bg-slate-100/70 p-0.5 rounded-full text-[10.5px] font-medium text-slate-500">
                <button
                  type="button"
                  onClick={() => setPage(0)}
                  className={clsx(
                    'px-2 py-0.5 rounded-full transition-all',
                    page === 0 ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'hover:text-slate-900'
                  )}
                >
                  1–5
                </button>
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className={clsx(
                    'px-2 py-0.5 rounded-full transition-all',
                    page === 1 ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'hover:text-slate-900'
                  )}
                >
                  6–10
                </button>
              </div>
            </div>

            <Link
              to="/rankings"
              className="text-[11px] font-semibold text-[#E60067] hover:text-[#D8005A] flex items-center gap-1 group transition-colors"
            >
              <span>View Full Rankings</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 5 Player Cards Grid: Fills remaining height perfectly */}
          <div className="grid grid-cols-5 gap-2.5 flex-1 mt-1 min-h-0">
            {currentVisiblePlayers.map((player) => (
              <Link
                key={player.playerId}
                to={`/player/${player.playerId}`}
                className="group bg-[#F8F9FA] border border-slate-200/80 hover:border-[#E60067]/60 rounded-2xl p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:-translate-y-1 active:scale-[0.99] transition-all duration-150 ease-out h-full motion-reduce:transform-none"
              >
                {/* Card Top: Rank & National Flag */}
                <div className="flex items-center justify-between shrink-0 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold text-[#E60067] border border-[#FCE7F0] bg-white">
                    #{player.rank}
                  </span>
                  <img
                    src={player.flagSrc}
                    alt={player.country}
                    title={player.country}
                    className="w-5 h-3.5 object-cover rounded-xs border border-slate-200 shadow-2xs"
                  />
                </div>

                {/* Card Middle: Proportional Portrait Container (Direct on soft gray card) */}
                <div className="w-full flex-1 flex items-end justify-center min-h-[145px] max-h-[210px] overflow-hidden my-1">
                  <PlayerPortrait
                    imageSrc={player.photoSrc}
                    playerName={player.name}
                    className="w-full h-full"
                  />
                </div>

                {/* Player Name */}
                <div className="text-center px-0.5 shrink-0 my-0.5">
                  <div className="font-bold text-[12px] text-slate-900 leading-tight line-clamp-1 group-hover:text-[#E60067] transition-colors">
                    {player.name}
                  </div>
                </div>

                {/* Team Logo */}
                <div className="h-6 flex items-center justify-center shrink-0 my-0.5">
                  <img
                    src={player.teamLogo}
                    alt={player.team}
                    className="h-5 w-auto max-w-[44px] object-contain drop-shadow-2xs"
                  />
                </div>

                {/* Card Bottom: Pressure Rating Pill */}
                <div className="bg-[#FFF0F5] rounded-xl py-1.5 px-1 text-center border border-[#FCE7F0] shrink-0">
                  <div className="text-[8.5px] font-semibold text-slate-500 uppercase tracking-wider">
                    Pressure Rating
                  </div>
                  <div className="text-base font-black text-[#E60067] tabular-nums mt-0.5">
                    {player.rating.toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Model Performance & Key Takeaways (36% width) - Exactly matching Left Column Height */}
        <div className="w-[36%] shrink-0 flex flex-col justify-between h-full gap-2.5">
          {/* Card 1: Model Performance */}
          <div className="bg-white border border-[#E5E6EE] rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between flex-[1.3] min-h-[265px]">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#E60067]" />
                <h2 className="text-sm font-bold text-slate-900">Model Performance</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Task-Specific Validation</span>
            </div>

            <div className="space-y-2 my-auto">
              {/* Batter Model */}
              <div className="bg-[#F8F9FA] rounded-xl px-3 py-2 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Batter Model</div>
                  <div className="text-[10px] text-slate-400">Global baseline: 1.5548</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[8.5px] uppercase font-bold text-slate-400">Log Loss</div>
                    <span className="text-xs font-black font-sans tabular-nums text-slate-900">1.5131</span>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Lower than baseline
                  </span>
                </div>
              </div>

              {/* Bowler Model */}
              <div className="bg-[#F8F9FA] rounded-xl px-3 py-2 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Bowler Model</div>
                  <div className="text-[10px] text-slate-400">Global baseline: 1.6893</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[8.5px] uppercase font-bold text-slate-400">Log Loss</div>
                    <span className="text-xs font-black font-sans tabular-nums text-slate-900">1.6427</span>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Lower than baseline
                  </span>
                </div>
              </div>

              {/* Chase Win Probability */}
              <div className="bg-[#F8F9FA] rounded-xl px-3 py-2 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Chase Win Probability</div>
                  <div className="text-[10px] text-slate-400">Threshold: ≤ 0.0400</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[8.5px] uppercase font-bold text-slate-400">ECE</div>
                    <span className="text-xs font-black font-sans tabular-nums text-slate-900">0.0905</span>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Calibration requires improvement
                  </span>
                </div>
              </div>
            </div>

            {/* Footnote */}
            <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[9.5px] text-slate-400 shrink-0">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Model performance metrics are task-specific. Predictive loss and calibration are reported separately.</span>
            </div>
          </div>

          {/* Card 2: Key Insights - Aligns with bottom of Left Column */}
          <div className="bg-white border border-[#E5E6EE] rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between flex-1 min-h-[195px]">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#E60067]" />
                <h2 className="text-sm font-bold text-slate-900">Key Insights</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Phase 04/05 Release</span>
            </div>

            <div className="space-y-2 my-auto text-[11.5px] text-slate-700 leading-snug">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E60067] shrink-0" />
                <span>
                  <strong className="text-slate-900 font-bold">Pathum Nissanka</strong> leads the frozen batter rankings.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E60067] shrink-0" />
                <span>
                  <strong className="text-slate-900 font-bold">Matheesha Pathirana</strong> leads the frozen bowler rankings.
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E60067] shrink-0" />
                <span>
                  <strong className="text-slate-900 font-bold">11 Hidden Gems</strong> identified — 10 batters and 1 bowler.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E60067] shrink-0" />
                <span>
                  <strong className="text-slate-900 font-bold">IPL–T20I transferability:</strong> ρ = +0.64; disattenuated estimate = +0.78.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
