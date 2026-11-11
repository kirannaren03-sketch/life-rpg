import React from 'react';
import { Shield, Sparkles, Zap, Award, Target, BookOpen, Dumbbell, HeartPulse, Brain } from 'lucide-react';
import { CompletedLogEntry } from '../types';

interface PlayerProfileCardProps {
  playerName: string;
  playerTitle: string;
  lifetimeXP: number;
  dailyXPEarned: number;
  totalCompletedQuests: number;
  completedLogs: CompletedLogEntry[];
}

export const PlayerProfileCard: React.FC<PlayerProfileCardProps> = ({
  playerName,
  playerTitle,
  lifetimeXP,
  dailyXPEarned,
  totalCompletedQuests,
  completedLogs,
}) => {
  // Progression rules: every 100 lifetime XP increases level by one
  const currentLevel = Math.floor(lifetimeXP / 100) + 1;
  const currentLevelXP = lifetimeXP % 100;
  const xpNeeded = 100 - currentLevelXP;
  const progressPercent = Math.min(100, Math.max(0, currentLevelXP));

  // Compute RPG Attributes from completed quests logs
  const studyQuests = completedLogs.filter(l => l.discipline === 'study' || (l as any).category === 'study').length;
  const fitnessQuests = completedLogs.filter(l => l.discipline === 'fitness' || (l as any).category === 'fitness').length;
  const readingQuests = completedLogs.filter(l => l.discipline === 'reading' || (l as any).category === 'reading').length;
  const mindsetQuests = completedLogs.filter(l => l.discipline === 'mindset' || l.discipline === 'life' || (l as any).category === 'mindset' || (l as any).category === 'life').length;

  const wisdom = 10 + studyQuests * 2 + readingQuests * 2;
  const strength = 10 + fitnessQuests * 3;
  const vitality = 10 + mindsetQuests * 2 + Math.floor(totalCompletedQuests * 0.5);
  const focus = 10 + Math.floor(lifetimeXP / 50);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#090e1f]/90 border border-slate-800/90 p-5 sm:p-6 shadow-2xl">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top Profile Summary */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {/* Hexagonal Level Ring */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-emerald-400 p-[2px] shadow-lg shadow-cyan-500/30">
              <div className="w-full h-full rounded-[14px] bg-[#070c1b] flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LVL</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 tabular-nums">
                  {currentLevel}
                </span>
              </div>
            </div>
            {/* Crown or Sparkle indicator */}
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-cyan-500 text-slate-950 shadow-md">
              <Shield className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                {playerName}
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium text-cyan-400 flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{playerTitle}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Lifetime Highlights */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 px-3.5 py-2.5 text-center min-w-[90px]">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Lifetime XP</span>
            <span className="text-base sm:text-lg font-black font-mono text-cyan-300 tabular-nums">
              {lifetimeXP.toLocaleString()}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 px-3.5 py-2.5 text-center min-w-[90px]">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Today XP</span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-400 tabular-nums">
              +{dailyXPEarned}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 px-3.5 py-2.5 text-center min-w-[90px]">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cleared</span>
            <span className="text-base sm:text-lg font-black font-mono text-slate-200 tabular-nums">
              {totalCompletedQuests}
            </span>
          </div>
        </div>

      </div>

      {/* Level XP Bar Section */}
      <div className="relative z-10 pt-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Level {currentLevel} Progress</span>
          </div>
          <div className="font-mono text-slate-400">
            <span className="text-cyan-300 font-bold tabular-nums">{currentLevelXP}</span> / 100 XP
            <span className="text-slate-500 ml-2">({xpNeeded} XP to Level {currentLevel + 1})</span>
          </div>
        </div>

        {/* Glowing Progress Bar */}
        <div className="relative w-full h-3.5 bg-slate-950/90 rounded-full overflow-hidden p-[2px] border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-500 ease-out relative glow-cyan"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Shimmer line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      {/* RPG Character Attributes */}
      <div className="relative z-10 mt-5 pt-4 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-tight">Wisdom</span>
            <span className="text-xs font-bold font-mono text-slate-200 tabular-nums">{wisdom}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-tight">Strength</span>
            <span className="text-xs font-bold font-mono text-slate-200 tabular-nums">{strength}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <HeartPulse className="w-4 h-4 text-purple-400" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-tight">Vitality</span>
            <span className="text-xs font-bold font-mono text-slate-200 tabular-nums">{vitality}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-tight">Focus</span>
            <span className="text-xs font-bold font-mono text-slate-200 tabular-nums">{focus}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
