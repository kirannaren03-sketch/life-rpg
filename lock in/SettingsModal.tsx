import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Bell,
  Download,
  Upload,
  AlertTriangle,
  FastForward,
  User,
  Check,
  Calendar,
  Compass,
} from 'lucide-react';
import { AppSettings, LifeRPGState } from '../types';
import { playButtonTapSound } from '../utils/audio';
import { downloadProjectZip } from '../utils/exportZip';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onUpdatePlayerName: (name: string) => void;
  onResetToday: () => void;
  onSimulateNewDay: () => void;
  onSimulateNewWeek: () => void;
  onSimulateNewMonth: () => void;
  onFactoryReset: () => void;
  onExportData: () => void;
  onImportData: (data: LifeRPGState) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onUpdatePlayerName,
  onResetToday,
  onSimulateNewDay,
  onSimulateNewWeek,
  onSimulateNewMonth,
  onFactoryReset,
  onExportData,
  onImportData,
}) => {
  const [playerNameInput, setPlayerNameInput] = useState(settings.playerName);
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [showConfirmResetToday, setShowConfirmResetToday] = useState(false);
  const [showConfirmFactoryReset, setShowConfirmFactoryReset] = useState(false);
  const [notificationTestStatus, setNotificationTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSoundToggle = () => {
    const nextVal = !settings.soundEffects;
    onUpdateSettings({ soundEffects: nextVal });
    if (nextVal) {
      playButtonTapSound(true);
    }
  };

  const handleSavePlayerName = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerNameInput.trim()) {
      onUpdatePlayerName(playerNameInput.trim());
      setNameSavedSuccess(true);
      setTimeout(() => setNameSavedSuccess(false), 2000);
    }
  };

  const handleRequestNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationTestStatus('Notifications not supported in this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onUpdateSettings({ dailyReminder: true });
        new Notification('Life RPG', {
          body: `⚔️ Your quests await, ${playerNameInput || 'Hero'}! Ready to level up your life?`,
          icon: '/pwa-192x192.png',
        });
        setNotificationTestStatus('Notification sent successfully!');
      } else {
        onUpdateSettings({ dailyReminder: false });
        setNotificationTestStatus('Notification permission was denied');
      }
    } catch {
      setNotificationTestStatus('Notification request failed');
    }
    setTimeout(() => setNotificationTestStatus(null), 3000);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.quests && typeof parsed.lifetimeXP === 'number') {
          onImportData(parsed);
          alert('Data imported successfully!');
          onClose();
        } else {
          alert('Invalid backup file format');
        }
      } catch {
        alert('Failed to read backup JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-[#090e1f] border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Settings & Preferences</h3>
        <p className="text-xs text-slate-400 mb-6">Manage player identity, audio, and reset cycles.</p>

        <div className="space-y-6">
          
          {/* 1. Editable Player Name (Requirement 8) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <User className="w-4 h-4" />
              <span>Player Identity</span>
            </div>
            
            <form onSubmit={handleSavePlayerName} className="space-y-2 pt-1">
              <label className="block text-xs text-slate-300">
                Display Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  placeholder="Enter your name..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    nameSavedSuccess
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
                  }`}
                >
                  {nameSavedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 2. Sound & Audio Feedback */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Audio Feedback</h4>
            
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                {settings.soundEffects ? (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <span className="block text-sm font-semibold text-slate-200">RPG Sound Effects</span>
                  <span className="text-xs text-slate-400">Audio for quest checks, unchecks & level-ups</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSoundToggle}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.soundEffects ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 3. Daily Reminders */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</h4>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="block text-sm font-semibold text-slate-200">Daily Quest Motivation</span>
                    <span className="text-xs text-slate-400">Receive actionable daily check reminders</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestNotification}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-cyan-300 hover:bg-cyan-900 transition"
                >
                  Test Alert
                </button>
              </div>

              {notificationTestStatus && (
                <p className="text-[11px] text-cyan-400 pt-1">{notificationTestStatus}</p>
              )}
            </div>
          </div>

          {/* 4. Time Cycle Testing (Day, Week, Month) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Progression Cycle Simulator</h4>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                Test the progression rules on demand. Lifetime XP is always preserved!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onSimulateNewDay}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-semibold transition"
                  title="Simulate Next Day (archives daily quests without auto-repeat)"
                >
                  <FastForward className="w-4 h-4 mb-1 text-cyan-400" />
                  <span>Next Day</span>
                </button>

                <button
                  type="button"
                  onClick={onSimulateNewWeek}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-semibold transition"
                  title="Simulate Next Week (resets weekly quests)"
                >
                  <Calendar className="w-4 h-4 mb-1 text-emerald-400" />
                  <span>Next Week</span>
                </button>

                <button
                  type="button"
                  onClick={onSimulateNewMonth}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-purple-300 font-semibold transition"
                  title="Simulate Next Month (resets monthly quests)"
                >
                  <Compass className="w-4 h-4 mb-1 text-purple-400" />
                  <span>Next Month</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5. Data Backup, Export & Download */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Export & Backup</h4>
            
            <button
              type="button"
              disabled={isExportingZip}
              onClick={async () => {
                try {
                  setIsExportingZip(true);
                  await downloadProjectZip('life-rpg-complete-project.zip');
                  setZipSuccess(true);
                  setTimeout(() => setZipSuccess(false), 3000);
                } catch (err) {
                  console.error('Failed to export project zip:', err);
                  alert('Failed to generate project zip archive.');
                } finally {
                  setIsExportingZip(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-[0.98] transition disabled:opacity-60 cursor-pointer"
            >
              {zipSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>ZIP Downloaded Successfully!</span>
                </>
              ) : isExportingZip ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Packaging Project with JSZip...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Complete Project (ZIP)</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Progress</span>
              </button>

              <label className="flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import Progress</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 6. Danger Zone Resets */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Reset Actions</h4>
            
            {showConfirmResetToday ? (
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-xs space-y-2">
                <p className="text-rose-200">Uncheck all quests completed today? (Reverses today's XP from lifetime XP)</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetToday();
                      setShowConfirmResetToday(false);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmResetToday(false)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmResetToday(true)}
                className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-amber-400 transition"
              >
                Reset Today's Checkboxes
              </button>
            )}

            {showConfirmFactoryReset ? (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Permanent Factory Reset</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Erase all Lifetime XP, streaks, level history, and return to fresh default quests?
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onFactoryReset();
                      setShowConfirmFactoryReset(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    Yes, Factory Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmFactoryReset(false)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmFactoryReset(true)}
                className="w-full py-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition"
              >
                Factory Reset (All Data)
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
