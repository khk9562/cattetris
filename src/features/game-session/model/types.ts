import type { Board, Position } from '@/entities/board';
import type { CatType } from '@/entities/cat';
import type { ActivePiece, TetrominoId } from '@/entities/piece';
import type { DifficultyPreset } from '@/entities/difficulty';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

/** active: 조각 조작 중, clearing: 제거 연출 중, settling: 중력 낙하 후 다음 연쇄 판정 대기 */
export type Phase = 'active' | 'clearing' | 'settling';

export type ClearKind = 'line' | 'cluster' | 'splash';

export interface ClearCell extends Position {
  kind: ClearKind;
}

export type PopupKind = 'line' | 'cluster' | 'chain' | 'combo' | 'level';

export interface Popup {
  id: number;
  /** 보드 셀 좌표 (소수 허용) */
  x: number;
  y: number;
  text: string;
  kind: PopupKind;
  bornAt: number;
}

export type FeedbackKind = 'lock' | 'line' | 'explode' | 'hold' | 'gameover' | 'levelup' | 'hardDrop';

export interface Feedback {
  seq: number;
  kind: FeedbackKind;
}

export interface SessionStats {
  maxChain: number;
  explosions: number;
  linesCleared: number;
}

export interface EngineState {
  status: GameStatus;
  phase: Phase;
  preset: DifficultyPreset;
  /** 이번 판에서 등장 가능한 품종 순서 (앞에서부터 breedCount만큼 사용) */
  breedOrder: CatType[];

  board: Board;
  current: ActivePiece | null;
  queue: ActivePiece[];
  hold: ActivePiece | null;
  holdUsed: boolean;
  bag: TetrominoId[];
  seed: number;
  lastBreed: CatType | null;

  score: number;
  level: number;
  lines: number;
  /** 연속으로 무언가를 지운 조각 수 */
  combo: number;
  /** 현재 정착 단계의 연쇄 횟수 (0 = 첫 제거) */
  chain: number;
  clearedThisPiece: boolean;

  elapsedMs: number;
  gravityMs: number;
  lockMs: number;
  lockResets: number;
  lowestY: number;
  phaseMs: number;

  clearing: ClearCell[];
  popups: Popup[];
  popupSeq: number;
  feedback: Feedback | null;

  destroyed: Partial<Record<CatType, number>>;
  stats: SessionStats;
}

export type EngineAction =
  | { type: 'start'; preset: DifficultyPreset; breeds: CatType[]; seed: number }
  | { type: 'tick'; dt: number }
  | { type: 'move'; dx: -1 | 1 }
  | { type: 'softDrop' }
  | { type: 'hardDrop' }
  | { type: 'rotate'; direction: 1 | -1 }
  | { type: 'hold' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'home' };
