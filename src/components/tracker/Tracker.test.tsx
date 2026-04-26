/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Tracker } from './Tracker';
import toast from 'react-hot-toast';

// Mock Dependencies
vi.mock('../../store/useAppStore', () => {
  const mockState = {
    language: 'en',
    licenseType: 'manual',
    isPremium: true,
    userProgress: { 
      drivingSessions: [],
      hourlyRate45: 60,
      fixedCosts: {},
      specialDrivingMinutes: { ueberland: 0, autobahn: 0, nacht: 0 }
    },
    addDrivingSession: vi.fn(),
    updateDrivingSession: vi.fn(),
    removeDrivingSession: vi.fn(),
    clearDrivingHistory: vi.fn(),
    setHourlyRate45: vi.fn(),
    activeTab: 'tracker',
    activeSession: null,
    startActiveSession: vi.fn(),
    pauseActiveSession: vi.fn(),
    resumeActiveSession: vi.fn(),
    updateActiveSession: vi.fn(),
    stopActiveSession: vi.fn(),
  };
  return {
    useAppStore: vi.fn((selector) => selector ? selector(mockState) : mockState),
  };
});

// Mock react-hot-toast correctly as a function and an object
vi.mock('react-hot-toast', () => {
  const mockToast = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn()
  });
  return {
    default: mockToast,
    toast: mockToast,
  };
});

// Mock Leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Polyline: () => null,
  Marker: () => null,
  Popup: () => null,
  useMap: () => ({
    panTo: vi.fn(),
  }),
}));

// Mock Worker and URL
Object.defineProperty(globalThis, 'Worker', {
  value: class {
    onmessage = () => {};
    postMessage = () => {};
    terminate = () => {};
    addEventListener = () => {};
    removeEventListener = () => {};
  },
  configurable: true
});
Object.defineProperty(globalThis.URL, 'createObjectURL', { value: vi.fn(), configurable: true });

describe('Tracker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };
    Object.defineProperty(globalThis.navigator, 'geolocation', { value: mockGeolocation, configurable: true });
  });

  it('should display error toast when GPS permission is denied', async () => {
    // Mock geolocation error (code 1 = PERMISSION_DENIED)
    const mockError = { code: 1, message: 'User denied Geolocation' };
    
    vi.mocked(navigator.geolocation.watchPosition).mockImplementation((_success: PositionCallback, error?: PositionErrorCallback | null) => {
      if (error) error(mockError as unknown as GeolocationPositionError);
      return 123; // watch ID
    });

    render(<Tracker />);

    // Click Start Live to trigger watchPosition
    const startBtn = screen.getByRole('button', { name: /Start Live/i });
    fireEvent.click(startBtn);
    
    // Verify that the error toast is called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Location access denied'));
    }, { timeout: 2000 });
  });
});
