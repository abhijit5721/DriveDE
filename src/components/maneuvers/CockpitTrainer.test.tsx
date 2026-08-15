import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CockpitTrainer from './CockpitTrainer';

/** Drag helper: the pedal computes travel from getBoundingClientRect, which is
 *  all zeros in jsdom — patch it so pointer positions map to sensible travel. */
function patchPedalRect() {
  const pedal = screen.getByTestId('cockpit-clutch');
  pedal.getBoundingClientRect = () =>
    ({ top: 0, left: 0, bottom: 200, right: 40, width: 40, height: 200, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  return pedal;
}

const pressClutchFully = () => {
  const pedal = patchPedalRect();
  fireEvent.pointerDown(pedal, { clientY: 200, pointerId: 1 });
  fireEvent.pointerUp(pedal, { pointerId: 1 });
};

const releaseClutchTo = (pct: number) => {
  const pedal = patchPedalRect();
  fireEvent.pointerDown(pedal, { clientY: pct * 2, pointerId: 1 });
  fireEvent.pointerUp(pedal, { pointerId: 1 });
};

describe('CockpitTrainer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders manual mode with step 1 and readouts', () => {
    render(<CockpitTrainer onComplete={vi.fn()} language="en" mode="manual" />);
    expect(screen.getByTestId('cockpit-step')).toHaveTextContent('Step 1/6');
    expect(screen.getByTestId('cockpit-step')).toHaveTextContent('Start the engine');
    expect(screen.getByTestId('cockpit-speed')).toHaveTextContent('0');
    expect(screen.getByTestId('cockpit-gear-display')).toHaveTextContent('N');
  });

  it('refuses to start without clutch + brake, then starts and advances to step 2', () => {
    render(<CockpitTrainer onComplete={vi.fn()} language="en" mode="manual" />);
    fireEvent.click(screen.getByTestId('cockpit-engine'));
    expect(screen.getByTestId('cockpit-message')).toHaveTextContent(/press the clutch fully/i);

    pressClutchFully();
    fireEvent.click(screen.getByTestId('cockpit-brake'));
    fireEvent.click(screen.getByTestId('cockpit-engine'));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByTestId('cockpit-step')).toHaveTextContent('Step 2/6');
    expect(screen.getByTestId('cockpit-rpm')).not.toHaveTextContent(/^0$/);
  });

  it('grinds the gearbox when shifting without the clutch pressed', () => {
    render(<CockpitTrainer onComplete={vi.fn()} language="en" mode="manual" />);
    pressClutchFully();
    fireEvent.click(screen.getByTestId('cockpit-brake'));
    fireEvent.click(screen.getByTestId('cockpit-engine'));
    releaseClutchTo(20); // clutch mostly released
    fireEvent.click(screen.getByTestId('cockpit-gear-1'));
    expect(screen.getByTestId('cockpit-message')).toHaveTextContent(/grinding/i);
    expect(screen.getByTestId('cockpit-gear-display')).toHaveTextContent('N');
  });

  it('stalls when the clutch is dumped without gas', () => {
    render(<CockpitTrainer onComplete={vi.fn()} language="en" mode="manual" />);
    pressClutchFully();
    fireEvent.click(screen.getByTestId('cockpit-brake'));
    fireEvent.click(screen.getByTestId('cockpit-engine'));
    fireEvent.click(screen.getByTestId('cockpit-brake'));
    fireEvent.click(screen.getByTestId('cockpit-gear-1'));
    releaseClutchTo(0); // dump the clutch, no gas
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByTestId('cockpit-message')).toHaveTextContent(/stalled/i);
  });

  it('supports keyboard controls: B holds brake, arrows move clutch, E starts engine', () => {
    render(<CockpitTrainer onComplete={vi.fn()} language="en" mode="manual" />);
    // clutch fully down via arrow key repeats
    for (let i = 0; i < 14; i++) fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(screen.getByTestId('cockpit-clutch-value')).toHaveTextContent('100%');
    // hold brake with B, start engine with E
    fireEvent.keyDown(window, { key: 'b' });
    fireEvent.keyDown(window, { key: 'e' });
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByTestId('cockpit-step')).toHaveTextContent('Step 2/6');
    // select 1st gear with the 1 key
    fireEvent.keyDown(window, { key: '1' });
    expect(screen.getByTestId('cockpit-gear-display')).toHaveTextContent('1');
    // releasing B releases the brake
    fireEvent.keyUp(window, { key: 'b' });
  });

  it('completes the automatic flow and reports a score', () => {
    const onComplete = vi.fn();
    const onScore = vi.fn();
    render(<CockpitTrainer onComplete={onComplete} onScore={onScore} language="en" mode="automatic" />);

    // step 1: brake + start
    fireEvent.click(screen.getByTestId('cockpit-brake'));
    fireEvent.click(screen.getByTestId('cockpit-engine'));
    act(() => vi.advanceTimersByTime(200));
    // step 2: D with brake held
    fireEvent.click(screen.getByTestId('cockpit-gear-D'));
    act(() => vi.advanceTimersByTime(200));
    // step 3: release brake, gas to 10 km/h
    fireEvent.click(screen.getByTestId('cockpit-brake'));
    fireEvent.click(screen.getByTestId('cockpit-gas'));
    act(() => vi.advanceTimersByTime(3000));
    // step 4: stop with brake
    fireEvent.click(screen.getByTestId('cockpit-gas'));
    fireEvent.click(screen.getByTestId('cockpit-brake'));
    act(() => vi.advanceTimersByTime(5000));
    // step 5: P + engine off
    fireEvent.click(screen.getByTestId('cockpit-gear-P'));
    fireEvent.click(screen.getByTestId('cockpit-engine'));
    act(() => vi.advanceTimersByTime(300));

    expect(screen.getByTestId('cockpit-continue')).toBeInTheDocument();
    expect(onScore).toHaveBeenCalledWith(expect.any(Number));
    expect(onScore.mock.calls[0][0]).toBeGreaterThanOrEqual(80);

    // the windshield scene travelled while driving (DRI-13)
    const offset = Number(screen.getByTestId('cockpit-windshield').getAttribute('data-offset'));
    expect(offset).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId('cockpit-continue'));
    expect(onComplete).toHaveBeenCalled();
  });
});
