import { describe, expect, it } from 'vitest';
import { ACCESSORIES, CAT_SKINS, getSkin, paletteVars } from '../config/skins';
import { ALL_CAT_TYPES } from './types';
import { isAccessoryUnlocked, isSkinUnlocked, totalSkinCount, unlockedSkinCount } from './skinUnlock';

describe('skin definitions', () => {
  it('gives every breed a default plus two tiered palettes', () => {
    for (const cat of ALL_CAT_TYPES) {
      const list = CAT_SKINS[cat];
      expect(list[0].tier).toBe(0);
      expect(list.map(s => s.tier)).toEqual([0, 1, 2]);
      expect(new Set(list.map(s => s.id)).size).toBe(3);
    }
    expect(totalSkinCount()).toBe(ALL_CAT_TYPES.length * 2 + ACCESSORIES.length);
  });

  it('falls back to the default skin for unknown ids', () => {
    expect(getSkin('ginger', 'nope').id).toBe('default');
    expect(getSkin('ginger', 'flame').name).toBe('불꽃');
  });

  it('maps palettes to CSS variables', () => {
    expect(paletteVars(undefined)).toEqual({});
    expect(paletteVars({ base: '#111', pattern: '#222', eyeRight: '#333' })).toEqual({ '--fur-base': '#111', '--fur-pattern': '#222', '--eye-right': '#333' });
  });
});

describe('unlock rules', () => {
  it('unlocks palettes by destroyed count and accessories by stars', () => {
    const [d, t1, t2] = CAT_SKINS.ginger;
    expect(isSkinUnlocked(d, 0)).toBe(true);
    expect(isSkinUnlocked(t1, 499)).toBe(false);
    expect(isSkinUnlocked(t1, 500)).toBe(true);
    expect(isSkinUnlocked(t2, 1999)).toBe(false);
    expect(isSkinUnlocked(t2, 2000)).toBe(true);
    expect(unlockedSkinCount({ ginger: 2500, black: 600 })).toBe(3);
    expect(isAccessoryUnlocked('ribbon', 9)).toBe(false);
    expect(isAccessoryUnlocked('ribbon', 10)).toBe(true);
    expect(isAccessoryUnlocked('crown', 89)).toBe(false);
  });
});
