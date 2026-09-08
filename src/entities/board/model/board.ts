import { BOARD_WIDTH, BOARD_HEIGHT } from '@/shared/config';
import type { Board, CellValue, Position } from './types';
import type { ActivePiece } from '@/entities/piece/@x/board';

export function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array<CellValue>(BOARD_WIDTH).fill(null));
}

export function isInside(x: number, y: number): boolean {
  return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
}

export function isValidPosition(board: Board, piece: ActivePiece): boolean {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (!piece.shape[row][col]) continue;
      const x = piece.position.x + col;
      const y = piece.position.y + row;
      if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return false;
      if (y >= 0 && board[y][x] !== null) return false;
    }
  }
  return true;
}

/** 조각이 차지하는 보드 좌표 목록 (보드 밖 셀 포함) */
export function pieceCells(piece: ActivePiece): Position[] {
  const cells: Position[] = [];
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) cells.push({ x: piece.position.x + col, y: piece.position.y + row });
    }
  }
  return cells;
}

export function placePiece(board: Board, piece: ActivePiece): Board {
  const newBoard = board.map(row => [...row]);
  for (const { x, y } of pieceCells(piece)) {
    if (isInside(x, y)) newBoard[y][x] = piece.catType;
  }
  return newBoard;
}

export function getCompletedRows(board: Board): number[] {
  const rows: number[] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (board[y].every(cell => cell !== null)) rows.push(y);
  }
  return rows;
}

export function clearRows(board: Board, rows: number[]): Board {
  const kept = board.filter((_, i) => !rows.includes(i));
  const emptyRows = Array.from({ length: rows.length }, () => Array<CellValue>(BOARD_WIDTH).fill(null));
  return [...emptyRows, ...kept];
}

export function getGhostPosition(board: Board, piece: ActivePiece): ActivePiece {
  let y = piece.position.y;
  while (isValidPosition(board, { ...piece, position: { x: piece.position.x, y: y + 1 } })) y++;
  return { ...piece, position: { x: piece.position.x, y } };
}

export interface Cluster {
  catType: NonNullable<CellValue>;
  cells: Position[];
}

/** 4방향으로 이어진 같은 품종 뭉치 중 minSize 이상인 것만 돌려준다. */
export function findClusters(board: Board, minSize: number): Cluster[] {
  const visited = Array.from({ length: BOARD_HEIGHT }, () => Array<boolean>(BOARD_WIDTH).fill(false));
  const clusters: Cluster[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const type = board[y][x];
      if (!type || visited[y][x]) continue;

      const cells: Position[] = [];
      const queue: Position[] = [{ x, y }];
      visited[y][x] = true;

      while (queue.length > 0) {
        const cur = queue.shift()!;
        cells.push(cur);
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]] as const) {
          const nx = cur.x + dx;
          const ny = cur.y + dy;
          if (isInside(nx, ny) && !visited[ny][nx] && board[ny][nx] === type) {
            visited[ny][nx] = true;
            queue.push({ x: nx, y: ny });
          }
        }
      }

      if (cells.length >= minSize) clusters.push({ catType: type, cells });
    }
  }
  return clusters;
}

/** 이전 호환: 뭉치 셀을 평평한 목록으로 */
export function findMatches(board: Board, minSize: number): Position[] {
  return findClusters(board, minSize).flatMap(c => c.cells);
}

/**
 * 폭발 여파: 주어진 셀들의 8방향 인접 1칸 중 채워져 있고 뭉치 자체에 속하지 않는 셀.
 */
export function getSplashCells(board: Board, cells: Position[]): Position[] {
  const core = new Set(cells.map(c => `${c.x},${c.y}`));
  const out = new Map<string, Position>();
  for (const c of cells) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const x = c.x + dx;
        const y = c.y + dy;
        const key = `${x},${y}`;
        if (isInside(x, y) && board[y][x] !== null && !core.has(key)) out.set(key, { x, y });
      }
    }
  }
  return [...out.values()];
}

export function clearMatches(board: Board, cells: Position[]): Board {
  const newBoard = board.map(row => [...row]);
  for (const { x, y } of cells) {
    if (isInside(x, y)) newBoard[y][x] = null;
  }
  return newBoard;
}

export function applyGravity(board: Board): { newBoard: Board; changed: boolean } {
  const newBoard = board.map(row => [...row]);
  let changed = false;

  for (let x = 0; x < BOARD_WIDTH; x++) {
    const stack: CellValue[] = [];
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y][x] !== null) stack.push(newBoard[y][x]);
    }
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      const val = stack.length > 0 ? stack.shift()! : null;
      if (newBoard[y][x] !== val) {
        newBoard[y][x] = val;
        changed = true;
      }
    }
  }
  return { newBoard, changed };
}

/** 셀별 품종 개수 집계 (도감 통계용) */
export function countByType(board: Board, cells: Position[]): Partial<Record<NonNullable<CellValue>, number>> {
  const counts: Partial<Record<NonNullable<CellValue>, number>> = {};
  for (const { x, y } of cells) {
    const t = isInside(x, y) ? board[y][x] : null;
    if (t) counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}
