import { type CatType } from '@/entities/cat/@x/piece';
import { BOARD_WIDTH } from '@/shared/config';
import { nextRandom } from '@/shared/lib';
import { TETROMINO_IDS, TETROMINO_SHAPES, getKicks, type TetrominoId } from './tetromino';

export interface ActivePiece {
  /** 판 안에서 조각을 구분하는 번호 (연출 키 용도, 엔진이 부여) */
  uid?: number;
  id: TetrominoId;
  shape: number[][];
  shapes: number[][][];
  rotationIndex: number;
  /** 대표 품종 (얼굴이 있는 큰 고양이). catTypes[0]과 같다 */
  catType: CatType;
  /** 셀 번호(shape 값 1~4)별 품종. 뒤쪽 번호가 업혀 있는 보조 품종 자리 */
  catTypes: CatType[];
  position: { x: number; y: number };
}

export interface Rng {
  seed: number;
}

/** 7-bag: 7종을 한 번씩 섞어 순서대로 낸다. 남은 가방이 비면 새로 섞는다. */
export function drawFromBag(bag: TetrominoId[], seed: number): { id: TetrominoId; bag: TetrominoId[]; seed: number } {
  let nextBag = bag;
  let s = seed;
  if (nextBag.length === 0) {
    const arr = [...TETROMINO_IDS];
    for (let i = arr.length - 1; i > 0; i--) {
      const r = nextRandom(s);
      s = r.seed;
      const j = Math.floor(r.value * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    nextBag = arr;
  }
  const [id, ...rest] = nextBag;
  return { id, bag: rest, seed: s };
}

/**
 * 품종 선택. pool 안에서 고르되 repeatChance 확률로 직전 품종을 다시 낸다.
 * (뭉치가 실제로 만들어질 확률을 난이도 변수로 조절하기 위함)
 */
export function drawBreed(
  pool: CatType[],
  previous: CatType | null,
  repeatChance: number,
  seed: number,
): { catType: CatType; seed: number } {
  let r = nextRandom(seed);
  if (previous && pool.includes(previous) && r.value < repeatChance) {
    return { catType: previous, seed: r.seed };
  }
  r = nextRandom(r.seed);
  return { catType: pool[Math.floor(r.value * pool.length)], seed: r.seed };
}

/**
 * 조각 한 개의 셀 4개 품종을 정한다.
 * 대표 품종은 drawBreed로 뽑고, 뒤쪽 mixCells칸(셀 번호 4, 3)은 대표와 다른 품종을 업힌다.
 * 섞인 조각이 있어야 "하나 모자란 뭉치"를 판에 남겨 둘 수 있고, 그것이 연쇄의 재료가 된다.
 */
export function drawBreeds(
  pool: CatType[],
  previous: CatType | null,
  repeatChance: number,
  mixCells: number,
  seed: number,
): { catTypes: CatType[]; seed: number } {
  const main = drawBreed(pool, previous, repeatChance, seed);
  const catTypes: CatType[] = [main.catType, main.catType, main.catType, main.catType];
  let s = main.seed;
  const others = pool.filter(t => t !== main.catType);
  if (mixCells > 0 && others.length > 0) {
    const r = nextRandom(s);
    s = r.seed;
    const sub = others[Math.floor(r.value * others.length)];
    for (let i = 0; i < Math.min(mixCells, 3); i++) catTypes[3 - i] = sub;
  }
  return { catTypes, seed: s };
}

export function spawnPosition(shape: number[][]): { x: number; y: number } {
  let top = 0;
  while (top < shape.length && shape[top].every(c => c === 0)) top++;
  return { x: Math.floor((BOARD_WIDTH - shape[0].length) / 2), y: top === 0 ? 0 : -top };
}

export function makePiece(id: TetrominoId, catType: CatType, catTypes?: CatType[]): ActivePiece {
  const shapes = TETROMINO_SHAPES[id];
  const types = catTypes && catTypes.length === 4 ? [...catTypes] : [catType, catType, catType, catType];
  return {
    id,
    shapes,
    shape: shapes[0],
    rotationIndex: 0,
    catType: types[0],
    catTypes: types,
    position: spawnPosition(shapes[0]),
  };
}

/** 홀드에서 꺼낼 때처럼 회전과 위치를 초기 상태로 돌려준다. */
export function resetPiece(piece: ActivePiece): ActivePiece {
  return { ...makePiece(piece.id, piece.catType, piece.catTypes), uid: piece.uid };
}

/** shape 값(셀 번호)에 해당하는 품종 */
export function cellBreed(piece: Pick<ActivePiece, 'catType' | 'catTypes'>, value: number): CatType {
  return piece.catTypes?.[value - 1] ?? piece.catType;
}

export interface PieceConn {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

/** 조각 셀 하나의 보드 좌표, 품종, 같은 품종끼리의 연결, 얼굴/꼬리 여부 */
export interface PieceCell {
  x: number;
  y: number;
  type: CatType;
  conn: PieceConn;
  face: boolean;
  tail: boolean;
}

/**
 * 조각을 같은 품종끼리 이어진 덩어리로 나눠, 덩어리마다 얼굴(위-왼쪽)과 꼬리(아래-오른쪽)를 정한다.
 * 보드의 그룹 규칙과 같아서 착지한 뒤에도 같은 자리에 얼굴이 남는다.
 */
export function pieceCellInfo(piece: ActivePiece): PieceCell[] {
  const cells: { r: number; c: number; type: CatType }[] = [];
  piece.shape.forEach((row, r) => row.forEach((v, c) => { if (v) cells.push({ r, c, type: cellBreed(piece, v) }); }));
  const typeAt = (r: number, c: number): CatType | null => {
    const v = piece.shape[r]?.[c];
    return v ? cellBreed(piece, v) : null;
  };
  const key = (r: number, c: number) => `${r},${c}`;
  const faceKeys = new Set<string>();
  const tailKeys = new Set<string>();
  const visited = new Set<string>();
  for (const start of cells) {
    if (visited.has(key(start.r, start.c))) continue;
    const group: { r: number; c: number }[] = [];
    const queue = [start];
    visited.add(key(start.r, start.c));
    while (queue.length) {
      const cur = queue.shift()!;
      group.push(cur);
      for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]] as const) {
        const nr = cur.r + dr;
        const nc = cur.c + dc;
        if (!visited.has(key(nr, nc)) && typeAt(nr, nc) === start.type) {
          visited.add(key(nr, nc));
          queue.push({ r: nr, c: nc, type: start.type });
        }
      }
    }
    const byFace = [...group].sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c))[0];
    faceKeys.add(key(byFace.r, byFace.c));
    if (group.length > 1) {
      const byTail = [...group].sort((a, b) => (a.r !== b.r ? b.r - a.r : b.c - a.c))[0];
      tailKeys.add(key(byTail.r, byTail.c));
    }
  }
  return cells.map(({ r, c, type }) => ({
    x: piece.position.x + c,
    y: piece.position.y + r,
    type,
    conn: {
      top: typeAt(r - 1, c) === type,
      right: typeAt(r, c + 1) === type,
      bottom: typeAt(r + 1, c) === type,
      left: typeAt(r, c - 1) === type,
    },
    face: faceKeys.has(key(r, c)),
    tail: tailKeys.has(key(r, c)),
  }));
}

export function rotatedPiece(piece: ActivePiece, direction: 1 | -1): ActivePiece {
  const newIndex = (piece.rotationIndex + direction + 4) % 4;
  return { ...piece, shape: piece.shapes[newIndex], rotationIndex: newIndex };
}

/**
 * SRS 회전. 킥 오프셋을 순서대로 시도해 첫 유효 위치를 돌려주고, 전부 실패하면 null.
 */
export function rotateWithKicks(
  piece: ActivePiece,
  direction: 1 | -1,
  isValid: (p: ActivePiece) => boolean,
): ActivePiece | null {
  const rotated = rotatedPiece(piece, direction);
  for (const [dx, dy] of getKicks(piece.id, piece.rotationIndex, rotated.rotationIndex)) {
    const candidate = { ...rotated, position: { x: rotated.position.x + dx, y: rotated.position.y + dy } };
    if (isValid(candidate)) return candidate;
  }
  return null;
}

export function movedPiece(piece: ActivePiece, dx: number, dy: number): ActivePiece {
  return { ...piece, position: { x: piece.position.x + dx, y: piece.position.y + dy } };
}
