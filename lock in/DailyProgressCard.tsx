import React from 'react';
import { CheckCircle2, CircleDashed, Flame, Sparkles, TrendingUp } from 'lucide-react';

interface DailyProgressCardProps {
  totalQuests: number;
  completedQuests: number;
  dailyXPEarned: number;
  categoryLabel?: string;
}

export const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  totalQuests,
  completedQuests,
  dailyXPEarned,
  categoryLabel = 'Daily',
}) => {
  const percentage = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
  const remaining = Math.max(0, totalQuests - completedQuests);
  const isAllComplete = totalQuests > 0 && remaining === 0;

  return (
    <div className={`relative overflow-hidden rounded-3xl p-5 border transition-all ${
      isAllComplete
        ? 'bg-gradient-to-br from-[#061e19] via-[#09182b] to-[#071120] border-emerald-500/50 glow-emerald'
        : 'bg-[#090e1f]/80 border-slate-800/80 shadow-xl'
    }`}>
      {/* Background radial accent */}
      <div className={`pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full blur-2xl ${
        isAllComplete ? 'bg-emerald-500/20' : 'bg-cyan-500/10'
      }`} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Summary text */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daily Mission Status
            </span>
            {isAllComplete && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <Sparkles className="w-3 h-3" />
                100% Cleared!
              </span>
            )}
          </div>
          
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
              {percentage}%
            </h3>
            <span className="text-sm font-medium text-slate-400">
              {completedQuests} of {totalQuests} quests finished
            </span>
          </div>

          <p className="text-xs text-slate-400">
            {isAllComplete ? (
              <span className="text-emerald-400 font-semibold">
                Daily Victory Achieved! All objectives logged. Consistency maintained.
              </span>
            ) : (
              <span>
                <strong className="text-cyan-300 tabular-nums">{remaining}</strong> {remaining === 1 ? 'quest' : 'quests'} remaining today · <strong className="text-emerald-400 tabular-nums">+{dailyXPEarned} XP</strong> earned so far
              </span>
            )}
          </p>
        </div>

        {/* Right: Circular / Gauge or Visual Progress stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 px-4 py-2.5">
            <CheckCircle2 className={`w-5 h-5 ${completedQuests > 0 ? 'text-emerald-400' : 'text-slate-600'}`} />
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Done</span>
              <span className="text-base font-bold font-mono text-white tabular-nums">{completedQuests}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 px-4 py-2.5">
            <CircleDashed className={`w-5 h-5 ${remaining > 0 ? 'text-amber-400' : 'text-slate-600'}`} />
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Left</span>
              <span className="text-base font-bold font-mono text-white tabular-nums">{remaining}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 px-4 py-2.5">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Earned</span>
              <span className="text-base font-bold font-mono text-cyan-300 tabular-nums">+{dailyXPEarned}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Progress Line Bar */}
      <div className="relative z-10 mt-4 w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isAllComplete
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 glow-emerald'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

    </div>
  );
};
