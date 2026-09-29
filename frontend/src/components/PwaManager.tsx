'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, X, ShieldAlert } from 'lucide-react';

export const PwaManager: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => {
        setIsOffline(false);
        setDismissed(false);
      };

      const handleOffline = () => {
        setIsOffline(true);
        setDismissed(false);
        setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Register Service Worker in production only; actively unregister in development
      if ('serviceWorker' in navigator) {
        if (process.env.NODE_ENV === 'production') {
          navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
              console.log('[MausamMesh PWA] ServiceWorker registered with scope:', registration.scope);
            })
            .catch((error) => {
              console.error('[MausamMesh PWA] ServiceWorker registration failed:', error);
            });
        } else {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister();
              console.log('[MausamMesh Dev] Unregistered stale ServiceWorker for dev session');
            }
          });
        }
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (!isOffline || dismissed) {
    return null;
  }

  return (
    <aside 
      aria-label="Offline Mode Notification"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-bounce-subtle"
    >
      <div className="bg-amber-600 text-white p-3.5 rounded-2xl shadow-xl flex items-start gap-3 border border-amber-500/80">
        <div className="p-2 bg-amber-700/60 rounded-xl shrink-0 mt-0.5">
          <WifiOff className="w-5 h-5 text-amber-100" />
        </div>
        <div className="flex-1 text-xs">
          <div className="font-extrabold flex items-center gap-1.5 text-sm">
            <span>Offline Mode Active</span>
          </div>
          <p className="text-amber-100 mt-0.5 leading-relaxed">
            Internet connection lost. Displaying locally cached panchayat forecasts and advisory records {lastSync ? `(synced at ${lastSync})` : ''}.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-2.5 py-1 bg-white text-amber-900 font-bold rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Connection</span>
            </button>
            <span className="text-amber-200 text-[10px]">Auto-reconnects when online</span>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-200 hover:text-white p-1 rounded-lg transition-colors"
          title="Dismiss offline banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
