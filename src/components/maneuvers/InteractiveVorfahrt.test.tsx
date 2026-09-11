/**
 * DRI-48: a tap made while a car is still driving off (the 800 ms lock) is
 * queued and played next instead of being dropped. Fast, confident learners
 * used to stall the round on the landing-page trainer because of this.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import InteractiveVorfahrt from './InteractiveVorfahrt';
import type { SimulatorScenario } from '../../types';

// The global setup mocks only a handful of HTML motion tags. This component
// animates SVG groups and paths, so render any motion.<tag> as the plain tag
// with the animation-only props stripped; timing is driven by our own setTimeout.
vi.mock('framer-motion', () => {
  const MOTION_PROPS = new Set(['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'layout', 'layoutId']);
  const motion = new Proxy({}, {
    get: (_target, tag: string) => ({ children, ...props }: { children?: ReactNode; [k: string]: unknown }) => {
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) if (!MOTION_PROPS.has(k)) clean[k] = v;
      return createElement(tag, clean, children);
    },
  });
  return {
    motion,
    AnimatePresence: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
    LayoutGroup: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
  };
});

const RVL: SimulatorScenario = {
  id: 'test-rvl',
  factKey: 'rvl',
  cars: [
    { id: 'blue-car', color: 'blue', positionKey: 'right', order: 0, labelKey: 'blueCar' },
    { id: 'red-car', color: 'red', positionKey: 'bottom', order: 1, labelKey: 'redCar' },
  ],
};

describe('InteractiveVorfahrt tap sequencing', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('completes the round when the second correct tap lands during the first animation', () => {
    const onComplete = vi.fn();
    render(<InteractiveVorfahrt language="en" scenarios={[RVL]} onComplete={onComplete} />);

    fireEvent.click(screen.getByTestId('car-blue-car'));
    // 200 ms in: blue is still driving off; red is tapped immediately.
    act(() => { vi.advanceTimersByTime(200); });
    fireEvent.click(screen.getByTestId('car-red-car'));

    // Nothing is done yet; the queue holds red.
    expect(screen.queryByTestId('simulator-continue-btn')).toBeNull();

    // Blue finishes, red starts automatically, red finishes: success.
    act(() => { vi.advanceTimersByTime(600); });
    act(() => { vi.advanceTimersByTime(800); });

    expect(screen.getByTestId('simulator-continue-btn')).toBeTruthy();
    fireEvent.click(screen.getByTestId('simulator-continue-btn'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('still rejects a wrong car tapped during the animation', () => {
    const WRONG_FIRST: SimulatorScenario = { ...RVL, id: 'test-wrong' };
    render(<InteractiveVorfahrt language="en" scenarios={[WRONG_FIRST]} onComplete={vi.fn()} />);

    // Red goes second, so tapping red first is an error even before any animation.
    fireEvent.click(screen.getByTestId('car-red-car'));
    expect(screen.queryByTestId('simulator-continue-btn')).toBeNull();

    // Correct order afterwards still works.
    fireEvent.click(screen.getByTestId('car-blue-car'));
    fireEvent.click(screen.getByTestId('car-red-car'));
    act(() => { vi.advanceTimersByTime(1600); });
    expect(screen.getByTestId('simulator-continue-btn')).toBeTruthy();
  });

  it('ignores a repeated tap on a car that is already committed or queued', () => {
    render(<InteractiveVorfahrt language="en" scenarios={[RVL]} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByTestId('car-blue-car'));
    fireEvent.click(screen.getByTestId('car-blue-car'));
    fireEvent.click(screen.getByTestId('car-red-car'));
    fireEvent.click(screen.getByTestId('car-red-car'));
    act(() => { vi.advanceTimersByTime(1600); });
    expect(screen.getByTestId('simulator-continue-btn')).toBeTruthy();
  });
});
