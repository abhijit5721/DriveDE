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
    (useAppStore as any).mockReturnValue({
      language: 'en',
      setPremium: mockSetPremium,
    });
    
    // Mock window.location to prevent redirect issues
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as any;
  });

  it('should render all pricing tiers', () => {
    render(<Paywall onClose={mockOnClose} />);
    expect(screen.getByText(/Standard/i)).toBeInTheDocument();
  });

  it('should trigger checkout function when clicked', async () => {
    (supabaseModule as any).isSupabaseConfigured = true;
    const mockInvoke = vi.fn().mockResolvedValue({ 
      data: { url: 'https://checkout.stripe.com/test' }, 
      error: null 
    });
    
    (supabaseModule.supabase as any).functions.invoke = mockInvoke;
    (supabaseModule.supabase as any).auth.getUser = vi.fn().mockResolvedValue({ 
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
