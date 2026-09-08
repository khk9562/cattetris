import { describe, expect, it } from 'vitest';
import { dateKey, generateDailyMissions, mergeProgress, missionProgress } from './missions';
import { EMPTY_PROGRESS } from './types';

describe('generateDailyMissions', () => {
  it('is deterministic per date and gives three distinct kinds', () => {
    const a = generateDailyMissions('2026-09-08');
    const b = generateDailyMissions('2026-09-08');
    expect(a).toEqual(b);
    expect(a).toHaveLength(3);
    expect(new Set(a.map(m => m.goal.type)).size).toBe(3);
    expect(generateDailyMissions('2026-09-09')).not.toEqual(a);
  });
});

describe('progress', () => {
  it('merges daily progress and evaluates goals', () => {
    const p = mergeProgress({ ...EMPTY_PROGRESS, lines: 4, bestChain: 2, destroyed: { ginger: 3 } }, { ...EMPTY_PROGRESS, lines: 6, bestChain: 1, destroyed: { ginger: 2, black: 1 } });
    expect(p.lines).toBe(10);
    expect(p.bestChain).toBe(2);
    expect(p.destroyed).toEqual({ ginger: 5, black: 1 });
    expect(missionProgress({ type: 'lines', count: 10 }, p).done).toBe(true);
    expect(missionProgress({ type: 'breed', catType: 'ginger', count: 6 }, p)).toEqual({ current: 5, target: 6, done: false });
  });

  it('formats the date key', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
