import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("Golden Tower Spa: Initializing Application...");

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Golden Tower Spa: Root element not found!");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Golden Tower Spa: App rendered successfully.");
  } catch (error) {
    console.error("Golden Tower Spa: Critical rendering error:", error);
  }
};

// Ensure DOM is ready before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}