import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

// framer-motion renders SVG tags here too; the global mock only knows HTML tags,
// so use a Proxy that renders any tag with the motion props stripped.
vi.mock('framer-motion', () => {
  const strip = (props: Record<string, unknown>) => {
    const { initial, animate, exit, transition, whileHover, whileTap, layout, ...rest } = props as any;
    void initial; void animate; void exit; void transition; void whileHover; void whileTap; void layout;
    return rest;
  };
  const motion = new Proxy({}, {
    get: (_t, tag: string) => React.forwardRef((props: any, ref) => React.createElement(tag, { ...strip(props), ref }, props.children)),
  });
  return { motion, AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children), LayoutGroup: ({ children }: any) => React.createElement(React.Fragment, null, children) };
});

import InteractiveLaneTurn from './InteractiveLaneTurn';
import { LANE_TURN_SCENARIOS } from '../../data/laneTurnScenarios';

describe('InteractiveLaneTurn', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('rejects the wrong lane with the rule and accepts the right one, advancing through all scenarios', () => {
    const onComplete = vi.fn();
    const onRoundResult = vi.fn();
    render(<InteractiveLaneTurn language="en" onComplete={onComplete} onRoundResult={onRoundResult} />);
    expect(screen.getByTestId('lane-turn-progress').textContent).toBe('Intersection 1 of 4');

    // Scenario 1: car in the outer left-turn lane, inner is wrong
    fireEvent.click(screen.getByTestId('lane-zone-inner'));
    expect(screen.getByTestId('lane-turn-error').textContent).toMatch(/lane to lane/);
    fireEvent.click(screen.getByTestId('lane-zone-outer'));
    act(() => { vi.advanceTimersByTime(1500 + 900 + 50); });
    expect(screen.getByTestId('lane-turn-progress').textContent).toBe('Intersection 2 of 4');

    // Scenario 2: inner lane stays inner
    fireEvent.click(screen.getByTestId('lane-zone-inner'));
    act(() => { vi.advanceTimersByTime(2500); });
    expect(screen.getByTestId('lane-turn-progress').textContent).toBe('Intersection 3 of 4');

    // Scenario 3: single lane, keep right, so inner is wrong
    fireEvent.click(screen.getByTestId('lane-zone-inner'));
    expect(screen.getByTestId('lane-turn-error').textContent).toMatch(/keep-right/);
    fireEvent.click(screen.getByTestId('lane-zone-outer'));
    act(() => { vi.advanceTimersByTime(2500); });
    expect(screen.getByTestId('lane-turn-progress').textContent).toBe('Intersection 4 of 4');

    // Scenario 4: right turn from the left of two lanes arrives inner
    fireEvent.click(screen.getByTestId('lane-zone-inner'));
    act(() => { vi.advanceTimersByTime(1600); });
    expect(screen.getByTestId('lane-turn-continue-btn')).toBeTruthy();
    expect(onRoundResult).toHaveBeenCalledWith({ wrongTaps: 2, durationMs: expect.any(Number) });
    fireEvent.click(screen.getByTestId('lane-turn-continue-btn'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('ignores taps while the car is driving', () => {
    render(<InteractiveLaneTurn language="de" onComplete={() => undefined} scenarios={[LANE_TURN_SCENARIOS[0]]} />);
    fireEvent.click(screen.getByTestId('lane-zone-outer'));
    fireEvent.click(screen.getByTestId('lane-zone-inner'));
    expect(screen.queryByTestId('lane-turn-error')).toBeNull();
  });

  it('shows German copy and the fact for the current scenario', () => {
    render(<InteractiveLaneTurn language="de" onComplete={() => undefined} />);
    expect(screen.getByTestId('lane-turn-your-lane').textContent).toBe('Du stehst in der rechten Abbiegespur.');
    expect(screen.getByTestId('lane-turn-fact').textContent).toMatch(/parallelen Abbiegespuren/);
  });
});
