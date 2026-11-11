import React from 'react';
import { Award, Zap, Shield, CheckCircle2, BookOpen, Dumbbell, Brain, Flame, Trophy, Crown, Target, Sparkles, Lock } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsViewProps {
  achievements: Achievement[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const renderIcon = (name: string, unlocked: boolean) => {
    const props = { className: `w-5 h-5 ${unlocked ? 'text-amber-300' : 'text-slate-500'}` };
    switch (name) {
      case 'Zap':
        return <Zap {...props} />;
      case 'Shield':
        return <Shield {...props} />;
      case 'Award':
        return <Award {...props} />;
      case 'CheckCircle2':
        return <CheckCircle2 {...props} />;
      case 'BookOpen':
        return <BookOpen {...props} />;
      case 'Dumbbell':
        return <Dumbbell {...props} />;
      case 'Brain':
        return <Brain {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Trophy':
        return <Trophy {...props} />;
      case 'Crown':
        return <Crown {...props} />;
      case 'Target':
        return <Target {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      default:
        return <Award {...props} />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0d152c] to-[#091124] border border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Milestones & Achievements</h3>
          </div>
          <p className="text-xs text-slate-400">
            Accomplish real-life consistency milestones to unlock prestige badges and bonus XP.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-slate-950/70 border border-slate-800/80 px-4 py-3 rounded-2xl">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Unlocked</span>
            <span className="text-lg font-mono font-black text-amber-400 tabular-nums">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-white">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {achievements.map((ach) => {
          const percent = Math.min(100, Math.round((ach.currentValue / ach.requirement) * 100));

          return (
            <div
              key={ach.id}
              className={`relative overflow-hidden rounded-2xl p-4 border transition-all ${
                ach.unlocked
                  ? 'bg-[#0b1329] border-amber-500/40 shadow-lg shadow-amber-500/5 glow-emerald'
                  : 'bg-[#080d1e]/70 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Badge Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                    ach.unlocked
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {ach.unlocked ? renderIcon(ach.iconName, true) : <Lock className="w-5 h-5 text-slate-500" />}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className={`text-sm font-bold truncate ${ach.unlocked ? 'text-white' : 'text-slate-300'}`}>
                      {ach.title}
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-cyan-400 shrink-0 tabular-nums">
                      +{ach.rewardXP} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {ach.description}
                  </p>

                  {/* Progress info */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-slate-400">
                      <span>{ach.unlocked ? 'Completed' : 'In Progress'}</span>
                      <span className="tabular-nums">
                        {Math.min(ach.currentValue, ach.requirement)} / {ach.requirement}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          ach.unlocked
                            ? 'bg-amber-400'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {ach.unlocked && ach.unlockedAt && (
                    <span className="text-[10px] text-emerald-400 font-medium block mt-2">
                      Unlocked on {new Date(ach.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
