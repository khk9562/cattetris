import type { CatType } from '@/entities/cat/@x/board';

export type CellValue = CatType | null;

export type Board = CellValue[][];

export interface Position {
  x: number;
  y: number;
}
