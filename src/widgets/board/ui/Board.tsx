import { memo, useCallback, useMemo, useState } from 'react';
import type { Board as BoardType } from '@/entities/board';
import type { ActivePiece } from '@/entities/piece';
import { CatBlock, type CatType } from '@/entities/cat';
import type { ClearCell, ClearKind, Popup } from '@/features/game-session';
import { BOARD_HEIGHT, BOARD_WIDTH } from '@/shared/config';
import ExplosionLayer from './ExplosionLayer';
import styles from './Board.module.css';

interface Props {
  board: BoardType;
  currentPiece: ActivePiece | null;
  ghostPiece: ActivePiece | null;
  clearing: ClearCell[];
  popups: Popup[];
}

type RenderCell = { type: CatType; ghost: boolean } | null;

function cellAt(grid: RenderCell[][], x: number, y: number): RenderCell {
  if (y < 0 || y >= BOARD_HEIGHT || x < 0 || x >= BOARD_WIDTH) return null;
  return grid[y][x];
}

function sameCat(grid: RenderCell[][], x: number, y: number, type: CatType, ghost: boolean): boolean {
  const c = cellAt(grid, x, y);
  return !!c && c.type === type && c.ghost === ghost;
}

/** 연결된 같은 품종 그룹마다 얼굴(위-왼쪽)과 꼬리(아래-오른쪽) 셀을 정한다. */
function computeFeatures(grid: RenderCell[][]) {
  const visited = Array.from({ length: BOARD_HEIGHT }, () => Array<boolean>(BOARD_WIDTH).fill(false));
  const faceMap = Array.from({ length: BOARD_HEIGHT }, () => Array<boolean>(BOARD_WIDTH).fill(false));
  const tailMap = Array.from({ length: BOARD_HEIGHT }, () => Array<boolean>(BOARD_WIDTH).fill(false));

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const c = grid[y][x];
      if (!c || visited[y][x]) continue;
      const group: { x: number; y: number }[] = [];
      const queue = [{ x, y }];
      visited[y][x] = true;
      while (queue.length) {
        const cur = queue.shift()!;
        group.push(cur);
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]] as const) {
          const nx = cur.x + dx;
          const ny = cur.y + dy;
          if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH && !visited[ny][nx] && sameCat(grid, nx, ny, c.type, c.ghost)) {
            visited[ny][nx] = true;
            queue.push({ x: nx, y: ny });
          }
        }
      }
      group.sort((a, b) => (a.y !== b.y ? a.y - b.y : a.x - b.x));
      faceMap[group[0].y][group[0].x] = true;
      if (group.length > 1) {
        group.sort((a, b) => (a.y !== b.y ? b.y - a.y : b.x - a.x));
        tailMap[group[0].y][group[0].x] = true;
      }
    }
  }
  return { faceMap, tailMap };
}

function buildGrid(board: BoardType, current: ActivePiece | null, ghost: ActivePiece | null): RenderCell[][] {
  const grid: RenderCell[][] = board.map(row => row.map(c => (c ? { type: c, ghost: false } : null)));
  const paint = (p: ActivePiece, isGhost: boolean) => {
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (!p.shape[r][c]) continue;
        const x = p.position.x + c;
        const y = p.position.y + r;
        if (y < 0 || y >= BOARD_HEIGHT || x < 0 || x >= BOARD_WIDTH) continue;
        if (isGhost && grid[y][x]) continue;
        grid[y][x] = { type: p.catType, ghost: isGhost };
      }
    }
  };
  if (ghost) paint(ghost, true);
  if (current) paint(current, false);
  return grid;
}

function Board({ board, currentPiece, ghostPiece, clearing, popups }: Props) {
  const grid = useMemo(() => buildGrid(board, currentPiece, ghostPiece), [board, currentPiece, ghostPiece]);
  const { faceMap, tailMap } = useMemo(() => computeFeatures(grid), [grid]);
  const clearMap = useMemo(() => {
    const m = new Map<string, ClearKind>();
    for (const c of clearing) m.set(`${c.x},${c.y}`, c.kind);
    return m;
  }, [clearing]);

  // 폭발 강도에 따른 보드 흔들림 (CSS 변수로 진폭 전달)
  const [shake, setShake] = useState<{ id: number; strength: number } | null>(null);
  const onShake = useCallback((strength: number) => setShake({ id: Date.now(), strength }), []);

  return (
    <div
      className={`${styles.wrapper} ${shake ? styles.shaking : ''}`}
      style={shake ? ({ '--shake': `${(0.15 + shake.strength * 0.35).toFixed(2)}rem` } as React.CSSProperties) : undefined}
      onAnimationEnd={() => setShake(null)}
    >
      <div className={styles.shelfTop} />
      <div className={styles.shelfBottom} />
      <div className={styles.grid}>
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (!cell) return <div key={`${y}-${x}`} className={styles.cell} />;
            const effect = clearMap.get(`${x},${y}`);
            return (
              <div key={`${y}-${x}`} className={styles.cell}>
                <CatBlock
                  catType={cell.type}
                  ghost={cell.ghost}
                  conn={{
                    top: sameCat(grid, x, y - 1, cell.type, cell.ghost),
                    right: sameCat(grid, x + 1, y, cell.type, cell.ghost),
                    bottom: sameCat(grid, x, y + 1, cell.type, cell.ghost),
                    left: sameCat(grid, x - 1, y, cell.type, cell.ghost),
                  }}
                  showFace={!cell.ghost && faceMap[y][x]}
                  showEars={!cell.ghost && faceMap[y][x]}
                  showTail={!cell.ghost && tailMap[y][x]}
                  effect={effect}
                />
              </div>
            );
          }),
        )}
      </div>
      <ExplosionLayer board={board} clearing={clearing} onShake={onShake} />
      {popups.map(p => (
        <div
          key={p.id}
          className={`${styles.popup} ${styles[`popup_${p.kind}`] ?? ''}`}
          style={{ left: `${((p.x + 0.5) / BOARD_WIDTH) * 100}%`, top: `${((p.y + 0.5) / BOARD_HEIGHT) * 100}%` }}
        >
          {p.text}
        </div>
      ))}
    </div>
  );
}

export default memo(Board);
