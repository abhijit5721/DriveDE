/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { analyticsService } from './services/AnalyticsService';
import { Analytics } from '@vercel/analytics/react';
import { applyOwnTrafficFlagFromUrl, isOwnTraffic } from './utils/ownTraffic';
import { initMonitoring } from './lib/monitoring';

// Own devices and test runs opt out of every counter with ?noanalytics (see utils/ownTraffic).
applyOwnTrafficFlagFromUrl();

// Sentry loads after the first paint (see lib/monitoring): it is ~270 KB with replay.
initMonitoring();

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
    {/* Cookie-free page counter so we can see traffic without waiting for
        the consent banner. Consent-gated GA4/PostHog stay in AnalyticsService.
        beforeSend covers page views and the funnel's track() calls alike. */}
    <Analytics beforeSend={(event) => (isOwnTraffic() ? null : event)} />
  </ErrorBoundary>
);

createRoot(document.getElementById('root')!).render(
  <Root />
);
