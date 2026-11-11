import React, { useState } from 'react';
import { X, Plus, Bookmark, Check, Trash2, Zap, Sparkles } from 'lucide-react';
import { QuestCategory, QuestDiscipline, QuestTemplate } from '../types';
import { getCategoryMetadata, getDisciplineMetadata } from '../utils/constants';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: QuestTemplate[];
  onUseTemplate: (template: QuestTemplate) => void;
  onUseAllDailyTemplates: () => void;
  onCreateTemplate: (template: Omit<QuestTemplate, 'id'>) => void;
  onDeleteTemplate: (templateId: string) => void;
  initialCategory?: QuestCategory;
}

const CATEGORY_OPTIONS: { id: QuestCategory; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'main', label: 'Main Quest' },
  { id: 'side', label: 'Side Quest' },
];

const DISCIPLINE_OPTIONS: { id: QuestDiscipline; label: string }[] = [
  { id: 'study', label: 'Study' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'reading', label: 'Reading' },
  { id: 'mindset', label: 'Mindset' },
  { id: 'life', label: 'Life' },
];

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  onUseTemplate,
  onUseAllDailyTemplates,
  onCreateTemplate,
  onDeleteTemplate,
  initialCategory = 'daily',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | QuestCategory>(initialCategory);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newXp, setNewXp] = useState(20);
  const [newCategory, setNewCategory] = useState<QuestCategory>(initialCategory);
  const [newDiscipline, setNewDiscipline] = useState<QuestDiscipline>('study');
  const [usedTemplateIds, setUsedTemplateIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const dailyTemplates = templates.filter(t => t.category === 'daily');

  const handleApply = (tmpl: QuestTemplate) => {
    onUseTemplate(tmpl);
    setUsedTemplateIds(prev => ({ ...prev, [tmpl.id]: true }));
    setTimeout(() => {
      setUsedTemplateIds(prev => ({ ...prev, [tmpl.id]: false }));
    }, 1500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateTemplate({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      xp: Math.max(5, newXp || 20),
      category: newCategory,
      discipline: newDiscipline,
    });

    setNewTitle('');
    setNewDescription('');
    setNewXp(20);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#090e1f] border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bookmark className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Quest Templates</h3>
            </div>
            <p className="text-xs text-slate-400">
              Instantly load saved responsibilities into today’s quests or add custom reusable routines.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Batch Actions for Daily */}
        {dailyTemplates.length > 0 && (
          <div className="py-3 shrink-0 flex items-center justify-between gap-3 bg-cyan-950/20 border-b border-slate-800 px-1">
            <span className="text-xs text-slate-300 font-medium">
              Start your day fast: Load all {dailyTemplates.length} default daily quests
            </span>
            <button
              onClick={() => {
                onUseAllDailyTemplates();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Load All Daily</span>
            </button>
          </div>
        )}

        {/* Filter Bar & Create Button */}
        <div className="flex items-center justify-between gap-2 py-3 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({templates.length})
            </button>
            {CATEGORY_OPTIONS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCreating ? 'Close Form' : 'New Template'}</span>
          </button>
        </div>

        {/* Create Form (collapsible) */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="p-4 mb-3 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Saved Template</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Quest title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="Description (optional)..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as QuestCategory)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>

              <select
                value={newDiscipline}
                onChange={(e) => setNewDiscipline(e.target.value as QuestDiscipline)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
              >
                {DISCIPLINE_OPTIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">XP:</span>
                <input
                  type="number"
                  min="5"
                  max="500"
                  step="5"
                  value={newXp}
                  onChange={(e) => setNewXp(parseInt(e.target.value, 10) || 20)}
                  className="w-16 px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-mono"
                />
              </div>

              <button
                type="submit"
                className="ml-auto px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition"
              >
                Save Template
              </button>
            </div>
          </form>
        )}

        {/* Scrollable Templates List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No templates found in this category. Click "New Template" to save one!
            </div>
          ) : (
            filteredTemplates.map(tmpl => {
              const catMeta = getCategoryMetadata(tmpl.category);
              const discMeta = getDisciplineMetadata(tmpl.discipline);
              const isAdded = usedTemplateIds[tmpl.id];

              return (
                <div
                  key={tmpl.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catMeta.badgeBg} ${catMeta.badgeText} ${catMeta.badgeBorder}`}>
                        {catMeta.label}
                      </span>
                      {tmpl.discipline && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${discMeta.badgeBg} ${discMeta.badgeText}`}>
                          {discMeta.label}
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-cyan-300 tabular-nums">
                        +{tmpl.xp} XP
                      </span>
                    </div>

                    <h5 className="text-sm font-semibold text-slate-200 truncate">
                      {tmpl.title}
                    </h5>

                    {tmpl.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {tmpl.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApply(tmpl)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isAdded
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Use</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteTemplate(tmpl.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
                      title="Delete Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 shrink-0 flex items-center justify-between text-xs text-slate-400">
          <span>Clicking "Use" adds the quest to your active dashboard</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
