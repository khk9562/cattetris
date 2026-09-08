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

  it('starts each tier faster than the one below it', () => {
    const { easy, normal, hard } = DIFFICULTY_PRESETS;
    expect(gravityIntervalMs(easy.startLevel, easy)).toBeGreaterThan(gravityIntervalMs(normal.startLevel, normal));
    expect(gravityIntervalMs(normal.startLevel, normal)).toBeGreaterThan(gravityIntervalMs(hard.startLevel, hard));
  });
});

describe('breedCountForLevel', () => {
  it('grows by one every breedsLevelStep levels up to the max', () => {
    const n = DIFFICULTY_PRESETS.normal;
    expect(breedCountForLevel(n.startLevel, n)).toBe(n.breedsStart);
    expect(breedCountForLevel(n.startLevel + n.breedsLevelStep, n)).toBe(n.breedsStart + 1);
    expect(breedCountForLevel(40, n)).toBe(n.breedsMax);
  });
});
