import type { Board as BoardType } from '../../game/types';
import type { ActivePiece } from '../../game/pieces';
import CatBlock from '../CatBlock/CatBlock';
import styles from './Board.module.css';

interface Props {
  board: BoardType;
  currentPiece: ActivePiece | null;
  ghostPiece: ActivePiece | null;
}

export default function Board({ board, currentPiece, ghostPiece }: Props) {
  const renderBoard = board.map(row => [...row]);

  // Overlay ghost piece
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

  // Overlay current piece
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
            const isGhost = typeof cell === 'string' && cell.startsWith('ghost_');
            const catType = isGhost ? cell.replace('ghost_', '') : cell;
            const isFirstOfPiece = currentPiece &&
              y === currentPiece.position.y &&
              x === currentPiece.position.x;

            return (
              <div key={`${y}-${x}`} className={styles.cell}>
                {catType ? (
                  <CatBlock
                    catType={catType as any}
                    ghost={isGhost}
                    showFace={!!isFirstOfPiece}
                  />
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
