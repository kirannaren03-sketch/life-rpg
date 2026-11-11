import React from 'react';
import { Check, Edit3, Trash2, Bookmark, BookOpen, Dumbbell, Brain, Sparkles, User, Tag, Crown } from 'lucide-react';
import { Quest, QuestCategory, QuestDiscipline } from '../types';
import { getCategoryMetadata, getDisciplineMetadata } from '../utils/constants';

interface QuestItemProps {
  quest: Quest;
  onToggle: (questId: string) => void;
  onEdit: (quest: Quest) => void;
  onDelete: (questId: string) => void;
  onSaveAsTemplate?: (quest: Quest) => void;
}

export const QuestItem: React.FC<QuestItemProps> = ({
  quest,
  onToggle,
  onEdit,
  onDelete,
  onSaveAsTemplate,
}) => {
  const catMeta = getCategoryMetadata(quest.category);
  const discMeta = getDisciplineMetadata(quest.discipline);

  const getDisciplineIcon = (discipline?: QuestDiscipline) => {
    switch (discipline) {
      case 'study':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'fitness':
        return <Dumbbell className="w-3.5 h-3.5" />;
      case 'reading':
        return <Brain className="w-3.5 h-3.5" />;
      case 'mindset':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'life':
        return <User className="w-3.5 h-3.5" />;
      default:
        return <Tag className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className={`group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
        quest.completed
          ? 'bg-[#08151f]/60 border-emerald-500/40 shadow-sm'
          : quest.category === 'main'
          ? 'bg-[#121626]/90 border-amber-500/30 hover:border-amber-500/50 shadow-md'
          : 'bg-[#080d1e]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#0a1126]'
      }`}
    >
      {/* 44x44px Touch Target Checkbox */}
      <div className="shrink-0 pt-0.5">
        <button
          type="button"
          onClick={() => onToggle(quest.id)}
          className="min-h-[44px] min-w-[44px] -m-2 flex items-center justify-center focus:outline-none"
          aria-label={quest.completed ? `Mark ${quest.title} incomplete` : `Mark ${quest.title} complete`}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
              quest.completed
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40 glow-emerald scale-105'
                : 'border-2 border-slate-600 bg-slate-950/80 group-hover:border-cyan-400'
            }`}
          >
            {quest.completed && <Check className="w-4 h-4 stroke-[3]" />}
          </div>
        </button>
      </div>

      {/* Quest Content */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onToggle(quest.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(quest.id);
          }
        }}
      >
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          {/* Quest Category Badge (Daily / Weekly / Monthly / Main / Side) */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${catMeta.badgeBg} ${catMeta.badgeText} ${catMeta.badgeBorder}`}
          >
            {quest.category === 'main' && <Crown className="w-3 h-3 text-amber-400" />}
            <span>{catMeta.label}</span>
          </span>

          {/* Discipline Tag */}
          {quest.discipline && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 ${discMeta.badgeText}`}
            >
              {getDisciplineIcon(quest.discipline)}
              <span className="capitalize">{discMeta.label}</span>
            </span>
          )}

          {/* XP Reward Badge */}
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border tabular-nums ${
              quest.completed
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
            }`}
          >
            +{quest.xp} XP
          </span>

          {quest.category === 'main' && !quest.completed && (
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider ml-auto hidden sm:inline">
              Active Milestone
            </span>
          )}
        </div>

        <h4
          className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${
            quest.completed ? 'text-slate-400 line-through decoration-emerald-500/60' : 'text-slate-100'
          }`}
        >
          {quest.title}
        </h4>

        {quest.description && (
          <p
            className={`text-xs mt-1 line-clamp-2 transition-colors ${
              quest.completed ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {quest.description}
          </p>
        )}
      </div>

      {/* Action Buttons: Save Template, Edit, Delete */}
      <div className="flex items-center gap-1 shrink-0 pt-0.5 opacity-90 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
        {onSaveAsTemplate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSaveAsTemplate(quest);
            }}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
            title="Save as reusable template"
            aria-label="Save as template"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(quest);
          }}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
          title="Edit Quest"
          aria-label="Edit Quest"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(quest.id);
          }}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          title="Delete Quest"
          aria-label="Delete Quest"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
