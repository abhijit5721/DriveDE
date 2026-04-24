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
  const mockToast = vi.fn();
  (mockToast as any).success = vi.fn();
  (mockToast as any).error = vi.fn();
  return {
    default: mockToast,
    toast: mockToast,
  };
});

// Mock Leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Polyline: () => null,
  Marker: () => null,
  Popup: () => null,
  useMap: () => ({
    panTo: vi.fn(),
  }),
}));

// Mock Worker and URL
(global as any).Worker = class {
  onmessage = () => {};
  postMessage = () => {};
  terminate = () => {};
  addEventListener = () => {};
  removeEventListener = () => {};
};
(global as any).URL.createObjectURL = vi.fn();

describe('Tracker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };
    (global.navigator as any).geolocation = mockGeolocation;
  });

  it('should display error toast when GPS permission is denied', async () => {
    // Mock geolocation error (code 1 = PERMISSION_DENIED)
    const mockError = { code: 1, message: 'User denied Geolocation' };
    
    (navigator.geolocation.watchPosition as any).mockImplementation((_success: any, error: any) => {
      error(mockError);
      return 123; // watch ID
    });

    render(<Tracker />);

    // Click Start Live to trigger watchPosition
    const startBtn = screen.getByText(/Start Live/i);
    fireEvent.click(startBtn);
    
    // Verify that the error toast is called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Location access denied'));
    }, { timeout: 2000 });
  });
});
