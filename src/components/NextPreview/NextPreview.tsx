import type { ActivePiece } from '../../game/pieces';
import CatBlock from '../CatBlock/CatBlock';
import styles from './NextPreview.module.css';

interface Props {
  piece: ActivePiece;
}

export default function NextPreview({ piece }: Props) {
  const shape = piece.shapes[0];

  // Find first filled cell for face
  let faceY = -1, faceX = -1;
  outer: for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) { faceY = r; faceX = c; break outer; }
    }
  }

  return (
    <div className={styles.container}>
      <p className={styles.label}>Next</p>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${shape[0].length}, 1fr)`,
          gridTemplateRows: `repeat(${shape.length}, 1fr)`,
        }}
      >
        {shape.map((row, y) =>
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
