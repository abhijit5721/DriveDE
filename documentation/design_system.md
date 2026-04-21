# DriveDE Design System & Component Guide

## 🎨 Aesthetic Principles

DriveDE follows a **Premium Dark Modern** aesthetic with "Glassmorphism" elements. The goal is to provide a high-end, automotive-grade interface that feels like a modern vehicle's infotainment system.

### Core Visual Tokens
- **Primary Color**: Blue (`#3B82F6`) - representing trust and technology.
- **Accent Colors**: 
    - Orange: Manual Transmission / Alerts.
    - Green: Success / Completion.
    - Amber/Gold: Premium features.
- **Glassmorphism**: Use `bg-white/10` or `bg-slate-800/50` with `backdrop-blur-md` for overlays and cards.

## 🧱 Component Architecture

### Layout Components
- **`App.tsx`**: Uses `h-[100dvh]` to handle mobile browser chrome and `-webkit-overflow-scrolling: touch` for smooth iOS lists.
- **`Header.tsx`**: Fixed at top, handles high-level navigation status.
- **`BottomNav.tsx`**: Mobile-first navigation with `pb-safe` to account for home indicators.

### Interaction Patterns
- **Framer Motion**: Every transition should be smooth. Use `layout` prop for moving elements and `AnimatePresence` for modals.
- **Haptic Feedback**: (Planned) Visual micro-animations (scale-95 on click) simulate physical button presses.

## 🛠️ Tailwind Best Practices in DriveDE

1.  **DarkMode**: Use the `dark:` prefix consistently. Most components should have a defined dark state.
2.  **Responsive**: Use `md:` for desktop optimizations, but keep the mobile experience as the priority (`base` styles = mobile).
3.  **Z-Indexing**:
    - Default: 0
    - Nav/Header: 40-50
    - Modals: 60+ (to clear the navigation bar).

---
*Last Updated: April 2026*
