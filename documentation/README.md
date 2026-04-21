# DriveDE Documentation

Welcome to the official documentation for DriveDE. This directory contains detailed information about the project's architecture, data models, and specialized logic.

## 📁 Documentation Index

### 1. [Architecture Overview](./architecture.md)
A high-level view of the system's structure, including frontend components, state management, backend integration, and external service interactions.

### 2. [Design System & UI Patterns](./design_system.md)
Detailed guide on the app's "Premium Dark" aesthetic, glassmorphism implementation, and component naming conventions.

### 3. [Safety & Geospatial Engine](./safety_engine.md)
Technical deep-dive into how DriveDE uses the **Overpass API** for real-time safety monitoring (wrong-way driving, stop signs, etc.).

### 4. [Privacy & Data Policy](./privacy_and_data.md)
Essential information for App Store / Play Store compliance regarding GPS usage and progress synchronization.

## 📁 Specialized Logic (In-Code)
For detailed logic explanations, please refer to the comments within the following files:
- **Real-Time Safety Engine**: `src/components/Tracker.tsx`
- **Global State & Sync**: `src/store/useAppStore.ts` & `src/services/supabaseSync.ts`
- **Financial Module**: `src/components/BudgetEstimator.tsx`

---

## 🚀 Quick Links (Root Directory)
- [Backend Setup](../BACKEND_SETUP.md)
- [Build Instructions](../BUILD_INSTRUCTIONS.md)
- [Google OAuth Setup](../GOOGLE_OAUTH_SETUP.md)
- [Supabase Quickstart](../SUPABASE_QUICKSTART.md)
