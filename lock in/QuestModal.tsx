import React, { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen, Dumbbell, Brain, User, Tag, Calendar, Clock, Crown, Compass } from 'lucide-react';
import { Quest, QuestCategory, QuestDiscipline } from '../types';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questData: {
    id?: string;
    title: string;
    description?: string;
    xp: number;
    category: QuestCategory;
    discipline?: QuestDiscipline;
    saveAsTemplate?: boolean;
  }) => void;
  initialQuest?: Quest | null;
  defaultCategory?: QuestCategory;
}

const CATEGORY_OPTIONS: { id: QuestCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'daily', label: 'Daily', icon: <Clock className="w-3.5 h-3.5" />, desc: 'Does not auto-repeat. Add each day.' },
  { id: 'weekly', label: 'Weekly', icon: <Calendar className="w-3.5 h-3.5" />, desc: 'Resets at start of each week.' },
  { id: 'monthly', label: 'Monthly', icon: <Compass className="w-3.5 h-3.5" />, desc: 'Resets at start of each month.' },
  { id: 'main', label: 'Main Quest', icon: <Crown className="w-3.5 h-3.5" />, desc: 'Remains active until completed.' },
  { id: 'side', label: 'Side Quest', icon: <Sparkles className="w-3.5 h-3.5" />, desc: 'One-off bonus challenges.' },
];

const DISCIPLINE_OPTIONS: { id: QuestDiscipline; label: string; icon: React.ReactNode }[] = [
  { id: 'study', label: 'Study', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'fitness', label: 'Fitness', icon: <Dumbbell className="w-3.5 h-3.5" /> },
  { id: 'reading', label: 'Reading', icon: <Brain className="w-3.5 h-3.5" /> },
  { id: 'mindset', label: 'Mindset', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'life', label: 'Life', icon: <User className="w-3.5 h-3.5" /> },
  { id: 'custom', label: 'Other', icon: <Tag className="w-3.5 h-3.5" /> },
];

const XP_PRESETS: Record<QuestCategory, number[]> = {
  daily: [15, 20, 25, 30, 40, 50],
  weekly: [40, 50, 60, 75, 100, 150],
  monthly: [100, 150, 200, 250, 300, 500],
  main: [150, 200, 300, 400, 500, 1000],
  side: [15, 25, 35, 50, 75, 100],
};

export const QuestModal: React.FC<QuestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuest,
  defaultCategory = 'daily',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>(defaultCategory);
  const [discipline, setDiscipline] = useState<QuestDiscipline>('study');
  const [xp, setXp] = useState<number>(20);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [customXpMode, setCustomXpMode] = useState(false);

  useEffect(() => {
    if (initialQuest) {
      setTitle(initialQuest.title);
      setDescription(initialQuest.description || '');
      setCategory(initialQuest.category);
      setDiscipline(initialQuest.discipline || 'study');
      setXp(initialQuest.xp);
      setSaveAsTemplate(false);
      const presets = XP_PRESETS[initialQuest.category] || XP_PRESETS.daily;
      setCustomXpMode(!presets.includes(initialQuest.xp));
    } else {
      setTitle('');
      setDescription('');
      setCategory(defaultCategory);
      setDiscipline('study');
      const defaultXp = defaultCategory === 'main' ? 200 : defaultCategory === 'monthly' ? 150 : defaultCategory === 'weekly' ? 60 : 20;
      setXp(defaultXp);
      setSaveAsTemplate(false);
      setCustomXpMode(false);
    }
  }, [initialQuest, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const currentPresets = XP_PRESETS[category] || XP_PRESETS.daily;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialQuest?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      xp: Math.max(5, Math.min(2000, xp || 20)),
      category,
      discipline,
      saveAsTemplate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#090e1f] border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">
          {initialQuest ? 'Edit Quest' : 'Create Quest'}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Assign real-world challenges to Daily, Weekly, Monthly, Main, or Side quests.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Category Picker (The 5 Categories) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Quest Category <span className="text-cyan-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    if (!initialQuest) {
                      const newDefault = cat.id === 'main' ? 250 : cat.id === 'monthly' ? 150 : cat.id === 'weekly' ? 60 : 20;
                      setXp(newDefault);
                    }
                  }}
                  className={`flex flex-col items-start p-2.5 rounded-xl text-left border transition ${
                    category === cat.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {cat.icon}
                    <span>{cat.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Quest Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., SST Written Work, Gym Bench Press, Read 30 mins..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description or Objective <span className="text-slate-500">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Focus on chapter summary, problem formulas, active recall..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
            />
          </div>

          {/* Discipline / Domain Tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Discipline Focus
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {DISCIPLINE_OPTIONS.map((disc) => (
                <button
                  key={disc.id}
                  type="button"
                  onClick={() => setDiscipline(disc.id)}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-medium border transition ${
                    discipline === disc.id
                      ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {disc.icon}
                  <span className="truncate">{disc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* XP Rewards */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                XP Reward
              </label>
              <button
                type="button"
                onClick={() => setCustomXpMode(!customXpMode)}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                {customXpMode ? 'Use Presets' : 'Custom Amount'}
              </button>
            </div>

            {customXpMode ? (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="5"
                  max="2000"
                  step="5"
                  value={xp}
                  onChange={(e) => setXp(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-sm font-bold text-slate-400">XP</span>
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-1.5">
                {currentPresets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setXp(val)}
                    className={`py-2 rounded-xl font-mono text-xs font-bold border transition ${
                      xp === val
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Option to also save as template */}
          {!initialQuest && (
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Save this quest into reusable templates for future manual reuse</span>
              </label>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition"
            >
              {initialQuest ? 'Save Changes' : 'Create Quest'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
