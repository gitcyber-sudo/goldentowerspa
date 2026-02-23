import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

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

  // Global Error Handlers for Reliability
  window.addEventListener('error', (event) => {
    // Prevent infinite loops if logging itself fails
    if (event.filename && event.filename.includes('errorLogger')) return;

    // Notify user visually
    alert("An unexpected error occurred. Our team has been notified. Please refresh the page if the application becomes unresponsive.");

    import('./lib/errorLogger').then(({ logError }) => {
      logError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        severity: 'error',
        metadata: { source: 'window.onerror', filename: event.filename, lineno: event.lineno }
      });
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Notify user visually for promise rejections
    alert("An unexpected background error occurred. Our team has been notified.");

    import('./lib/errorLogger').then(({ logError }) => {
      logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        severity: 'error',
        metadata: { source: 'window.onunhandledrejection' }
      });
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