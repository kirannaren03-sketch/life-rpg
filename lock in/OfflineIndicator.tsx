import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 border border-cyan-500/40 px-3.5 py-2 text-xs font-medium text-slate-200 shadow-xl backdrop-blur-md">
      <WifiOff className="w-4 h-4 text-cyan-400 animate-pulse" />
      <span>Offline Mode — All progress saved locally</span>
    </div>
  );
};
