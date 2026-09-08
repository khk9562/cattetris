import { memo, useCallback, useMemo, useState } from 'react';
import type { Board as BoardType, Position } from '@/entities/board';
import type { ActivePiece } from '@/entities/piece';
import { CatBlock, type CatType } from '@/entities/cat';
import type { ClearCell, ClearKind, Popup } from '@/features/game-session';
import { BOARD_HEIGHT, BOARD_WIDTH } from '@/shared/config';
import ExplosionLayer from './ExplosionLayer';
import { DANGER_ROWS, blinkDelayFor, pickExpression, stackHeight } from '../model/expression';
import styles from './Board.module.css';

interface Props {
  board: BoardType;
  currentPiece: ActivePiece | null;
  ghostPiece: ActivePiece | null;
  clearing: ClearCell[];
  popups: Popup[];
  gameOver?: boolean;
  /** 방금 고정된 셀 (착지 스쿼시) */
  lastLocked?: { cells: Position[]; seq: number } | null;
}

type RenderCell = { type: CatType; ghost: boolean; active?: boolean } | null;

interface FloatCell {
  x: number;
  y: number;
  conn: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  face: boolean;
  tail: boolean;
}

/** 조각 하나의 셀 목록과 조각 내부 연결/얼굴/꼬리 정보 */
function pieceFloatCells(p: ActivePiece): FloatCell[] {
  const cells: { r: number; c: number }[] = [];
  p.shape.forEach((row, r) => row.forEach((v, c) => { if (v) cells.push({ r, c }); }));
  const has = (r: number, c: number) => !!p.shape[r]?.[c];
  const sorted = [...cells].sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c));
  const face = sorted[0];
  const tail = [...cells].sort((a, b) => (a.r !== b.r ? b.r - a.r : b.c - a.c))[0];
  return cells.map(({ r, c }) => ({
    x: p.position.x + c,
    y: p.position.y + r,
    conn: { top: has(r - 1, c), right: has(r, c + 1), bottom: has(r + 1, c), left: has(r, c - 1) },
    face: r === face.r && c === face.c,
    tail: cells.length > 1 && r === tail.r && c === tail.c,
  }));
}


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

function buildGrid(board: BoardType): RenderCell[][] {
  return board.map(row => row.map(c => (c ? { type: c, ghost: false } : null)));
}

function Board({ board, currentPiece, ghostPiece, clearing, popups, gameOver = false, lastLocked = null }: Props) {
  const grid = useMemo(() => buildGrid(board), [board]);
  const { faceMap, tailMap } = useMemo(() => computeFeatures(grid), [grid]);

  // 활성 조각 셀은 조각 번호(uid)를 키로 써서 새 조각이면 마운트 팝, 같은 조각이면 left/top 트랜지션으로 미끄러진다
  const activeCells = useMemo(() => (currentPiece ? pieceFloatCells(currentPiece) : []), [currentPiece]);
  const ghostCells = useMemo(() => (ghostPiece ? pieceFloatCells(ghostPiece) : []), [ghostPiece]);
  const landedSet = useMemo(() => new Set((lastLocked?.cells ?? []).map(c => `${c.x},${c.y}`)), [lastLocked]);
  const clearMap = useMemo(() => {
    const m = new Map<string, ClearKind>();
    for (const c of clearing) m.set(`${c.x},${c.y}`, c.kind);
    return m;
  }, [clearing]);

  const danger = useMemo(() => stackHeight(board) >= DANGER_ROWS, [board]);

  // 폭발 강도에 따른 보드 흔들림 (CSS 변수로 진폭 전달)
  const [shake, setShake] = useState<{ id: number; strength: number } | null>(null);
  const onShake = useCallback((strength: number) => setShake({ id: Date.now(), strength }), []);

  return (
    <div
      className={`${styles.wrapper} ${shake ? styles.shaking : ''}`}
      style={shake ? ({ '--shake': `${(0.15 + shake.strength * 0.35).toFixed(2)}rem` } as React.CSSProperties) : undefined}
      onAnimationEnd={() => setShake(null)}
    >
      <div className={styles.grid}>
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (!cell) return <div key={`${y}-${x}`} className={styles.cell} />;
            const effect = clearMap.get(`${x},${y}`);
            const expression = pickExpression({ gameOver, danger, isActive: false, effect });
            const landed = landedSet.has(`${x},${y}`);
            return (
              <div key={`${y}-${x}`} className={styles.cell}>
                <CatBlock
                  key={landed ? `l${lastLocked?.seq}` : 'c'}
                  landing={landed}
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
                  expression={expression}
                  blinkDelay={blinkDelayFor(x, y)}
                  cellX={x}
                  cellY={y}
                />
              </div>
            );
          }),
        )}
        <div className={styles.layer} aria-hidden="true">
          {ghostPiece && ghostCells.map((c, i) => (
            <div
              key={`g${ghostPiece.uid}-${i}`}
              className={`${styles.floatCell} ${styles.glide}`}
              style={{ left: `${(c.x / BOARD_WIDTH) * 100}%`, top: `${(c.y / BOARD_HEIGHT) * 100}%` }}
            >
              <CatBlock catType={ghostPiece.catType} ghost conn={c.conn} cellX={c.x} cellY={c.y} />
            </div>
          ))}
          {currentPiece && activeCells.map((c, i) => (
            <div
              key={`p${currentPiece.uid}-${i}`}
              className={`${styles.floatCell} ${styles.glide} ${styles.pop}`}
              style={{ left: `${(c.x / BOARD_WIDTH) * 100}%`, top: `${(c.y / BOARD_HEIGHT) * 100}%`, zIndex: 3 }}
            >
              <CatBlock
                catType={currentPiece.catType}
                conn={c.conn}
                showFace={c.face}
                showEars={c.face}
                showTail={c.tail}
                expression="idle"
                blinkDelay={blinkDelayFor(c.x, c.y)}
                cellX={c.x}
                cellY={c.y}
              />
            </div>
          ))}
        </div>
      </div>
      <ExplosionLayer board={board} clearing={clearing} landed={lastLocked} onShake={onShake} />
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
