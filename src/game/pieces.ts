import type { CatType } from './types';

interface PieceDefinition {
  shapes: number[][][];
  catType: CatType;
}

const PIECES: PieceDefinition[] = [
  // I - Ginger
  {
    catType: 'ginger',
    shapes: [
      [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
      [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
      [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
    ],
  },
  // O - Tuxedo
  {
    catType: 'tuxedo',
    shapes: [
      [[1,1],[1,1]],
      [[1,1],[1,1]],
      [[1,1],[1,1]],
      [[1,1],[1,1]],
    ],
  },
  // T - Russian Blue
  {
    catType: 'russianBlue',
    shapes: [
      [[0,1,0],[1,1,1],[0,0,0]],
      [[0,1,0],[0,1,1],[0,1,0]],
      [[0,0,0],[1,1,1],[0,1,0]],
      [[0,1,0],[1,1,0],[0,1,0]],
    ],
  },
  // S - Calico
  {
    catType: 'calico',
    shapes: [
      [[0,1,1],[1,1,0],[0,0,0]],
      [[0,1,0],[0,1,1],[0,0,1]],
      [[0,0,0],[0,1,1],[1,1,0]],
      [[1,0,0],[1,1,0],[0,1,0]],
    ],
  },
  // Z - Siamese
  {
    catType: 'siamese',
    shapes: [
      [[1,1,0],[0,1,1],[0,0,0]],
      [[0,0,1],[0,1,1],[0,1,0]],
      [[0,0,0],[1,1,0],[0,1,1]],
      [[0,1,0],[1,1,0],[1,0,0]],
    ],
  },
  // J - Black Cat
  {
    catType: 'black',
    shapes: [
      [[1,0,0],[1,1,1],[0,0,0]],
      [[0,1,1],[0,1,0],[0,1,0]],
      [[0,0,0],[1,1,1],[0,0,1]],
      [[0,1,0],[0,1,0],[1,1,0]],
    ],
  },
  // L - Tabby
  {
    catType: 'tabby',
    shapes: [
      [[0,0,1],[1,1,1],[0,0,0]],
      [[0,1,0],[0,1,0],[0,1,1]],
      [[0,0,0],[1,1,1],[1,0,0]],
      [[1,1,0],[0,1,0],[0,1,0]],
    ],
  },
];

const ALL_CAT_TYPES: CatType[] = [
  'ginger', 'tuxedo', 'russianBlue', 'calico', 
  'siamese', 'black', 'tabby', 'darkTabby'
];

export function getRandomPiece() {
  const def = PIECES[Math.floor(Math.random() * PIECES.length)];
  const randomCat = ALL_CAT_TYPES[Math.floor(Math.random() * ALL_CAT_TYPES.length)];
  return {
    shapes: def.shapes,
    catType: randomCat,
  };
}

export function createPiece() {
  const def = getRandomPiece();
  const shape = def.shapes[0];
  return {
    shape,
    catType: def.catType,
    position: { x: Math.floor((10 - shape[0].length) / 2), y: 0 },
    rotationIndex: 0,
    shapes: def.shapes,
  };
}

export type ActivePiece = ReturnType<typeof createPiece>;

export function rotatePiece(piece: ActivePiece, direction: 1 | -1 = 1): ActivePiece {
  const newIndex = (piece.rotationIndex + direction + 4) % 4;
  return {
    ...piece,
    shape: piece.shapes[newIndex],
    rotationIndex: newIndex,
  };
}
