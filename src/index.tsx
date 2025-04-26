import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import { registerPeriodicSync } from './utils/registerPeriodicSync';

function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

const [theme, setTheme] = (function () {
  const initial = getSystemTheme();
  const listeners: ((t: string) => void)[] = [];
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const newTheme = e.matches ? 'dark' : 'light';
      listeners.forEach(fn => fn(newTheme));
    });
  }
  return [initial, (fn: (t: string) => void) => listeners.push(fn)] as const;
})();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

function Root() {
  // On first load, check localStorage, then browser theme
  const getInitialMode = () => {
    const stored = localStorage.getItem('colorMode');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const [colorMode, setColorMode] = React.useState<'light' | 'dark'>(getInitialMode);

  React.useEffect(() => {
    // Listen for browser theme changes only if user hasn't overridden
    const stored = localStorage.getItem('colorMode');
    if (!stored) {
      const listener = (e: MediaQueryListEvent) => {
        setColorMode(e.matches ? 'dark' : 'light');
      };
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  // Persist user override
  const handleSetColorMode = (mode: 'light' | 'dark') => {
    setColorMode(mode);
    localStorage.setItem('colorMode', mode);
  };

  return (
    <FluentProvider theme={colorMode === 'dark' ? webDarkTheme : webLightTheme}>
      <App colorMode={colorMode} setColorMode={handleSetColorMode} />
    </FluentProvider>
  );
}

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register({
    onSuccess: () => {
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
      registerPeriodicSync().then(success => {
        if (!success) {
          // Optionally show a warning to the user
          console.warn('Periodic Background Sync is not supported or permission denied.');
        }
      });
    }
  });
} else {
  serviceWorkerRegistration.unregister();
}
// Push notification setup will be added soon
