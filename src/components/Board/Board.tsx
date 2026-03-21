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

// Flood-fill to find connected groups and assign face/tail per group
function computeFeatures(board: (string | null)[][]) {
  const visited = Array.from({ length: 20 }, () => Array(10).fill(false));
  const faceMap = Array.from({ length: 20 }, () => Array(10).fill(false));
  const tailMap = Array.from({ length: 20 }, () => Array(10).fill(false));

  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      const t = getCatType(board, x, y);
      if (!t || visited[y][x]) continue;

      // BFS to collect connected group
      const group: { x: number; y: number }[] = [];
      const queue: { x: number; y: number }[] = [{ x, y }];
      visited[y][x] = true;

      while (queue.length > 0) {
        const cur = queue.shift()!;
        group.push(cur);
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
          const nx = cur.x + dx;
          const ny = cur.y + dy;
          if (ny >= 0 && ny < 20 && nx >= 0 && nx < 10 && !visited[ny][nx] && getCatType(board, nx, ny) === t) {
            visited[ny][nx] = true;
            queue.push({ x: nx, y: ny });
          }
        }
      }

      // Face: topmost row, then leftmost in that row
      group.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
      const face = group[0];
      faceMap[face.y][face.x] = true;

      // Tail: bottommost row, then rightmost in that row
      group.sort((a, b) => a.y !== b.y ? b.y - a.y : b.x - a.x);
      const tail = group[0];
      if (group.length > 1) {
        tailMap[tail.y][tail.x] = true;
      }
    }
  }

  return { faceMap, tailMap };
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

  const { faceMap, tailMap } = computeFeatures(renderBoard);

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

            const showFace = !isGhost && faceMap[y][x];
            const showEars = showFace;
            const showTail = !isGhost && tailMap[y][x];

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
