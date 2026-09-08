import { useCallback, useState } from 'react';
import { TOTALS_KEY } from '@/shared/config';
import { readJson, writeJson } from '@/shared/lib';
import { EMPTY_TOTALS, type PlayerTotals, type SessionRecord } from './types';

export function applySession(t: PlayerTotals, r: SessionRecord): PlayerTotals {
  return {
    games: t.games + 1,
    playMs: t.playMs + r.elapsedMs,
    lines: t.lines + r.lines,
    explosions: t.explosions + r.explosions,
    bestChain: Math.max(t.bestChain, r.maxChain + 1),
    totalScore: t.totalScore + r.score,
    bestLevel: r.mode === 'endless'
      ? { ...t.bestLevel, [r.difficulty]: Math.max(t.bestLevel[r.difficulty] ?? 0, r.level) }
      : t.bestLevel,
  };
}

export function usePlayerStats() {
  const [totals, setTotals] = useState<PlayerTotals>(() => ({ ...EMPTY_TOTALS, ...readJson<Partial<PlayerTotals>>(TOTALS_KEY, {}), bestLevel: { ...EMPTY_TOTALS.bestLevel, ...readJson<Partial<PlayerTotals>>(TOTALS_KEY, {}).bestLevel } }));

  const record = useCallback((r: SessionRecord) => {
    setTotals(prev => {
      const next = applySession(prev, r);
      writeJson(TOTALS_KEY, next);
      return next;
    });
  }, []);

  return { totals, record };
}
