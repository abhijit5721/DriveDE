# DriveDE Privacy & Data Usage Overview

## 🛡️ Privacy Policy Template

This document provides an overview of how DriveDE handles sensitive user data, particularly GPS location and personal progress. This can be adapted into a formal Privacy Policy for App Store and Play Store listings.

### 1. Data Collection
- **Location Data**: DriveDE requires access to precise location data while the app is in use to provide real-time tracking, speed monitoring, and road safety alerts.
- **Progress Data**: We store information about completed lessons, quiz scores, and recorded driving sessions.
- **Identity**: If signed in via Google/Email, we store basic profile information provide by the auth provider.

### 2. Data Storage & Permissions
- **On-Device Storage**: By default, all data is stored locally on your device using `LocalStorage` or `SQLite` (via Capacitor).
- **Cloud Synchronization**: If you create an account, data is synchronized with our secure **Supabase (PostgreSQL)** backend. This allows you to restore progress on a new device.
- **Permissions**:
    - `NSLocationWhenInUseUsageDescription`: Needed for tracking driving sessions.
    - `NSMotionUsageDescription`: Used to optimize battery usage during driving.

### 3. Data Protection
- **No Third-Party Sharing**: We do not sell, trade, or share your driving data with insurance companies, advertisers, or any third-party entities.
- **Anonymization**: Route data is stored privately within your user account and is not accessible to other users.

### 4. User Rights
- **Deletion**: Users can delete their driving sessions at any time.
- **Account Removal**: Closing an account permanently deletes all synchronized cloud data.

---
*Last Updated: April 2026*
