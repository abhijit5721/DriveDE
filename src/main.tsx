/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { analyticsService } from './services/AnalyticsService';

// Initialize Sentry as early as possible to capture all errors
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: !import.meta.env.DEV, // Only send events in production/preview, not during local dev
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,    // GDPR: mask all text in replays
      blockAllMedia: false,
    }),
  ],
  // Performance monitoring
  tracesSampleRate: 0.1,         // Sample 10% of transactions for performance
  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Always replay sessions where an error occurred
});

// Handle chunk load errors (e.g. when a new version is deployed while user has app open)
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

analyticsService.init();

// Safeguard against Google Translate / browser extension DOM mutations breaking React DOM reconciliation
if (typeof window !== 'undefined' && typeof Node !== 'undefined' && Node.prototype) {
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      return this.appendChild(newNode) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };
}

const Root = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

createRoot(document.getElementById('root')!).render(
  <Root />
);
