# DriveDE Component Reference

This document provides a detailed overview of the core components in the DriveDE application, their props, and their responsibilities.

## Core Layout Components

### `App.tsx`
- **Location**: `src/App.tsx`
- **Responsibility**: Root component, handles initialization, authentication state, and main navigation/routing. It wraps the application in the necessary providers and manages the active tab state.
- **Key States**:
  - `activeTab`: Current visible feature ('home', 'curriculum', 'tracker', etc.)
  - `selectedLesson`: Currently viewing lesson details.

### `Header`
- **Location**: `src/components/layout/Header.tsx`
- **Responsibility**: Global sticky header that displays the app logo, current learning path, premium status, and global actions like language toggle, theme toggle, and auth.

### `BottomNav` / `DesktopNav`
- **Location**: `src/components/layout/BottomNav.tsx`, `src/components/layout/DesktopNav.tsx`
- **Responsibility**: Main navigation components for mobile and desktop respectively.

---

## Feature-Specific Components

### `Dashboard`
- **Location**: `src/components/dashboard/Dashboard.tsx`
- **Responsibility**: The user's landing hub. Displays progress summaries, driving insights, and "Quick Actions" like starting a simulation or continuing a lesson.
- **Sub-components**: `ExamReadinessGauge`, `DrivingInsights`.

### `Tracker`
- **Location**: `src/components/tracker/Tracker.tsx`
- **Responsibility**: Core driving session tracking utility. 
  - Supports GPS-based live tracking.
  - Manual session logging.
  - Route maps (Leaflet integration).
  - Voice-triggered mistake logging.
  - Financial hourly rate configuration.
- **Special Features**: Mobile-optimized modals and safe-area adjustments for devices like iPhone 13 Pro.

### `Curriculum`
- **Location**: `src/components/curriculum/Curriculum.tsx`
- **Responsibility**: Lists all theory chapters and lessons. Categorizes lessons by status (Locked, In-Progress, Completed).

---

## Financial & Production Readiness

### `BudgetEstimator`
- **Location**: `src/components/finance/BudgetEstimator.tsx`
- **Responsibility**: Calculates total costs based on driving hours and fixed fees.
- **Validation**: Implements strict non-negative input validation for all cost fields.

---

## Technical Specifications

### Input Validation
All financial inputs must pass through a validation layer that prevents negative numbers. This is implemented in:
- `Tracker.tsx`: `handleSaveRate`
- `BudgetEstimator.tsx`: `handleSave`

### Mobile Viewports
The app uses `100dvh` for the main scroll container in `App.tsx` to handle dynamic browser UI (like the Safari address bar) reliably. Safe area bottom padding is applied to all sticky footers and modals.
