export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export type CatType = 'ginger' | 'tuxedo' | 'russianBlue' | 'calico' | 'siamese' | 'black' | 'tabby' | 'darkTabby';

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  shape: number[][];
  catType: CatType;
  position: Position;
}

export type CellValue = CatType | null;

export type Board = CellValue[][];

export interface GameState {
  board: Board;
  currentPiece: Piece | null;
  nextPiece: Piece;
  score: number;
  highScore: number;
  combo: number;
  level: number;
  linesCleared: number;
  status: GameStatus;
  elapsedTime: number;
}
