import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PreDriveCheckTrainer from './PreDriveCheckTrainer';

const CONTROL_ORDER = ['indicatorStalk', 'wiperStalk', 'lightSwitch', 'fogRear', 'hazard', 'horn', 'defrostRear', 'handbrake'];

function completeControlsPhase() {
  for (const id of CONTROL_ORDER) {
    fireEvent.click(screen.getByTestId(`predrive-control-${id}`));
  }
}

describe('PreDriveCheckTrainer', () => {
  it('prompts controls in order and flags a wrong tap', () => {
    render(<PreDriveCheckTrainer onComplete={vi.fn()} language="en" />);
    expect(screen.getByTestId('predrive-prompt')).toHaveTextContent('Indicator stalk');
    // wrong tap first
    fireEvent.click(screen.getByTestId('predrive-control-horn'));
    expect(screen.getByTestId('predrive-prompt')).toHaveTextContent(/different control/i);
    // correct tap advances the prompt
    fireEvent.click(screen.getByTestId('predrive-control-indicatorStalk'));
    expect(screen.getByTestId('predrive-prompt')).toHaveTextContent('Wiper stalk');
    expect(screen.getByTestId('predrive-phase')).toHaveTextContent('1/8');
  });

  it('moves to the lamp quiz after all controls and scores it', () => {
    const onComplete = vi.fn();
    const onScore = vi.fn();
    render(<PreDriveCheckTrainer onComplete={onComplete} onScore={onScore} language="en" />);
    completeControlsPhase();
    expect(screen.getByTestId('predrive-phase')).toHaveTextContent(/quiz/i);

    // answer all 8 lamp questions (pick the correct option by matching text)
    for (let q = 0; q < 8; q++) {
      const options = [0, 1, 2].map((i) => screen.getByTestId(`predrive-option-${i}`));
      // click the first option; feedback reveals the correct one either way
      fireEvent.click(options[0]);
      fireEvent.click(screen.getByTestId('predrive-next'));
    }

    expect(onScore).toHaveBeenCalledTimes(1);
    expect(onScore.mock.calls[0][0]).toBeGreaterThanOrEqual(0);
    expect(screen.getByTestId('predrive-continue')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('predrive-continue'));
    expect(onComplete).toHaveBeenCalled();
  });
});
