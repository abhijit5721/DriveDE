/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { analyticsService } from './services/AnalyticsService';

analyticsService.init();

const Root = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

createRoot(document.getElementById('root')!).render(
  <Root />
);
