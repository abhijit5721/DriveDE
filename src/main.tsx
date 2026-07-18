/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { analyticsService } from './services/AnalyticsService';

// Handle chunk load errors (e.g. when a new version is deployed while user has app open)
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

analyticsService.init();

const Root = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

createRoot(document.getElementById('root')!).render(
  <Root />
);
