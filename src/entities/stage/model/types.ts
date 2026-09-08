import type { CatType } from '@/entities/cat/@x/stage';
import type { DifficultyPreset } from '@/entities/difficulty/@x/stage';

export type StageGoal =
  | { type: 'lines'; count: number }
  | { type: 'explosions'; count: number }
  | { type: 'breed'; catType: CatType; count: number }
  | { type: 'chain'; steps: number }
  | { type: 'score'; points: number };

export type StageLimit = { type: 'pieces'; count: number } | { type: 'seconds'; count: number };

export interface StageDef {
  id: number;
  title: string;
  goals: StageGoal[];
  limit: StageLimit;
  /** 기본 '하' 프리셋 위에 덮어쓸 값 */
  preset: Partial<DifficultyPreset>;
  /** 등장 품종을 고정할 때 (품종 목표용). 없으면 난이도 규칙대로 */
  breeds?: CatType[];
}

/** 목표 판정에 필요한 진행 값 (엔진 상태에서 추출) */
export interface StageProgressInput {
  lines: number;
  explosions: number;
  destroyed: Partial<Record<CatType, number>>;
  maxChain: number;
  score: number;
  piecesPlaced: number;
  elapsedMs: number;
}

export interface GoalProgress {
  goal: StageGoal;
  label: string;
  current: number;
  target: number;
  done: boolean;
}
