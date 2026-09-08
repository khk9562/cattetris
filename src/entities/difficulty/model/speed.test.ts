import { describe, expect, it } from 'vitest';
import { DIFFICULTY_PRESETS } from '../config/presets';
import { breedCountForLevel, gravityIntervalMs } from './speed';

describe('gravityIntervalMs', () => {
  it('starts at one second per row on level 1 for normal', () => {
    expect(gravityIntervalMs(1, DIFFICULTY_PRESETS.normal)).toBe(1000);
  });

  it('follows the guideline curve and caps at maxSpeedLevel', () => {
    const n = DIFFICULTY_PRESETS.normal;
    expect(gravityIntervalMs(5, n)).toBe(355);
    expect(gravityIntervalMs(n.maxSpeedLevel, n)).toBe(gravityIntervalMs(n.maxSpeedLevel + 5, n));
  });

  it('is slower on easy than normal at the same level', () => {
    expect(gravityIntervalMs(3, DIFFICULTY_PRESETS.easy)).toBeGreaterThan(gravityIntervalMs(3, DIFFICULTY_PRESETS.normal));
  });
});

describe('breedCountForLevel', () => {
  it('grows by one every breedsLevelStep levels up to the max', () => {
    const n = DIFFICULTY_PRESETS.normal;
    expect(breedCountForLevel(1, n)).toBe(4);
    expect(breedCountForLevel(5, n)).toBe(5);
    expect(breedCountForLevel(9, n)).toBe(6);
    expect(breedCountForLevel(40, n)).toBe(6);
  });
});
