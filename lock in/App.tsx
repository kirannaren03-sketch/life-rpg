import React, { useState, useEffect } from 'react';
import { Plus, Bookmark, Calendar, Clock, Crown, Sparkles, Compass, CheckCircle, Flame, Layers } from 'lucide-react';
import { LifeRPGState, Quest, QuestCategory, CompletedLogEntry, QuestTemplate } from './types';
import {
  loadStoredState,
  saveStoredState,
  getTodayDateString,
  getCurrentWeekString,
  getCurrentMonthString,
  getInitialState,
  evaluateAchievements,
} from './utils/storage';
import {
  playQuestCompleteSound,
  playQuestUncheckSound,
  playLevelUpFanfare,
  playAchievementSound,
  playButtonTapSound,
} from './utils/audio';
import { Navbar } from './components/Navbar';
import { PlayerProfileCard } from './components/PlayerProfileCard';
import { DailyProgressCard } from './components/DailyProgressCard';
import { QuestItem } from './components/QuestItem';
import { QuestModal } from './components/QuestModal';
import { TemplateModal } from './components/TemplateModal';
import { StatsDashboard } from './components/StatsDashboard';
import { AchievementsView } from './components/AchievementsView';
import { LevelUpModal } from './components/LevelUpModal';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [state, setState] = useState<LifeRPGState>(() => loadStoredState());
  const [activeTab, setActiveTab] = useState<'quests' | 'stats' | 'achievements' | 'settings'>('quests');
  
  // The 5 Quest Categories filter
  const [selectedCategory, setSelectedCategory] = useState<'all' | QuestCategory>('daily');
  
  // Modals state
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to local storage whenever state changes
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  // Periodic date & period boundary check (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getTodayDateString();
      const week = getCurrentWeekString();
      const month = getCurrentMonthString();
      if (
        today !== state.lastActiveDate ||
        week !== state.lastActiveWeek ||
        month !== state.lastActiveMonth
      ) {
        setState(prev => loadStoredState());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [state.lastActiveDate, state.lastActiveWeek, state.lastActiveMonth]);

  const soundOn = state.settings.soundEffects;

  // Toggle Quest Complete / Incomplete
  const handleToggleQuest = (questId: string) => {
    const quest = state.quests.find(q => q.id === questId);
    if (!quest) return;

    const isCompleting = !quest.completed;
    const oldLevel = Math.floor(state.lifetimeXP / 100) + 1;
    const nowIso = new Date().toISOString();
    const todayStr = state.lastActiveDate;

    let newLifetimeXP = state.lifetimeXP;
    let newDailyXP = state.dailyXPEarned;
    let newLogs = [...state.completedLogs];

    if (isCompleting) {
      // Award XP exactly once
      newLifetimeXP += quest.xp;
      newDailyXP += quest.xp;

      const logEntry: CompletedLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        questId: quest.id,
        questTitle: quest.title,
        category: quest.category,
        discipline: quest.discipline,
        xp: quest.xp,
        completedAt: nowIso,
        date: todayStr,
      };
      newLogs.push(logEntry);

      playQuestCompleteSound(soundOn);
    } else {
      // Reverse XP
      newLifetimeXP = Math.max(0, newLifetimeXP - quest.xp);
      newDailyXP = Math.max(0, newDailyXP - quest.xp);

      // Remove from logs (most recent completion of this quest)
      const lastIndex = newLogs.map(l => l.questId).lastIndexOf(quest.id);
      if (lastIndex !== -1) {
        newLogs.splice(lastIndex, 1);
      }

      playQuestUncheckSound(soundOn);
    }

    const newLevel = Math.floor(newLifetimeXP / 100) + 1;

    // Update quest completed status
    const updatedQuests = state.quests.map(q => {
      if (q.id === questId) {
        return {
          ...q,
          completed: isCompleting,
          completedAt: isCompleting ? nowIso : undefined,
        };
      }
      return q;
    });

    // Check streak update if completing first quest today
    let currentStreak = state.currentStreak;
    let longestStreak = state.longestStreak;
    if (isCompleting && state.dailyXPEarned === 0) {
      currentStreak = Math.max(1, currentStreak + 1);
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    const intermediateState: LifeRPGState = {
      ...state,
      lifetimeXP: newLifetimeXP,
      dailyXPEarned: newDailyXP,
      currentStreak,
      longestStreak,
      quests: updatedQuests,
      completedLogs: newLogs,
    };

    // Evaluate achievements
    const { updatedState, newlyUnlocked } = evaluateAchievements(intermediateState);

    setState(updatedState);

    // If level increased, trigger Level-Up modal & fanfare
    if (newLevel > oldLevel) {
      playLevelUpFanfare(soundOn);
      setLevelUpLevel(newLevel);
    } else if (newlyUnlocked.length > 0) {
      playAchievementSound(soundOn);
    }
  };

  // Add or Edit Quest
  const handleSaveQuest = (questData: {
    id?: string;
    title: string;
    description?: string;
    xp: number;
    category: QuestCategory;
    discipline?: any;
    saveAsTemplate?: boolean;
  }) => {
    playButtonTapSound(soundOn);

    let updatedTemplates = [...state.templates];

    if (questData.saveAsTemplate) {
      const newTemplate: QuestTemplate = {
        id: `template-${Date.now()}`,
        title: questData.title,
        description: questData.description,
        xp: questData.xp,
        category: questData.category,
        discipline: questData.discipline,
      };
      updatedTemplates.push(newTemplate);
    }

    if (questData.id) {
      // Edit existing
      setState(prev => ({
        ...prev,
        templates: updatedTemplates,
        quests: prev.quests.map(q => {
          if (q.id === questData.id) {
            return {
              ...q,
              title: questData.title,
              description: questData.description,
              xp: questData.xp,
              category: questData.category,
              discipline: questData.discipline,
            };
          }
          return q;
        }),
      }));
    } else {
      // Add new
      const newQuest: Quest = {
        id: `quest-${Date.now()}`,
        title: questData.title,
        description: questData.description,
        xp: questData.xp,
        category: questData.category,
        discipline: questData.discipline,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setState(prev => ({
        ...prev,
        templates: updatedTemplates,
        quests: [...prev.quests, newQuest],
      }));
    }
    setEditingQuest(null);
  };

  // Delete Quest
  const handleDeleteQuest = (questId: string) => {
    const quest = state.quests.find(q => q.id === questId);
    if (!quest) return;

    if (window.confirm(`Delete quest "${quest.title}"?`)) {
      playButtonTapSound(soundOn);

      let newLifetimeXP = state.lifetimeXP;
      let newDailyXP = state.dailyXPEarned;
      if (quest.completed) {
        newLifetimeXP = Math.max(0, newLifetimeXP - quest.xp);
        newDailyXP = Math.max(0, newDailyXP - quest.xp);
      }

      setState(prev => ({
        ...prev,
        lifetimeXP: newLifetimeXP,
        dailyXPEarned: newDailyXP,
        quests: prev.quests.filter(q => q.id !== questId),
      }));
    }
  };

  // Save an existing quest as a reusable template
  const handleSaveAsTemplate = (quest: Quest) => {
    playButtonTapSound(soundOn);
    const newTemplate: QuestTemplate = {
      id: `tmpl-${Date.now()}`,
      title: quest.title,
      description: quest.description,
      xp: quest.xp,
      category: quest.category,
      discipline: quest.discipline,
    };
    setState(prev => ({
      ...prev,
      templates: [...prev.templates, newTemplate],
    }));
    alert(`Saved "${quest.title}" as a reusable template!`);
  };

  // Use a Template (instantiates it as an active quest)
  const handleUseTemplate = (tmpl: QuestTemplate) => {
    playButtonTapSound(soundOn);
    const newQuest: Quest = {
      id: `quest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: tmpl.title,
      description: tmpl.description,
      xp: tmpl.xp,
      category: tmpl.category,
      discipline: tmpl.discipline,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      quests: [...prev.quests, newQuest],
    }));
  };

  // Use all daily templates at once
  const handleUseAllDailyTemplates = () => {
    playButtonTapSound(soundOn);
    const dailyTemplates = state.templates.filter(t => t.category === 'daily');
    const newQuests: Quest[] = dailyTemplates.map(tmpl => ({
      id: `quest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: tmpl.title,
      description: tmpl.description,
      xp: tmpl.xp,
      category: 'daily',
      discipline: tmpl.discipline,
      completed: false,
      createdAt: new Date().toISOString(),
    }));

    setState(prev => ({
      ...prev,
      quests: [...prev.quests, ...newQuests],
    }));
  };

  // Create a template from the template modal
  const handleCreateTemplate = (tmplData: Omit<QuestTemplate, 'id'>) => {
    playButtonTapSound(soundOn);
    const newTemplate: QuestTemplate = {
      id: `tmpl-${Date.now()}`,
      ...tmplData,
    };
    setState(prev => ({
      ...prev,
      templates: [...prev.templates, newTemplate],
    }));
  };

  // Delete a template
  const handleDeleteTemplate = (templateId: string) => {
    playButtonTapSound(soundOn);
    setState(prev => ({
      ...prev,
      templates: prev.templates.filter(t => t.id !== templateId),
    }));
  };

  // Update Player Name in Settings (Requirement 8)
  const handleUpdatePlayerName = (name: string) => {
    playButtonTapSound(soundOn);
    setState(prev => ({
      ...prev,
      playerName: name,
      settings: { ...prev.settings, playerName: name },
    }));
  };

  // Reset Today's Quests
  const handleResetToday = () => {
    playButtonTapSound(soundOn);
    const reversedLifetimeXP = Math.max(0, state.lifetimeXP - state.dailyXPEarned);
    setState(prev => ({
      ...prev,
      lifetimeXP: reversedLifetimeXP,
      dailyXPEarned: 0,
      quests: prev.quests.map(q => {
        if (q.category === 'daily') {
          return { ...q, completed: false, completedAt: undefined };
        }
        return q;
      }),
    }));
  };

  // Simulate Next Day:
  // "Daily quests must not automatically repeat. Users should manually add new quests or reuse saved templates."
  const handleSimulateNewDay = () => {
    playButtonTapSound(soundOn);
    const currentDate = new Date(state.lastActiveDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const tomorrowStr = getTodayDateString(currentDate);

    // Save previous day record into history
    const completedDaily = state.quests.filter(q => q.category === 'daily' && q.completed);
    const totalDaily = state.quests.filter(q => q.category === 'daily').length;

    const updatedHistory = { ...state.history };
    updatedHistory[state.lastActiveDate] = {
      date: state.lastActiveDate,
      completedQuestIds: completedDaily.map(q => q.id),
      dailyXPEarned: state.dailyXPEarned,
      totalQuests: totalDaily,
      completedCount: completedDaily.length,
      completionPercentage: totalDaily > 0 ? Math.round((completedDaily.length / totalDaily) * 100) : 0,
    };

    let newStreak = state.currentStreak;
    if (completedDaily.length > 0) {
      newStreak += 1;
    } else {
      newStreak = 0;
    }
    const longestStreak = Math.max(state.longestStreak, newStreak);

    // Remove old daily quests (no auto-repeat). Weekly, Monthly, Main, Side remain!
    const nonDailyQuests = state.quests.filter(q => q.category !== 'daily');

    setState(prev => ({
      ...prev,
      lastActiveDate: tomorrowStr,
      dailyXPEarned: 0,
      currentStreak: newStreak,
      longestStreak,
      quests: nonDailyQuests,
      history: updatedHistory,
    }));

    setIsSettingsOpen(false);
  };

  // Simulate Next Week:
  // "Weekly quests should reset at the beginning of a new week"
  const handleSimulateNewWeek = () => {
    playButtonTapSound(soundOn);
    const nextWeekStr = `Sim-Week-${Date.now()}`;
    setState(prev => ({
      ...prev,
      lastActiveWeek: nextWeekStr,
      quests: prev.quests.map(q => {
        if (q.category === 'weekly') {
          return { ...q, completed: false, completedAt: undefined };
        }
        return q;
      }),
    }));
    setIsSettingsOpen(false);
  };

  // Simulate Next Month:
  // "monthly quests at the beginning of a new month"
  const handleSimulateNewMonth = () => {
    playButtonTapSound(soundOn);
    const nextMonthStr = `Sim-Month-${Date.now()}`;
    setState(prev => ({
      ...prev,
      lastActiveMonth: nextMonthStr,
      quests: prev.quests.map(q => {
        if (q.category === 'monthly') {
          return { ...q, completed: false, completedAt: undefined };
        }
        return q;
      }),
    }));
    setIsSettingsOpen(false);
  };

  // Factory Reset
  const handleFactoryReset = () => {
    playButtonTapSound(soundOn);
    const fresh = getInitialState();
    setState(fresh);
    saveStoredState(fresh);
  };

  // Export JSON Backup
  const handleExportData = () => {
    playButtonTapSound(soundOn);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `life-rpg-backup-${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const handleImportData = (imported: LifeRPGState) => {
    setState(imported);
    saveStoredState(imported);
  };

  // Filtered Quests by the 5 Categories
  const filteredQuests = selectedCategory === 'all'
    ? state.quests
    : state.quests.filter(q => q.category === selectedCategory);

  // Category counts
  const countAll = state.quests.length;
  const countDaily = state.quests.filter(q => q.category === 'daily').length;
  const countWeekly = state.quests.filter(q => q.category === 'weekly').length;
  const countMonthly = state.quests.filter(q => q.category === 'monthly').length;
  const countMain = state.quests.filter(q => q.category === 'main').length;
  const countSide = state.quests.filter(q => q.category === 'side').length;

  // Active category progress stats
  const activeCompleted = filteredQuests.filter(q => q.completed).length;
  const activeTotal = filteredQuests.length;

  const playerLevel = Math.floor(state.lifetimeXP / 100) + 1;

  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'daily': return 'Daily Quests';
      case 'weekly': return 'Weekly Quests';
      case 'monthly': return 'Monthly Quests';
      case 'main': return 'Main Quests (Permanent Milestones)';
      case 'side': return 'Side Quests (Optional Adventures)';
      default: return 'All Quests';
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col pb-20 md:pb-12">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab === 'settings' ? 'settings' : activeTab}
        setActiveTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        streak={state.currentStreak}
        soundEnabled={soundOn}
        onToggleSound={() => {
          const next = !soundOn;
          setState(prev => ({
            ...prev,
            settings: { ...prev.settings, soundEffects: next },
          }));
        }}
        level={playerLevel}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Active Tab: Quests Dashboard */}
        {activeTab === 'quests' && (
          <>
            {/* Player Level & XP Progression Card */}
            <PlayerProfileCard
              playerName={state.settings.playerName || state.playerName}
              playerTitle={state.playerTitle}
              lifetimeXP={state.lifetimeXP}
              dailyXPEarned={state.dailyXPEarned}
              totalCompletedQuests={state.completedLogs.length}
              completedLogs={state.completedLogs}
            />

            {/* Daily / Category Mission Status Card */}
            <DailyProgressCard
              totalQuests={activeTotal}
              completedQuests={activeCompleted}
              dailyXPEarned={state.dailyXPEarned}
              categoryLabel={selectedCategory === 'all' ? 'All Quests' : selectedCategory.toUpperCase()}
            />

            {/* Quests Section */}
            <div className="space-y-4">
              
              {/* Category Navigation Bar (The Five Separate Categories) */}
              <div className="bg-[#090e1f] p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none shadow-lg">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === 'all'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-300">
                    {countAll}
                  </span>
                </button>

                {/* 1. Daily Quests */}
                <button
                  onClick={() => setSelectedCategory('daily')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === 'daily'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Daily</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {countDaily}
                  </span>
                </button>

                {/* 2. Weekly Quests */}
                <button
                  onClick={() => setSelectedCategory('weekly')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === 'weekly'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Weekly</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    {countWeekly}
                  </span>
                </button>

                {/* 3. Monthly Quests */}
                <button
                  onClick={() => setSelectedCategory('monthly')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === 'monthly'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span>Monthly</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                    {countMonthly}
                  </span>
                </button>

                {/* 4. Main Quests */}
                <button
                  onClick={() => setSelectedCategory('main')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === 'main'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Main Quests</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                    {countMain}
                  </span>
                </button>

                {/* 5. Side Quests */}
                <button
                  onClick={() => setSelectedCategory('side')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === 'side'
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Side Quests</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                    {countSide}
                  </span>
                </button>
              </div>

              {/* Category Header & Action Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span>{getCategoryTitle()}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                      {activeCompleted}/{activeTotal}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedCategory === 'daily' && 'Daily quests do not auto-repeat. Add manually or load from saved templates.'}
                    {selectedCategory === 'weekly' && 'Weekly quests reset automatically at the beginning of each new week.'}
                    {selectedCategory === 'monthly' && 'Monthly quests reset automatically at the beginning of each new month.'}
                    {selectedCategory === 'main' && 'Epic milestones: Main Quests remain active until manually completed.'}
                    {selectedCategory === 'side' && 'Bonus life challenges and auxiliary tasks.'}
                    {selectedCategory === 'all' && 'Viewing all active and recurring quests across your life journey.'}
                  </p>
                </div>

                {/* Action Buttons: Templates & Add Quest */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      playButtonTapSound(soundOn);
                      setIsTemplateModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold shadow-sm transition"
                    title="Reuse saved quest templates"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Templates ({state.templates.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      playButtonTapSound(soundOn);
                      setEditingQuest(null);
                      setIsQuestModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add {selectedCategory === 'all' ? 'Quest' : selectedCategory.toUpperCase()}</span>
                  </button>
                </div>
              </div>

              {/* Quest List */}
              <div className="space-y-2.5">
                {filteredQuests.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-800 bg-[#070b18]/50 p-8 text-center space-y-3">
                    <p className="text-sm text-slate-400 font-medium">
                      {selectedCategory === 'daily'
                        ? 'No daily quests active for today yet. Daily quests do not auto-repeat.'
                        : `No ${selectedCategory} quests found.`}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {selectedCategory === 'daily' && (
                        <button
                          onClick={handleUseAllDailyTemplates}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition"
                        >
                          Load 5 Default Daily Quests
                        </button>
                      )}

                      <button
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition"
                      >
                        Browse Templates ({state.templates.length})
                      </button>

                      <button
                        onClick={() => {
                          setEditingQuest(null);
                          setIsQuestModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                      >
                        + Create New Quest
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredQuests.map((quest) => (
                    <QuestItem
                      key={quest.id}
                      quest={quest}
                      onToggle={handleToggleQuest}
                      onEdit={(q) => {
                        setEditingQuest(q);
                        setIsQuestModalOpen(true);
                      }}
                      onDelete={handleDeleteQuest}
                      onSaveAsTemplate={handleSaveAsTemplate}
                    />
                  ))
                )}
              </div>

            </div>
          </>
        )}

        {/* Active Tab: Statistics & Performance */}
        {activeTab === 'stats' && (
          <StatsDashboard state={state} />
        )}

        {/* Active Tab: Milestones & Achievements */}
        {activeTab === 'achievements' && (
          <AchievementsView achievements={state.achievements} />
        )}

      </main>

      {/* Quest Modal (Add/Edit in any category) */}
      <QuestModal
        isOpen={isQuestModalOpen}
        onClose={() => {
          setIsQuestModalOpen(false);
          setEditingQuest(null);
        }}
        onSave={handleSaveQuest}
        initialQuest={editingQuest}
        defaultCategory={selectedCategory === 'all' ? 'daily' : selectedCategory}
      />

      {/* Quest Templates Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templates={state.templates}
        onUseTemplate={handleUseTemplate}
        onUseAllDailyTemplates={handleUseAllDailyTemplates}
        onCreateTemplate={handleCreateTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        initialCategory={selectedCategory === 'all' ? 'daily' : selectedCategory}
      />

      {/* Level Up Celebration Modal */}
      <LevelUpModal
        isOpen={levelUpLevel !== null}
        onClose={() => setLevelUpLevel(null)}
        level={levelUpLevel || playerLevel}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={state.settings}
        onUpdateSettings={(updated) => {
          setState(prev => ({
            ...prev,
            settings: { ...prev.settings, ...updated },
          }));
        }}
        onUpdatePlayerName={handleUpdatePlayerName}
        onResetToday={handleResetToday}
        onSimulateNewDay={handleSimulateNewDay}
        onSimulateNewWeek={handleSimulateNewWeek}
        onSimulateNewMonth={handleSimulateNewMonth}
        onFactoryReset={handleFactoryReset}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

    </div>
  );
}
