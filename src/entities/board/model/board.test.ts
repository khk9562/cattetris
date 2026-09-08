import { describe, expect, it } from 'vitest';
import { BOARD_HEIGHT, BOARD_WIDTH } from '@/shared/config';
import {
  applyGravity,
  clearMatches,
  clearRows,
  createBoard,
  findMatches,
  getCompletedRows,
  getGhostPosition,
  isValidPosition,
  placePiece,
} from './board';
import type { Board } from './types';

const O_SHAPE = [
  [1, 1],
  [1, 1],
];

function piece(x: number, y: number, shape = O_SHAPE) {
  return { shape, shapes: [shape, shape, shape, shape], rotationIndex: 0, catType: 'ginger' as const, position: { x, y } };
}

describe('createBoard', () => {
  it('creates an empty 10x20 grid', () => {
    const board = createBoard();
    expect(board).toHaveLength(BOARD_HEIGHT);
    expect(board.every(row => row.length === BOARD_WIDTH && row.every(c => c === null))).toBe(true);
  });
});

describe('isValidPosition', () => {
  it('rejects positions outside the walls and floor', () => {
    const board = createBoard();
    expect(isValidPosition(board, piece(-1, 0))).toBe(false);
    expect(isValidPosition(board, piece(BOARD_WIDTH - 1, 0))).toBe(false);
    expect(isValidPosition(board, piece(0, BOARD_HEIGHT - 1))).toBe(false);
    expect(isValidPosition(board, piece(0, BOARD_HEIGHT - 2))).toBe(true);
  });

  it('allows cells above the visible board', () => {
    expect(isValidPosition(createBoard(), piece(4, -1))).toBe(true);
  });

  it('rejects overlap with placed cells', () => {
    const board = placePiece(createBoard(), piece(4, 18));
    expect(isValidPosition(board, piece(4, 17))).toBe(false);
    expect(isValidPosition(board, piece(4, 16))).toBe(true);
  });
});

describe('line clears', () => {
  it('detects and clears completed rows, shifting the rest down', () => {
    const board: Board = createBoard();
    board[19] = Array(BOARD_WIDTH).fill('tabby');
    board[18][0] = 'black';
    expect(getCompletedRows(board)).toEqual([19]);
    const cleared = clearRows(board, [19]);
    expect(cleared[19][0]).toBe('black');
    expect(cleared[19].slice(1).every(c => c === null)).toBe(true);
    expect(cleared).toHaveLength(BOARD_HEIGHT);
  });
});

describe('getGhostPosition', () => {
  it('drops the piece to the lowest valid row', () => {
    const ghost = getGhostPosition(createBoard(), piece(3, 0));
    expect(ghost.position).toEqual({ x: 3, y: BOARD_HEIGHT - 2 });
  });
});

describe('findMatches / clearMatches / applyGravity', () => {
  it('finds 4-connected groups of the same breed at or above the threshold', () => {
    const board = createBoard();
    for (let x = 0; x < 5; x++) board[19][x] = 'siamese';
    board[18][0] = 'siamese';
    board[19][9] = 'siamese';
    expect(findMatches(board, 6)).toHaveLength(6);
    expect(findMatches(board, 7)).toHaveLength(0);
  });

  it('applies column gravity after clearing', () => {
    let board = createBoard();
    board[19][2] = 'black';
    board[18][2] = 'ginger';
    board[17][2] = 'tabby';
    board = clearMatches(board, [{ x: 2, y: 18 }]);
    const { newBoard, changed } = applyGravity(board);
    expect(changed).toBe(true);
    expect(newBoard[19][2]).toBe('black');
    expect(newBoard[18][2]).toBe('tabby');
    expect(newBoard[17][2]).toBeNull();
  });
});
