import type { Board as BoardType } from '../../game/types';
import type { ActivePiece } from '../../game/pieces';
import CatBlock from '../CatBlock/CatBlock';
import styles from './Board.module.css';

interface Props {
  board: BoardType;
  currentPiece: ActivePiece | null;
  ghostPiece: ActivePiece | null;
}

function getCatType(board: (string | null)[][], x: number, y: number): string | null {
  if (y < 0 || y >= 20 || x < 0 || x >= 10) return null;
  const cell = board[y][x];
  if (!cell) return null;
  if (typeof cell === 'string' && cell.startsWith('ghost_')) return null;
  return cell;
}

export default function Board({ board, currentPiece, ghostPiece }: Props) {
  const renderBoard = board.map(row => [...row]);

  if (ghostPiece) {
    for (let row = 0; row < ghostPiece.shape.length; row++) {
      for (let col = 0; col < ghostPiece.shape[row].length; col++) {
        if (ghostPiece.shape[row][col]) {
          const x = ghostPiece.position.x + col;
          const y = ghostPiece.position.y + row;
          if (y >= 0 && y < 20 && x >= 0 && x < 10 && renderBoard[y][x] === null) {
            renderBoard[y][x] = `ghost_${ghostPiece.catType}` as any;
          }
        }
      }
    }
  }

  if (currentPiece) {
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col]) {
          const x = currentPiece.position.x + col;
          const y = currentPiece.position.y + row;
          if (y >= 0 && y < 20 && x >= 0 && x < 10) {
            renderBoard[y][x] = currentPiece.catType;
          }
        }
      }
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.shelfTop} />
      <div className={styles.shelfBottom} />
      <div className={styles.grid}>
        {renderBoard.map((row, y) =>
          row.map((cell, x) => {
            if (!cell) {
              return <div key={`${y}-${x}`} className={styles.cell} />;
            }

            const isGhost = typeof cell === 'string' && cell.startsWith('ghost_');
            const catType = isGhost ? cell.replace('ghost_', '') : cell;
            const t = isGhost ? null : (catType as string);

            const connTop = t ? getCatType(renderBoard, x, y - 1) === t : false;
            const connRight = t ? getCatType(renderBoard, x + 1, y) === t : false;
            const connBottom = t ? getCatType(renderBoard, x, y + 1) === t : false;
            const connLeft = t ? getCatType(renderBoard, x - 1, y) === t : false;

            const showFace = !isGhost && !connTop && !connLeft;
            const showEars = showFace;
            const hasConn = connTop || connRight || connBottom || connLeft;
            const showTail = !isGhost && !connBottom && !connRight && hasConn;

            return (
              <div key={`${y}-${x}`} className={styles.cell}>
                <CatBlock
                  catType={catType as any}
                  ghost={isGhost}
                  conn={{ top: connTop, right: connRight, bottom: connBottom, left: connLeft }}
                  showFace={showFace}
                  showEars={showEars}
                  showTail={showTail}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
