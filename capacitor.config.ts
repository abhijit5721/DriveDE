import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.drivede.app',
  appName: 'DriveDE',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1e40af',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1e40af'
    },
    CapacitorUpdater: {
      autoUpdate: true,
      statsUrl: 'https://api.capgo.app/',
      channel: 'dev'
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '712119605930-5q3uukgohlqb6h2h37o8bp7fe6o8rjml.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
