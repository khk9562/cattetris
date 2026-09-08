import { describe, expect, it } from 'vitest';
import { STAGES, getStage } from '../config/stages';
import { isLimitExhausted, isStageCleared, remainingFraction, stageProgress, starsFor } from './progress';
import type { StageProgressInput } from './types';

const base: StageProgressInput = { lines: 0, explosions: 0, destroyed: {}, maxChain: 0, score: 0, piecesPlaced: 0, elapsedMs: 0 };

describe('stage definitions', () => {
  it('has 30 stages with unique ascending ids and at least one goal each', () => {
    expect(STAGES).toHaveLength(30);
    STAGES.forEach((s, i) => {
      expect(s.id).toBe(i + 1);
      expect(s.goals.length).toBeGreaterThan(0);
    });
  });

  it('keeps breed goals achievable by fixing the breed pool', () => {
    for (const s of STAGES) {
      for (const g of s.goals) {
        if (g.type === 'breed') expect(s.breeds).toContain(g.catType);
      }
    }
  });
});

describe('progress and clearing', () => {
  it('tracks each goal type', () => {
    const stage = getStage(30)!;
    const p = stageProgress(stage, { ...base, lines: 10, explosions: 6, maxChain: 1, score: 100 });
    expect(p.map(g => g.done)).toEqual([false, true, false, false]);
    expect(p[0].current).toBe(10);
    expect(p[2].current).toBe(2); // maxChain 1 => 2연쇄
    expect(isStageCleared(stage, { ...base, lines: 25, explosions: 6, maxChain: 2, score: 60000 })).toBe(true);
  });

  it('counts breed goals from destroyed', () => {
    const stage = getStage(5)!;
    expect(isStageCleared(stage, { ...base, destroyed: { ginger: 16 } })).toBe(true);
    expect(isStageCleared(stage, { ...base, destroyed: { ginger: 15 } })).toBe(false);
  });
});

describe('limits and stars', () => {
  it('handles piece and time limits', () => {
    expect(isLimitExhausted({ type: 'pieces', count: 40 }, { ...base, piecesPlaced: 40 })).toBe(true);
    expect(isLimitExhausted({ type: 'seconds', count: 60 }, { ...base, elapsedMs: 59999 })).toBe(false);
    expect(remainingFraction({ type: 'pieces', count: 40 }, { ...base, piecesPlaced: 10 })).toBeCloseTo(0.75);
  });

  it('awards stars by remaining budget', () => {
    expect(starsFor({ type: 'pieces', count: 100 }, { ...base, piecesPlaced: 30 })).toBe(3);
    expect(starsFor({ type: 'pieces', count: 100 }, { ...base, piecesPlaced: 60 })).toBe(2);
    expect(starsFor({ type: 'pieces', count: 100 }, { ...base, piecesPlaced: 95 })).toBe(1);
  });
});
