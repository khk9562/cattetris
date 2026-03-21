import { BOARD_WIDTH, BOARD_HEIGHT } from './constants';
import type { Board, CellValue } from './types';
import type { ActivePiece } from './pieces';

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
