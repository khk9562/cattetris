import { BOARD_WIDTH, BOARD_HEIGHT } from '@/shared/config';
import type { Board, CellValue } from './types';
import type { ActivePiece } from '@/entities/piece/@x/board';

export function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array<CellValue>(BOARD_WIDTH).fill(null)
  );
}

export function isValidPosition(board: Board, piece: ActivePiece): boolean {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const newX = piece.position.x + col;
        const newY = piece.position.y + row;
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false;
        if (newY >= 0 && board[newY][newX] !== null) return false;
      }
    }
  }
  return true;
}

export function placePiece(board: Board, piece: ActivePiece): Board {
  const newBoard = board.map(row => [...row]);
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const x = piece.position.x + col;
        const y = piece.position.y + row;
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          newBoard[y][x] = piece.catType;
        }
      }
    }
  }
  return newBoard;
}

export function getCompletedRows(board: Board): number[] {
  const rows: number[] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (board[y].every(cell => cell !== null)) {
      rows.push(y);
    }
  }
  return rows;
}

export function clearRows(board: Board, rows: number[]): Board {
  const newBoard = board.filter((_, i) => !rows.includes(i));
  const emptyRows = Array.from({ length: rows.length }, () =>
    Array<CellValue>(BOARD_WIDTH).fill(null)
  );
  return [...emptyRows, ...newBoard];
}

export function getGhostPosition(board: Board, piece: ActivePiece): ActivePiece {
  let ghost = { ...piece, position: { ...piece.position } };
  while (isValidPosition(board, { ...ghost, position: { ...ghost.position, y: ghost.position.y + 1 } })) {
    ghost.position.y++;
  }
  return ghost;
}

export function findMatches(board: Board, minSize: number = 15): { x: number; y: number }[] {
  const visited = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(false));
  const allMatches: { x: number; y: number }[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const type = board[y][x];
      if (!type || visited[y][x]) continue;

      const group: { x: number; y: number }[] = [];
      const queue: { x: number; y: number }[] = [{ x, y }];
      visited[y][x] = true;

      while (queue.length > 0) {
        const cur = queue.shift()!;
        group.push(cur);

        const neighbors = [
          { x: cur.x, y: cur.y - 1 },
          { x: cur.x + 1, y: cur.y },
          { x: cur.x, y: cur.y + 1 },
          { x: cur.x - 1, y: cur.y },
        ];

        for (const n of neighbors) {
          if (n.y >= 0 && n.y < BOARD_HEIGHT && n.x >= 0 && n.x < BOARD_WIDTH) {
            if (!visited[n.y][n.x] && board[n.y][n.x] === type) {
              visited[n.y][n.x] = true;
              queue.push({ x: n.x, y: n.y });
            }
          }
        }
      }

      if (group.length >= minSize) {
        allMatches.push(...group);
      }
    }
  }

  return allMatches;
}

export function clearMatches(board: Board, matches: { x: number; y: number }[]): Board {
  const newBoard = board.map(row => [...row]);
  for (const match of matches) {
    newBoard[match.y][match.x] = null;
  }
  return newBoard;
}

export function applyGravity(board: Board): { newBoard: Board; changed: boolean } {
  const newBoard = board.map(row => [...row]);
  let changed = false;

  for (let x = 0; x < BOARD_WIDTH; x++) {
    const colBlocks: CellValue[] = [];
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y][x] !== null) colBlocks.push(newBoard[y][x]);
    }

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      const val = colBlocks.length > 0 ? colBlocks.shift()! : null;
      if (newBoard[y][x] !== val) {
        newBoard[y][x] = val;
        changed = true;
      }
    }
  }
  return { newBoard, changed };
}
