import { describe, expect, it } from 'vitest';
import type { FeedbackKind } from '@/features/game-session/@x/sound';
import { SFX } from './sfx';

const KINDS: FeedbackKind[] = ['start', 'move', 'rotate', 'softDrop', 'hardDrop', 'lock', 'hold', 'line', 'explode', 'chain', 'combo', 'levelup', 'gameover'];

describe('SFX recipes', () => {
  it('has a recipe for every feedback kind that runs without an AudioContext', () => {
    for (const k of KINDS) {
      expect(typeof SFX[k]).toBe('function');
      expect(() => SFX[k](3)).not.toThrow();
    }
  });
});
