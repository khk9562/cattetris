import { CatBlock } from '@/entities/cat/@x/piece';
import { pieceCellInfo, type ActivePiece, type PieceCell } from '../model/pieces';
import styles from './PiecePreview.module.css';

interface Props {
  piece: ActivePiece;
}

/** 스폰 상태의 조각을 4x4 격자 가운데에 고양이 모양으로 그린다. 셀마다 자기 품종을 쓴다 */
export default function PiecePreview({ piece }: Props) {
  const spawn: ActivePiece = { ...piece, shape: piece.shapes[0], rotationIndex: 0, position: { x: 0, y: 0 } };
  const cells = pieceCellInfo(spawn);
  const minX = Math.min(...cells.map(c => c.x));
  const maxX = Math.max(...cells.map(c => c.x));
  const minY = Math.min(...cells.map(c => c.y));
  const maxY = Math.max(...cells.map(c => c.y));
  const offX = Math.floor((4 - (maxX - minX + 1)) / 2) - minX;
  const offY = Math.floor((4 - (maxY - minY + 1)) / 2) - minY;
  const at = new Map<string, PieceCell>();
  for (const c of cells) at.set(`${c.y + offY},${c.x + offX}`, c);

  return (
    <div className={styles.grid}>
      {Array.from({ length: 4 }, (_, y) =>
        Array.from({ length: 4 }, (_, x) => {
          const cell = at.get(`${y},${x}`);
          if (!cell) return <div key={`${y}-${x}`} className={styles.cell} />;
          return (
            <div key={`${y}-${x}`} className={styles.cell}>
              <CatBlock catType={cell.type} conn={cell.conn} showFace={cell.face} showEars={cell.face} showTail={cell.tail} />
            </div>
          );
        }),
      )}
    </div>
  );
}
