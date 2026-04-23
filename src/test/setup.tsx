import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mock for Supabase
vi.mock('../lib/supabase', () => {
  const createMockQuery = (data: unknown) => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data, error: null })),
    then: (resolve: (value: { data: unknown; error: null }) => void) => 
      Promise.resolve({ data, error: null }).then(resolve),
  });

  return {
    isSupabaseConfigured: true,
    supabase: {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') return createMockQuery({ display_name: 'Test Student' });
        return createMockQuery([]);
      })
    }
  };
});

// Mock Framer Motion globally
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props}>{children}</h1>,
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LayoutGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
