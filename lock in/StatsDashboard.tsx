import React, { useState } from 'react';
import { BarChart2, Flame, Award, Calendar, CheckCircle, Clock, Zap, TrendingUp, History } from 'lucide-react';
import { CompletedLogEntry, DayRecord, LifeRPGState } from '../types';
import { getTodayDateString } from '../utils/storage';

interface StatsDashboardProps {
  state: LifeRPGState;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ state }) => {
  const [activeView, setActiveView] = useState<'weekly' | 'history'>('weekly');
  const today = getTodayDateString();

  // Compute last 7 days metrics
  const last7Days: { date: string; label: string; xp: number; questsDone: number; totalQuests: number; percentage: number }[] = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = getTodayDateString(d);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    let xp = 0;
    let questsDone = 0;
    let total = 0;
    let percentage = 0;

    if (dateStr === today) {
      xp = state.dailyXPEarned;
      questsDone = state.quests.filter(q => q.completed).length;
      total = state.quests.length;
      percentage = total > 0 ? Math.round((questsDone / total) * 100) : 0;
    } else if (state.history[dateStr]) {
      const rec = state.history[dateStr];
      xp = rec.dailyXPEarned;
      questsDone = rec.completedCount;
      total = rec.totalQuests;
      percentage = rec.completionPercentage;
    }

    last7Days.push({
      date: dateStr,
      label: dayLabel,
      xp,
      questsDone,
      totalQuests: total,
      percentage,
    });
  }

  const maxXp = Math.max(100, ...last7Days.map(d => d.xp));
  const weekTotalXp = last7Days.reduce((acc, curr) => acc + curr.xp, 0);
  const weekQuestsDone = last7Days.reduce((acc, curr) => acc + curr.questsDone, 0);
  const totalDaysActive = Object.keys(state.history).length + (state.dailyXPEarned > 0 ? 1 : 0);

  return (
    <div className="space-y-6">
      
      {/* Top Stat Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="rounded-2xl bg-[#090e1f] border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Streak</span>
            <Flame className={`w-4 h-4 ${state.currentStreak > 0 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-600'}`} />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
            {state.currentStreak} <span className="text-sm font-medium text-slate-400">days</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Longest record: {state.longestStreak} days
          </span>
        </div>

        <div className="rounded-2xl bg-[#090e1f] border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">7-Day XP Total</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300 tabular-nums">
            {weekTotalXp.toLocaleString()} <span className="text-sm font-medium text-slate-400">XP</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Avg: {Math.round(weekTotalXp / 7)} XP / day
          </span>
        </div>

        <div className="rounded-2xl bg-[#090e1f] border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quests This Week</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tabular-nums">
            {weekQuestsDone} <span className="text-sm font-medium text-slate-400">cleared</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {state.completedLogs.length} all-time quests
          </span>
        </div>

        <div className="rounded-2xl bg-[#090e1f] border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lifetime XP</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300 tabular-nums">
            {state.lifetimeXP.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalDaysActive} recorded active days
          </span>
        </div>

      </div>

      {/* Sub-Tabs: 7-Day Performance vs Quest Log */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('weekly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeView === 'weekly'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly XP Chart
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeView === 'history'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Activity Log ({state.completedLogs.length})
          </button>
        </div>
      </div>

      {/* Weekly Visual Chart */}
      {activeView === 'weekly' ? (
        <div className="rounded-3xl bg-[#090e1f] border border-slate-800 p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white">7-Day Daily XP History</h4>
              <p className="text-xs text-slate-400">Visual breakdown of daily XP accumulation and completion rate</p>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-8 pb-2 border-b border-slate-800/80">
            {last7Days.map((day, idx) => {
              const heightPercent = Math.max(8, Math.round((day.xp / maxXp) * 100));
              const isToday = day.date === today;

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300 pointer-events-none whitespace-nowrap shadow-lg">
                    +{day.xp} XP ({day.questsDone} done)
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-slate-950 rounded-xl overflow-hidden p-[2px] h-full flex flex-col justify-end">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-cyan-600 via-sky-400 to-emerald-400 glow-cyan'
                          : day.xp > 0
                          ? 'bg-gradient-to-t from-blue-700 to-cyan-500'
                          : 'bg-slate-800/60'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Day label */}
                  <div className="mt-3 text-center">
                    <span className={`block text-xs font-semibold ${isToday ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                      {day.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                      +{day.xp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend and Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Active XP
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Today's Momentum
              </span>
            </div>
            <span>Calculated every midnight automatically</span>
          </div>
        </div>
      ) : (
        /* Completed Quest Activity History Log */
        <div className="rounded-3xl bg-[#090e1f] border border-slate-800 p-5 sm:p-6">
          <h4 className="text-base font-bold text-white mb-1">Quest Log Timeline</h4>
          <p className="text-xs text-slate-400 mb-4">Complete log of all verified completions across your life journey</p>

          {state.completedLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No quests recorded yet. Check off your first daily quest to start your timeline!</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {[...state.completedLogs].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-sm font-semibold text-slate-200 truncate">{entry.questTitle}</h5>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="capitalize text-cyan-400 font-semibold">{entry.category}</span>
                        {entry.discipline && (
                          <>
                            <span>·</span>
                            <span className="capitalize">{entry.discipline}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{new Date(entry.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>·</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 shrink-0 tabular-nums">
                    +{entry.xp} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
