import type { ActivePiece } from '@/entities/piece';
import { CatBlock } from '@/entities/cat';
import styles from './NextPreview.module.css';

interface Props {
  piece: ActivePiece;
}

function normalizeShape(shape: number[][]): number[][] {
  const grid = Array.from({ length: 4 }, () => Array(4).fill(0));

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

  // Find face cell (topmost-leftmost) and tail cell (bottommost-rightmost)
  let faceY = -1, faceX = -1, tailY = -1, tailX = -1;
  const filled: { x: number; y: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c]) filled.push({ x: c, y: r });
    }
  }
  if (filled.length > 0) {
    filled.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
    faceY = filled[0].y; faceX = filled[0].x;
    filled.sort((a, b) => a.y !== b.y ? b.y - a.y : b.x - a.x);
    tailY = filled[0].y; tailX = filled[0].x;
  }

  return (
    <div className={styles.container}>
      <p className={styles.label}>다음 블록</p>
      <div className={styles.grid}>
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (!cell) {
              return <div key={`${y}-${x}`} className={styles.cell} />;
            }

            const connTop = y > 0 && grid[y - 1][x] === 1;
            const connRight = x < 3 && grid[y][x + 1] === 1;
            const connBottom = y < 3 && grid[y + 1]?.[x] === 1;
            const connLeft = x > 0 && grid[y][x - 1] === 1;

            const isFace = y === faceY && x === faceX;
            const isTail = y === tailY && x === tailX && filled.length > 1;

            return (
              <div key={`${y}-${x}`} className={styles.cell}>
                <CatBlock
                  catType={piece.catType}
                  conn={{ top: connTop, right: connRight, bottom: connBottom, left: connLeft }}
                  showFace={isFace}
                  showEars={isFace}
                  showTail={isTail}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
