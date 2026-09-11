import { describe, it, expect } from 'vitest';
import { tapScore, formatSeconds } from './trainerResult';

describe('trainerResult', () => {
  it('scores correct taps out of all taps', () => {
    expect(tapScore({ cars: 2, wrongTaps: 0 })).toEqual({ correct: 2, total: 2 });
    expect(tapScore({ cars: 3, wrongTaps: 2 })).toEqual({ correct: 3, total: 5 });
    expect(tapScore({ cars: 2, wrongTaps: -1 })).toEqual({ correct: 2, total: 2 });
  });

  it('formats seconds with the language separator', () => {
    expect(formatSeconds(4210, 'de')).toBe('4,2');
    expect(formatSeconds(4210, 'en')).toBe('4.2');
    expect(formatSeconds(999, 'en')).toBe('1.0');
    expect(formatSeconds(-5, 'de')).toBe('0,0');
  });
});
