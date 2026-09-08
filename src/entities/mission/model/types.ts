import type { CatType } from '@/entities/cat/@x/mission';

export type MissionGoal =
  | { type: 'lines'; count: number }
  | { type: 'explosions'; count: number }
  | { type: 'chain'; steps: number }
  | { type: 'breed'; catType: CatType; count: number }
  | { type: 'score'; points: number };

export interface Mission {
  id: string;
  goal: MissionGoal;
  /** 보상 칭호 */
  title: string;
}

/** 하루 동안 누적되는 진행 값 */
export interface DailyProgress {
  lines: number;
  explosions: number;
  bestChain: number;
  destroyed: Partial<Record<CatType, number>>;
  score: number;
}

export const EMPTY_PROGRESS: DailyProgress = { lines: 0, explosions: 0, bestChain: 0, destroyed: {}, score: 0 };
