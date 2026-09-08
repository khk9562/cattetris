import { describe, expect, it } from 'vitest';
import { EMPTY_TOTALS } from './types';
import { applySession } from './usePlayerStats';

describe('applySession', () => {
  it('accumulates totals and keeps best level per difficulty for endless only', () => {
    let t = applySession(EMPTY_TOTALS, { mode: 'endless', difficulty: 'normal', elapsedMs: 60000, lines: 10, explosions: 2, maxChain: 1, score: 5000, level: 7 });
    t = applySession(t, { mode: 'stage', difficulty: 'easy', elapsedMs: 30000, lines: 5, explosions: 1, maxChain: 3, score: 2000, level: 9 });
    expect(t.games).toBe(2);
    expect(t.playMs).toBe(90000);
    expect(t.lines).toBe(15);
    expect(t.bestChain).toBe(4);
    expect(t.bestLevel.normal).toBe(7);
    expect(t.bestLevel.easy).toBe(0);
  });
});
