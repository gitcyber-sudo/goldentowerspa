import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

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

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(() => {
        // SW registered successfully
      }).catch(() => {
        // SW registration failed
      });
    });
  }
}