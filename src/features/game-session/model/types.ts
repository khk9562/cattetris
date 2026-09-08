import type { Board, Position } from '@/entities/board';
import type { CatType } from '@/entities/cat';
import type { ActivePiece, TetrominoId } from '@/entities/piece';
import type { DifficultyPreset } from '@/entities/difficulty';
import type { StageDef } from '@/entities/stage';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover' | 'cleared';

export type GameMode = 'endless' | 'stage' | 'tutorial';

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

export type FeedbackKind =
  | 'start'
  | 'move'
  | 'rotate'
  | 'softDrop'
  | 'hardDrop'
  | 'lock'
  | 'hold'
  | 'line'
  | 'explode'
  | 'chain'
  | 'combo'
  | 'levelup'
  | 'gameover'
  | 'cleared';

/** 사운드/진동이 소비하는 이벤트. seq는 단조 증가, strength는 종류별 세기(뭉치 크기, 연쇄 단계 등) */
export interface Feedback {
  seq: number;
  kind: FeedbackKind;
  strength?: number;
}

export interface SessionStats {
  maxChain: number;
  explosions: number;
  linesCleared: number;
}

export interface EngineState {
  status: GameStatus;
  phase: Phase;
  mode: GameMode;
  /** 스테이지 모드일 때의 정의 */
  stage: StageDef | null;
  /** 고정된 조각 수 (스테이지 제한용) */
  piecesPlaced: number;
  /** 튜토리얼 등에서 미리 정한 조각 순서. 비면 7-bag으로 이어진다 */
  scripted: ScriptedPiece[];
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
  /** 최근 피드백 이벤트 (최대 8개 유지) */
  events: Feedback[];
  eventSeq: number;

  destroyed: Partial<Record<CatType, number>>;
  stats: SessionStats;
}

export interface ScriptedPiece {
  id: TetrominoId;
  catType: CatType;
}

/** 시작 시 보드와 조각 순서를 미리 정한다 (튜토리얼) */
export interface StartSetup {
  board?: Board;
  pieces?: ScriptedPiece[];
}

export type EngineAction =
  | {
      type: 'start';
      preset: DifficultyPreset;
      breeds: CatType[];
      seed: number;
      stage?: StageDef;
      mode?: GameMode;
      /** 스테이지/튜토리얼처럼 프리셋 일부만 덮어쓸 때 */
      presetOverride?: Partial<DifficultyPreset>;
      setup?: StartSetup;
    }
  | { type: 'tick'; dt: number }
  | { type: 'move'; dx: -1 | 1 }
  | { type: 'softDrop' }
  | { type: 'hardDrop' }
  | { type: 'rotate'; direction: 1 | -1 }
  | { type: 'hold' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'home' };
