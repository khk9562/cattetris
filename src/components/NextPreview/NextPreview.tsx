import type { ActivePiece } from '../../game/pieces';
import CatBlock from '../CatBlock/CatBlock';
import styles from './NextPreview.module.css';

interface Props {
  piece: ActivePiece;
}

function normalizeShape(shape: number[][]): number[][] {
  const grid = Array.from({ length: 4 }, () => Array(4).fill(0));

  // Find bounding box of filled cells
  let minR = shape.length, maxR = 0, minC = shape[0].length, maxC = 0;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }

  const h = maxR - minR + 1;
  const w = maxC - minC + 1;
  const offsetR = Math.floor((4 - h) / 2);
  const offsetC = Math.floor((4 - w) / 2);

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (shape[r][c]) {
        grid[offsetR + (r - minR)][offsetC + (c - minC)] = 1;
      }
    }
  }

  return grid;
}

export default function NextPreview({ piece }: Props) {
  const grid = normalizeShape(piece.shapes[0]);

  let faceY = -1, faceX = -1;
  outer: for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) { faceY = r; faceX = c; break outer; }
    }
  }

  return (
    <div className={styles.container}>
      <p className={styles.label}>Next</p>
      <div className={styles.grid}>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div key={`${y}-${x}`} className={styles.cell}>
              {cell ? <CatBlock catType={piece.catType} showFace={y === faceY && x === faceX} /> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
