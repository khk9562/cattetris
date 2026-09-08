import { CatBlock } from '@/entities/cat/@x/piece';
import type { ActivePiece } from '../model/pieces';
import styles from './PiecePreview.module.css';

interface Props {
  piece: ActivePiece;
  
}

function normalizeShape(shape: number[][]): number[][] {
  const grid = Array.from({ length: 4 }, () => Array<number>(4).fill(0));
  let minR = shape.length, maxR = 0, minC = shape[0].length, maxC = 0;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        minR = Math.min(minR, r); maxR = Math.max(maxR, r);
        minC = Math.min(minC, c); maxC = Math.max(maxC, c);
      }
    }
  }
  const offsetR = Math.floor((4 - (maxR - minR + 1)) / 2);
  const offsetC = Math.floor((4 - (maxC - minC + 1)) / 2);
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (shape[r][c]) grid[offsetR + (r - minR)][offsetC + (c - minC)] = 1;
    }
  }
  return grid;
}

/** 스폰 상태의 조각을 4x4 격자에 고양이 모양으로 그린다. */
export default function PiecePreview({ piece }: Props) {
  const grid = normalizeShape(piece.shapes[0]);
  const filled: { x: number; y: number }[] = [];
  grid.forEach((row, y) => row.forEach((c, x) => { if (c) filled.push({ x, y }); }));
  const byFace = [...filled].sort((a, b) => (a.y !== b.y ? a.y - b.y : a.x - b.x))[0];
  const byTail = [...filled].sort((a, b) => (a.y !== b.y ? b.y - a.y : b.x - a.x))[0];

  return (
    <div className={styles.grid}>
      {grid.map((row, y) =>
        row.map((cell, x) => {
          if (!cell) return <div key={`${y}-${x}`} className={styles.cell} />;
          const isFace = byFace.x === x && byFace.y === y;
          const isTail = filled.length > 1 && byTail.x === x && byTail.y === y;
          return (
            <div key={`${y}-${x}`} className={styles.cell}>
              <CatBlock
                catType={piece.catType}
                conn={{
                  top: y > 0 && grid[y - 1][x] === 1,
                  right: x < 3 && grid[y][x + 1] === 1,
                  bottom: y < 3 && grid[y + 1][x] === 1,
                  left: x > 0 && grid[y][x - 1] === 1,
                }}
                showFace={isFace}
                showEars={isFace}
                showTail={isTail}
              />
            </div>
          );
        }),
      )}
    </div>
  );
}
