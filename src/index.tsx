import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { initDebugBridge } from './lib/debugBridge';

// --- PROFESSIONAL CONSOLE IDENTITY ---
initDebugBridge();
console.log(
  "%c Golden Tower Spa %c Developed by John Paul Valdez ",
  "color: white; background: #C5A059; padding: 5px 10px; border-radius: 5px 0 0 5px; font-weight: bold; font-family: serif; font-size: 1.1rem;",
  "color: #C5A059; background: #1a1a1a; padding: 5px 10px; border-radius: 0 5px 5px 0; font-weight: bold; font-family: sans-serif; font-size: 1rem; border: 1px solid #C5A059;"
);
console.log(
  "%c ⚡ Need a premium website? %c Contact: valdezjohnpaul15.jv@gmail.com ",
  "color: #C5A059; font-weight: bold; font-family: sans-serif; font-size: 0.9rem;",
  "color: white; background: #333; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 0.9rem;"
);

// --- AUTOMATIC CACHE BUSTING ---
declare const __APP_VERSION__: string;
const currentVersion = __APP_VERSION__;
const savedVersion = localStorage.getItem('app_version');

const performUpdate = async () => {
  // 1. Safety check: NEVER reload in development mode
  if (currentVersion === 'dev' || !currentVersion) {
    console.log('Update check skipped in development.');
    localStorage.setItem('app_version', currentVersion || 'dev');
    return;
  }

  // 2. Circuit breaker: Don't reload if we just did (within 10 seconds)
  const lastReload = parseInt(sessionStorage.getItem('gt_last_reload') || '0');
  if (Date.now() - lastReload < 10000) {
    console.warn('Update triggered too recently. Aborting reload loop.');
    localStorage.setItem('app_version', currentVersion);
    return;
  }

  console.log('New version detected. Cleaning up and refreshing...');
  sessionStorage.setItem('gt_last_reload', Date.now().toString());

  try {
    // Unregister SWs and Clear Caches
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) await reg.unregister();
    }
    if ('caches' in window) {
      const names = await caches.keys();
      for (const name of names) await caches.delete(name);
    }

    localStorage.setItem('app_version', currentVersion);
    window.location.reload();
  } catch (err) {
    console.error('Update failed:', err);
    sessionStorage.removeItem('gt_last_reload');
  }
};

if (savedVersion && savedVersion !== currentVersion) {
  performUpdate();
  // STOP execution here if a reload is potentially pending
  if (currentVersion !== 'dev') {
    const container = document.getElementById('root');
    if (container) container.innerHTML = '<div style="background:#1a1a1a;color:#C5A059;height:100vh;display:flex;align-items:center;justify-content:center;font-family:serif;font-size:1.2rem;">Updating Golden Tower Spa...</div>';
  }
} else {
  localStorage.setItem('app_version', currentVersion || 'dev');
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );

  // ── Global Error Handlers ──
  // Suppress ALL popup alerts in development; in production only alert for
  // genuine JS crashes, never for resource/network issues.
  const isDev = import.meta.env.DEV || currentVersion === 'dev';

  // Helper: silently log to Supabase (fire-and-forget, never throws)
  const silentLog = (payload: Record<string, unknown>) => {
    import('./lib/errorLogger')
      .then(({ logError }) => logError(payload as any))
      .catch(() => { /* swallow – logging failure should never cascade */ });
  };

  window.addEventListener('error', (event) => {
    // Prevent infinite loops
    if (event.filename?.includes('errorLogger')) return;

    // Resource-loading errors (images, video, audio, scripts from CDNs)
    // come through as Events on the element, NOT ErrorEvents with a message.
    // They have no `message` or `filename`. Ignore them entirely.
    if (!event.message && !event.filename) return;

    // Ignore Vite / HMR noise during development
    const msg = (event.message || '').toLowerCase();
    if (msg.includes('vite') || msg.includes('hmr') || msg.includes('websocket')) return;

    // In dev mode: console only, never alert
    if (isDev) {
      console.warn('[Dev Error]', event.message);
    } else {
      // Production: only alert for real JS crashes
      alert("An unexpected error occurred. Please refresh if the app becomes unresponsive.");
    }

    silentLog({
      message: event.message,
      stack: event.error?.stack,
      url: window.location.href,
      severity: 'error',
      metadata: { source: 'window.onerror', filename: event.filename, lineno: event.lineno }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason || '');

    // ── Suppress all known non-critical noise ──
    const noise = [
      'WebSocket',     // Vite HMR reconnect
      'vite',          // Vite client internals
      'HMR',           // Hot Module Replacement
      'net::',         // Chrome network errors (ERR_FAILED, etc.)
      'NetworkError',  // Firefox network errors
      'Failed to fetch', // Generic fetch failures (SW, analytics, etc.)
      'Load failed',   // Safari fetch failures
      'AbortError',    // Aborted requests
      'TypeError: cancelled', // Safari aborted fetch
      'ServiceWorker',  // SW registration failures
    ];
    if (noise.some(n => msg.includes(n))) {
      console.warn('[System] Suppressed background noise:', msg.slice(0, 120));
      return;
    }

    // Everything else: log silently, never popup
    console.error('[System] Unhandled Rejection:', event.reason);
    silentLog({
      message: `Unhandled Promise Rejection: ${msg}`,
      stack: event.reason?.stack,
      url: window.location.href,
      severity: 'error',
      metadata: { source: 'window.onunhandledrejection' }
    });
  });

  // Register Service Worker with robust update detection
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        // Check for updates periodically
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version found, reload page
                window.location.reload();
              }
            };
          }
        };
      }).catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
  }
}