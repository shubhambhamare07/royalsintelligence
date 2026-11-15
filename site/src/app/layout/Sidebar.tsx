import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  Award,
  GitCompare,
  Dna,
  BookOpen,
  Activity,
  Globe,
  Gem,
  PlaySquare,
  Sliders,
  Cpu,
  Crosshair,
  ShieldCheck,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface SidebarProps {
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navItems: NavItem[] = [
    { label: 'Executive Home', path: '/', icon: Home },
    { label: 'Player Directory', path: '/players', icon: Users },
    { label: 'Pressure Rankings', path: '/rankings', icon: Award },
    { label: 'Comparison Matrix', path: '/compare', icon: GitCompare },
    { label: 'Pressure DNA', path: '/dna', icon: Dna },
    { label: 'Methodology Explorer', path: '/methodology', icon: BookOpen },
    { label: 'Sensitivity Lab', path: '/lab', icon: Activity },
    { label: 'Transferability', path: '/transferability', icon: Globe },
    { label: 'Hidden Gems', path: '/gems', icon: Gem },
    { label: 'Match Centre', path: '/matches', icon: PlaySquare },
    { label: 'Match Simulator', path: '/simulator', icon: Sliders },
    { label: 'Golden Parity', path: '/simulator/golden', icon: Cpu },
    { label: 'Anomaly Engine', path: '/anomalies', icon: Crosshair },
    { label: 'Model Validation', path: '/validation', icon: ShieldCheck },
  ];

  return (
    <aside className="w-[225px] h-screen bg-white text-slate-800 flex flex-col justify-between border-r border-[#E5E6EE] shrink-0 select-none">
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* Official Rajasthan Royals Branding Header */}
        <div className="h-[56px] px-3.5 flex items-center gap-2.5 border-b border-[#E5E6EE] sticky top-0 bg-white z-10">
          <img
            src="/assets/brand/rajasthan-royals-official.png"
            alt="Rajasthan Royals Official Crest"
            className="h-8 w-auto object-contain shrink-0 drop-shadow-2xs"
          />
          <div className="min-w-0">
            <div className="font-extrabold text-[13px] tracking-wide text-slate-900 flex items-center gap-1 leading-tight truncate">
              <span>ROYALS</span>
              <span className="text-[#E60067]">INTELLIGENCE</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-tight truncate">
              SupeRR Selector · Season 02
            </div>
          </div>
        </div>

        {/* 16 Navigation Links in Required Order */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium h-[38px] transition-all duration-150 ease-out active:scale-[0.98] motion-reduce:transform-none select-none',
                    isActive
                      ? 'bg-gradient-to-r from-[#E60067] to-[#D8005A] text-white font-semibold shadow-2xs'
                      : 'text-[#14213D] hover:text-slate-900 hover:bg-slate-50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={clsx('w-[18px] h-[18px] shrink-0', isActive ? 'text-white' : 'text-slate-500')} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
