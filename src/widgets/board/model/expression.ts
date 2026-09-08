import type { Board } from '@/entities/board';
import type { CatExpression } from '@/entities/cat';
import type { ClearKind } from '@/features/game-session';
import { BOARD_HEIGHT } from '@/shared/config';

/** 이 높이(줄) 이상 쌓이면 모두 겁먹은 표정 */
export const DANGER_ROWS = 14;

export function stackHeight(board: Board): number {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (board[y].some(c => c !== null)) return BOARD_HEIGHT - y;
  }
  return 0;
}

export interface ExpressionContext {
  gameOver: boolean;
  danger: boolean;
  /** 이 셀이 조작 중인 조각의 일부인가 */
  isActive: boolean;
  effect?: ClearKind;
}

export function pickExpression({ gameOver, danger, isActive, effect }: ExpressionContext): CatExpression {
  if (gameOver) return 'sleepy';
  if (effect === 'cluster') return 'dizzy';
  if (effect === 'line' || effect === 'splash') return 'happy';
  if (isActive) return 'idle';
  if (danger) return 'scared';
  return 'idle';
}

/** 좌표 해시로 셀마다 다른 깜빡임 지연(0~4초) */
export function blinkDelayFor(x: number, y: number): number {
  return ((x * 7 + y * 13) % 17) / 17 * 4;
}
