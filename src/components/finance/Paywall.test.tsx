import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Paywall } from './Paywall';
import { useAppStore } from '../../store/useAppStore';
import * as supabaseModule from '../../lib/supabase';

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

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
  isSupabaseConfigured: true,
}));

describe('Paywall Component', () => {
  const mockSetPremium = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      language: 'en',
      setPremium: mockSetPremium,
    });
    
    // Mock window.location safely for testing
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: '' }
    });
  });

  it('should render all pricing tiers', () => {
    render(<Paywall onClose={mockOnClose} />);
    expect(screen.getByText(/Starter/i)).toBeInTheDocument();
  });

  it('should trigger checkout function when clicked', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - necessary for mocking internal module properties
    supabaseModule.isSupabaseConfigured = true;
    
    const mockInvoke = vi.fn().mockResolvedValue({ 
      data: { url: 'https://checkout.stripe.com/test' }, 
      error: null 
    });
    
    const mockedSupabase = supabaseModule.supabase as unknown as {
      functions: { invoke: ReturnType<typeof vi.fn> };
      auth: { getUser: ReturnType<typeof vi.fn> };
    };
    
    mockedSupabase.functions.invoke = mockInvoke;
    mockedSupabase.auth.getUser = vi.fn().mockResolvedValue({ 
      data: { user: { id: 'user_123' } } 
    });

    render(<Paywall onClose={mockOnClose} />);
    
    const unlockBtn = screen.getByText(/Unlock Pro Now/i);
    fireEvent.click(unlockBtn);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalled();
    }, { timeout: 5000 });
  });
});
