import React from 'react';
import { Volume2, VolumeX, Flame, Shield, CheckSquare, BarChart3, Award, Settings } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: 'quests' | 'stats' | 'achievements' | 'settings';
  setActiveTab: (tab: 'quests' | 'stats' | 'achievements' | 'settings') => void;
  streak: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  level: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streak,
  soundEnabled,
  onToggleSound,
  level,
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#060913]/90 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Zone 1: Single Brand Mark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#070b18] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 whitespace-nowrap">
                LIFE RPG
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-bold tabular-nums">
                LVL {level}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Desktop/Tablet) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('quests')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'quests'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Quests</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistics</span>
            </button>

            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'achievements'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Milestones</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Zone 3: Quick Status & Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Streak flame */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors border ${
                streak > 0
                  ? 'bg-amber-950/40 border-amber-600/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={`${streak}-day streak`}
            >
              <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-600'}`} />
              <span className="tabular-nums">{streak}d</span>
            </div>

            {/* Sound toggle */}
            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg border text-xs transition ${
                soundEnabled
                  ? 'border-cyan-500/30 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-950/60'
                  : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />
          </div>

        </div>
      </header>

      {/* Mobile Ergonomic Bottom Tab Bar (thumb zone navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060913]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5">
        <div className="grid grid-cols-4 items-center gap-1">
          <button
            onClick={() => setActiveTab('quests')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'quests'
                ? 'text-cyan-400 font-semibold bg-cyan-950/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Quests</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'stats'
                ? 'text-cyan-400 font-semibold bg-cyan-950/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'achievements'
                ? 'text-cyan-400 font-semibold bg-cyan-950/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Badges</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'settings'
                ? 'text-cyan-400 font-semibold bg-cyan-950/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};
