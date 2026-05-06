/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 * 
 * AnalyticsService.ts
 * 
 * Handles conditional injection of tracking scripts (GA4, Meta Pixel) 
 * based on user's GDPR cookie consent preferences.
 */

import { useAppStore } from '../store/useAppStore';

// Configuration from environment variables
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_ID;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: any;
  }
}

class AnalyticsService {
  private scriptsLoaded = {
    analytics: false,
    marketing: false
  };

  /**
   * Initializes the subscription to the store's cookie settings.
   */
  public init() {
    if (typeof window === 'undefined') return;

    // Wait for store hydration before initial check
    const unsubHydration = useAppStore.subscribe(
      (state) => state.isHydrated,
      (isHydrated) => {
        if (isHydrated) {
          console.log('[AnalyticsService] Store hydrated, running initial sync...');
          const settings = useAppStore.getState().cookieSettings;
          this.syncTracking(settings);
          unsubHydration(); // Only need this once
        }
      },
      { fireImmediately: true }
    );

    // Listen for future changes specifically to cookieSettings
    useAppStore.subscribe(
      (state) => state.cookieSettings,
      (settings) => {
        console.log('[AnalyticsService] Consent changed:', settings);
        this.syncTracking(settings);
      }
    );
  }

  private syncTracking(settings: { analytics: boolean; marketing: boolean }) {
    // Analytics (GA4)
    if (settings.analytics) {
      this.loadGA4();
    } else {
      this.disableGA4();
    }

    // Marketing (Meta Pixel)
    if (settings.marketing) {
      this.loadMetaPixel();
    } else {
      this.disableMetaPixel();
    }
  }

  // --- GA4 Implementation ---
  private loadGA4() {
    if (this.scriptsLoaded.analytics || !GA4_MEASUREMENT_ID) return;
    
    console.log('[AnalyticsService] Loading GA4...');
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    script.id = 'gtag-js';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: any[]) => {
      window.dataLayer.push(args);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    this.scriptsLoaded.analytics = true;
  }

  private disableGA4() {
    if (!this.scriptsLoaded.analytics) return;
    
    console.log('[AnalyticsService] Disabling GA4 tracking...');
    
    // Remove scripts
    document.getElementById('gtag-js')?.remove();
    
    // Set 'opt-out' cookie for GA4 (standard way)
    (window as any)[`ga-disable-${GA4_MEASUREMENT_ID}`] = true;
    
    // Best effort cleanup of cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.startsWith('_ga') || name.startsWith('_gid')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      }
    }

    this.scriptsLoaded.analytics = false;
  }

  // --- Meta Pixel Implementation ---
  private loadMetaPixel() {
    if (this.scriptsLoaded.marketing || !META_PIXEL_ID) return;
    
    console.log('[AnalyticsService] Loading Meta Pixel...');
    
    // Standard Meta Pixel snippet logic (minimal)
    const f = window as any;
    if (f.fbq) return;
    const n: any = (f.fbq = (...args: any[]) => {
      if (n.callMethod) {
        n.callMethod(...args);
      } else {
        n.queue.push(args);
      }
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.id = 'meta-pixel-js';
    document.head.appendChild(script);

    f.fbq('init', META_PIXEL_ID);
    f.fbq('track', 'PageView');

    this.scriptsLoaded.marketing = true;
  }

  private disableMetaPixel() {
    if (!this.scriptsLoaded.marketing) return;
    
    console.log('[AnalyticsService] Disabling Meta Pixel...');
    
    document.getElementById('meta-pixel-js')?.remove();
    delete (window as any).fbq;
    
    // Cleanup Pixel cookies
    document.cookie = `_fbp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    
    this.scriptsLoaded.marketing = false;
  }
}

export const analyticsService = new AnalyticsService();
