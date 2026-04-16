# DriveDE - Build Instructions for App Stores

## Prerequisites

### For Android (APK/AAB):
- **Android Studio** (latest version): https://developer.android.com/studio
- **JDK 17+**: Usually bundled with Android Studio
- **Android SDK**: Installed via Android Studio

### For iOS (IPA):
- **macOS** (required - no way around this!)
- **Xcode 15+**: From Mac App Store
- **Apple Developer Account**: $99/year for App Store publishing

---

## Step 1: Build the Web App

```bash
npm run build
```

This creates the `dist/` folder with your production web app.

---

## Step 2: Initialize Capacitor Platforms

### Add Android:
```bash
npx cap add android
```

### Add iOS (macOS only):
```bash
npx cap add ios
```

---

## Step 3: Sync Your Code

After any code changes:
```bash
npm run build
npx cap sync
```

---

## Step 4: Open in Native IDE

### Android:
```bash
npx cap open android
```
This opens Android Studio with your project.

### iOS:
```bash
npx cap open ios
```
This opens Xcode with your project.

---

## Step 5: Configure App Icons & Splash Screens

### Using Capacitor Assets (Recommended):
```bash
npm install -D @capacitor/assets
npx capacitor-assets generate
```

Create these source files first:
- `assets/icon-only.png` (1024x1024) - App icon
- `assets/icon-foreground.png` (1024x1024) - Android adaptive icon
- `assets/icon-background.png` (1024x1024) - Android adaptive background
- `assets/splash.png` (2732x2732) - Splash screen
- `assets/splash-dark.png` (2732x2732) - Dark mode splash

---

## Step 6: Build for Release

### Android APK (for testing):
1. Open Android Studio
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. Find APK in: `android/app/build/outputs/apk/debug/`

### Android AAB (for Play Store):
1. Open Android Studio
2. Build → Generate Signed Bundle / APK
3. Select "Android App Bundle"
4. Create or use existing keystore
5. Build release AAB

### iOS IPA:
1. Open Xcode
2. Select your team/signing certificate
3. Product → Archive
4. Distribute App → App Store Connect (or Ad Hoc for testing)

---

## Step 7: Publish to Stores

### Google Play Store:
1. Create developer account: https://play.google.com/console ($25 one-time)
2. Create new app in Play Console
3. Fill in app details, screenshots, descriptions
4. Upload AAB file
5. Submit for review (usually 1-3 days)

### Apple App Store:
1. Create developer account: https://developer.apple.com ($99/year)
2. Create app in App Store Connect
3. Fill in app metadata, screenshots
4. Upload via Xcode or Transporter
5. Submit for review (usually 1-2 days)

---

## App Store Requirements Checklist

### Both Stores:
- [ ] App icon (various sizes auto-generated)
- [ ] Screenshots (phone + tablet)
- [ ] App description (German + English)
- [ ] Privacy policy URL
- [ ] Support URL/email
- [ ] Age rating questionnaire

### Google Play Specific:
- [ ] Feature graphic (1024x500)
- [ ] Content rating questionnaire
- [ ] Target audience declaration
- [ ] Data safety form

### Apple App Store Specific:
- [ ] App previews (optional videos)
- [ ] Keywords
- [ ] What's New text
- [ ] App Privacy details

---

## Privacy Policy Requirement

Both stores require a privacy policy. For DriveDE, create one that covers:

1. **Data collected**: Progress data, lesson logs (stored locally)
2. **Data storage**: All data stored on device only
3. **No third-party sharing**: App doesn't share data
4. **Contact information**: Your support email

Free privacy policy generators:
- https://www.freeprivacypolicy.com
- https://www.termsfeed.com

---

## Signing Keys (IMPORTANT - Keep Safe!)

### Android Keystore:
```bash
keytool -genkey -v -keystore drivede-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias drivede
```

⚠️ **NEVER lose this keystore!** You cannot update your app without it.

### iOS Certificates:
Managed through Apple Developer Portal and Xcode.

---

## Testing Before Release

### Android:
1. Build debug APK
2. Install on real device: `adb install app-debug.apk`
3. Or use Android emulator

### iOS:
1. Use Xcode simulator
2. Or TestFlight for real device testing

---

## Estimated Costs

| Item | Cost |
|------|------|
| Google Play Developer | $25 (one-time) |
| Apple Developer Program | $99/year |
| Mac for iOS builds | $999+ (if needed) |
| **Total (Android only)** | **$25** |
| **Total (Both platforms)** | **$124/year** |

---

## Common Issues & Solutions

### "SDK not found" (Android):
- Open Android Studio → SDK Manager → Install required SDKs

### "Signing certificate not found" (iOS):
- Xcode → Preferences → Accounts → Add Apple ID

### "Build failed" after code changes:
```bash
npm run build
npx cap sync
npx cap copy
```

### App crashes on startup:
- Check Android Studio / Xcode console for errors
- Ensure all Capacitor plugins are properly installed

---

## Quick Commands Reference

```bash
# Build web app
npm run build

# Sync to native projects
npx cap sync

# Open Android Studio
npx cap open android

# Open Xcode (macOS only)
npx cap open ios

# Update Capacitor
npm update @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Live reload during development (useful for testing)
npx cap run android --livereload --external
npx cap run ios --livereload --external
```

---

## Need Help?

- Capacitor Docs: https://capacitorjs.com/docs
- Android Publishing: https://developer.android.com/studio/publish
- iOS Publishing: https://developer.apple.com/ios/submit/

Good luck with your app! 🚗💨
