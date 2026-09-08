import type { DifficultyId } from '@/entities/difficulty';

export interface PlayerTotals {
  games: number;
  playMs: number;
  lines: number;
  explosions: number;
  bestChain: number;
  totalScore: number;
  bestLevel: Record<DifficultyId, number>;
}

export const EMPTY_TOTALS: PlayerTotals = {
  games: 0,
  playMs: 0,
  lines: 0,
  explosions: 0,
  bestChain: 0,
  totalScore: 0,
  bestLevel: { easy: 0, normal: 0, hard: 0 },
};

/** 한 판이 끝났을 때 기록할 값 */
export interface SessionRecord {
  mode: 'endless' | 'stage' | 'tutorial';
  difficulty: DifficultyId;
  elapsedMs: number;
  lines: number;
  explosions: number;
  maxChain: number;
  score: number;
  level: number;
}
