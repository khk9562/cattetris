export type TetrominoId = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export const TETROMINO_IDS: TetrominoId[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/**
 * 스폰 상태(SRS 0)의 모양. 값은 0(빈칸) 또는 셀 번호 1~4다.
 * 셀 번호는 회전해도 따라다니므로 "어느 칸이 어느 고양이인가"를 셀 번호로 추적한다
 * (ActivePiece.catTypes[번호 - 1]). 번호 4(와 3)가 보조 품종 자리다.
 */
const SPAWN_SHAPES: Record<TetrominoId, number[][]> = {
  I: [[0,0,0,0],[1,2,3,4],[0,0,0,0],[0,0,0,0]],
  O: [[1,2],[3,4]],
  T: [[0,1,0],[2,3,4],[0,0,0]],
  S: [[0,1,2],[3,4,0],[0,0,0]],
  Z: [[1,2,0],[0,3,4],[0,0,0]],
  J: [[1,0,0],[2,3,4],[0,0,0]],
  L: [[0,0,1],[2,3,4],[0,0,0]],
};

/** 정사각 행렬을 시계 방향으로 90도 돌린다. SRS의 0 -> R -> 2 -> L 순서와 같다 */
export function rotateMatrixCW(m: number[][]): number[][] {
  const n = m.length;
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => m[n - 1 - c][r]));
}

function rotations(spawn: number[][]): number[][][] {
  const out = [spawn];
  for (let i = 1; i < 4; i++) out.push(rotateMatrixCW(out[i - 1]));
  return out;
}

/** 회전 상태 순서는 SRS 표기(0, R, 2, L)와 같다. 값은 셀 번호(1~4) 또는 0 */
export const TETROMINO_SHAPES: Record<TetrominoId, number[][][]> = Object.fromEntries(
  TETROMINO_IDS.map(id => [id, rotations(SPAWN_SHAPES[id])]),
) as Record<TetrominoId, number[][][]>;

type Kick = [number, number];

/**
 * SRS 벽 킥 오프셋. 키는 `${from}${to}` (0,1,2,3 = 0,R,2,L).
 * 오프셋은 (dx, dy)이며 dy는 화면 좌표(아래가 +)로 이미 변환되어 있다.
 */
const JLSTZ_KICKS: Record<string, Kick[]> = {
  '01': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '10': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '12': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '21': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '23': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '32': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '30': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '03': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
};

const I_KICKS: Record<string, Kick[]> = {
  '01': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '10': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '12': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
  '21': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '23': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '32': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '30': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '03': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
};

export function getKicks(id: TetrominoId, from: number, to: number): Kick[] {
  if (id === 'O') return [[0, 0]];
  const table = id === 'I' ? I_KICKS : JLSTZ_KICKS;
  return table[`${from}${to}`] ?? [[0, 0]];
}
