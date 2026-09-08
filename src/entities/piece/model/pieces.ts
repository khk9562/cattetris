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
  catType: CatType;
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

export function spawnPosition(shape: number[][]): { x: number; y: number } {
  let top = 0;
  while (top < shape.length && shape[top].every(c => c === 0)) top++;
  return { x: Math.floor((BOARD_WIDTH - shape[0].length) / 2), y: top === 0 ? 0 : -top };
}

export function makePiece(id: TetrominoId, catType: CatType): ActivePiece {
  const shapes = TETROMINO_SHAPES[id];
  return {
    id,
    shapes,
    shape: shapes[0],
    rotationIndex: 0,
    catType,
    position: spawnPosition(shapes[0]),
  };
}

/** 홀드에서 꺼낼 때처럼 회전과 위치를 초기 상태로 되돌린다. */
export function resetPiece(piece: ActivePiece): ActivePiece {
  return { ...makePiece(piece.id, piece.catType), uid: piece.uid };
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
