import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Tracker } from './Tracker';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

// Mock Dependencies
vi.mock('../../store/useAppStore', () => ({
  useAppStore: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
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
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      language: 'en',
      isPremium: true,
      userProgress: { 
        drivingSessions: [],
        hourlyRate45: 60,
        fixedCosts: {},
        specialDrivingMinutes: { ueberland: 0, autobahn: 0, nacht: 0 }
      },
      addDrivingSession: vi.fn(),
      activeTab: 'tracker',
    });

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
    });
  });
});
