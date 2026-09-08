export {
  createBoard,
  isInside,
  isValidPosition,
  pieceCells,
  placePiece,
  getCompletedRows,
  clearRows,
  getGhostPosition,
  findClusters,
  findMatches,
  getSplashCells,
  clearMatches,
  applyGravity,
  countByType,
} from './model/board';
export type { Cluster } from './model/board';
export type { Board, CellValue, Position } from './model/types';
