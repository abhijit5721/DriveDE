/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * trialFlow.test.ts
 *
 * Comprehensive tests for:
 * 1. 7-Day Free Trial activation upon signup.
 * 2. Revocation of Pro features after 7 days (isProActive returning false).
 * 3. Duplicate email detection & local email registry.
 * 4. Pre-selection of intended plan at paywall expiry.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage for Vitest Node environment
const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, val: string) => storageMap.set(key, val),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

// Mock IndexedDB storage for Vitest Node environment
vi.mock('idb-keyval', () => {
  const store = new Map<string, any>();
  return {
    get: vi.fn(async (key: string) => store.get(key)),
    set: vi.fn(async (key: string, val: any) => store.set(key, val)),
    del: vi.fn(async (key: string) => store.delete(key)),
  };
});

import { useAppStore } from '../store/useAppStore';
import { isEmailRegisteredLocally, registerEmailLocally } from '../services/auth';

describe('7-Day Trial & Auth Flow Verification', () => {

  beforeEach(() => {
    storageMap.clear();
    useAppStore.setState({
      isPremium: false,
      trialStartedAt: null,
      trialEndsAt: null,
      intendedPlan: null,
      authEmail: null,
      authStatus: 'guest',
      authUserId: null,
      authDisplayName: null,
    });
  });

  it('1. User is not active Pro before starting trial or paying', () => {
    const store = useAppStore.getState();
    expect(store.isPremium).toBe(false);
    expect(store.trialEndsAt).toBe(null);
    expect(store.isProActive()).toBe(false);
    expect(store.getRemainingTrialDays()).toBe(0);
  });

  it('2. Starting free trial with a plan activates Pro for 7 days', () => {
    const store = useAppStore.getState();
    store.startFreeTrial('90-days');

    const updated = useAppStore.getState();
    expect(updated.trialStartedAt).not.toBeNull();
    expect(updated.trialEndsAt).not.toBeNull();
    expect(updated.intendedPlan).toBe('90-days');
    expect(updated.isProActive()).toBe(true);
    expect(updated.getRemainingTrialDays()).toBe(7);
  });

  it('3. Pro access is automatically revoked when 7 days expire', () => {
    // Simulate a trial that started 8 days ago
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

    useAppStore.setState({
      trialStartedAt: eightDaysAgo,
      trialEndsAt: oneDayAgo, // expired 1 day ago
      intendedPlan: '90-days',
    });

    const updated = useAppStore.getState();
    expect(updated.isProActive()).toBe(false);
    expect(updated.getRemainingTrialDays()).toBe(0);
  });

  it('4. Paid premium users remain Pro active indefinitely', () => {
    useAppStore.setState({
      isPremium: true,
      trialStartedAt: null,
      trialEndsAt: null,
    });

    const updated = useAppStore.getState();
    expect(updated.isProActive()).toBe(true);
    expect(updated.getRemainingTrialDays()).toBe(999);
  });

  it('5. Local email registry detects existing registered users (case-insensitive)', () => {
    expect(isEmailRegisteredLocally('user@gmail.com')).toBe(false);

    registerEmailLocally('User@Gmail.Com');

    expect(isEmailRegisteredLocally('user@gmail.com')).toBe(true);
    expect(isEmailRegisteredLocally('USER@GMAIL.COM')).toBe(true);
    expect(isEmailRegisteredLocally('another@gmail.com')).toBe(false);
  });

  it('6. Intended plan persists so Paywall pre-selects chosen plan on expiry', () => {
    useAppStore.getState().setIntendedPlan('lifetime');

    expect(useAppStore.getState().intendedPlan).toBe('lifetime');
  });

});
