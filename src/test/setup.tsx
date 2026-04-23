import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mock for Supabase
vi.mock('../lib/supabase', () => {
  const createMockQuery = (data: any) => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data, error: null })),
    then: (resolve: any) => Promise.resolve({ data, error: null }).then(resolve),
  });

  return {
    isSupabaseConfigured: true,
    supabase: {
      from: vi.fn().mockImplementation((table) => {
        if (table === 'profiles') return createMockQuery({ display_name: 'Test Student' });
        return createMockQuery([]);
      })
    }
  };
});

// Mock Framer Motion globally
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));
