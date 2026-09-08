/** 폭발 기준/품종 수/반복 확률 조합 스윕 (휴리스틱 봇, normal 기반) */
import { ALL_CAT_TYPES } from '@/entities/cat';
import { getGhostPosition, isValidPosition, type Board } from '@/entities/board';
import { DIFFICULTY_PRESETS, type DifficultyPreset } from '@/entities/difficulty';
import { rotatedPiece, type ActivePiece } from '@/entities/piece';
import { createInitialState, engineReducer, type EngineState } from '@/features/game-session';
import { BOARD_HEIGHT, BOARD_WIDTH, CLEAR_ANIMATION_MS, SETTLE_MS } from '@/shared/config';

function settle(s: EngineState): EngineState {
  let st = s;
  for (let i = 0; i < 40 && st.status === 'playing' && st.phase !== 'active'; i++) {
    const ms = st.phase === 'clearing' ? CLEAR_ANIMATION_MS + 16 : SETTLE_MS + 16;
    for (let t = 0; t < ms; t += 16) st = engineReducer(st, { type: 'tick', dt: 16 });
  }
  return st;
}
function placements(board: Board, piece: ActivePiece): ActivePiece[] {
  const out: ActivePiece[] = [];
  let p = piece;
  for (let r = 0; r < 4; r++) {
    for (let x = -3; x < BOARD_WIDTH; x++) {
      const cand = { ...p, position: { x, y: p.position.y } };
      if (isValidPosition(board, cand)) out.push(getGhostPosition(board, cand));
    }
    p = rotatedPiece(p, 1);
  }
  return out;
}
function evaluateBoard(board: Board): number {
  let holes = 0, aggregate = 0, maxH = 0; const heights: number[] = [];
  for (let x = 0; x < BOARD_WIDTH; x++) {
    let y = 0; while (y < BOARD_HEIGHT && board[y][x] === null) y++;
    const h = BOARD_HEIGHT - y; heights.push(h); aggregate += h; maxH = Math.max(maxH, h);
    for (let yy = y + 1; yy < BOARD_HEIGHT; yy++) if (board[yy][x] === null) holes++;
  }
  let bump = 0; for (let x = 1; x < BOARD_WIDTH; x++) bump += Math.abs(heights[x] - heights[x - 1]);
  return -0.5 * aggregate - 3 * holes - 0.3 * bump - 1.5 * maxH;
}
function applyPlacement(s: EngineState, target: ActivePiece): EngineState {
  let st = s; const cur = st.current!;
  const rot = (target.rotationIndex - cur.rotationIndex + 4) % 4;
  for (let i = 0; i < rot; i++) st = engineReducer(st, { type: 'rotate', direction: 1 });
  const dx = target.position.x - st.current!.position.x;
  for (let i = 0; i < Math.abs(dx); i++) st = engineReducer(st, { type: 'move', dx: dx > 0 ? 1 : -1 });
  return engineReducer(st, { type: 'hardDrop' });
}
function playGame(preset: DifficultyPreset, seed: number, maxPieces: number, samePref: number) {
  let s = engineReducer(createInitialState(), { type: 'start', preset, breeds: ALL_CAT_TYPES, seed });
  let rnd = seed; const next = () => { rnd = (rnd * 1664525 + 1013904223) >>> 0; return rnd / 4294967296; };
  let pieces = 0;
  while (s.status === 'playing' && pieces < maxPieces) {
    const opts = placements(s.board, s.current!);
    let best = -Infinity; let target = opts[0];
    for (const o of opts) {
      const b = s.board.map(r => [...r]);
      let same = 0;
      for (let r = 0; r < o.shape.length; r++) for (let c = 0; c < o.shape[r].length; c++) {
        if (!o.shape[r][c]) continue;
        const y = o.position.y + r, x = o.position.x + c; if (y >= 0) b[y][x] = o.catType;
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
          const nx = x + dx, ny = y + dy;
          if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH && s.board[ny][nx] === o.catType) same++;
        }
      }
      const v = evaluateBoard(b) + same * samePref + next() * 0.2;
      if (v > best) { best = v; target = o; }
    }
    s = settle(applyPlacement(s, target)); pieces++;
  }
  return { pieces, lines: s.lines, explosions: s.stats.explosions, maxChain: s.stats.maxChain, over: s.status === 'gameover' };
}

const GAMES = 6, MAX = 300;
const base = DIFFICULTY_PRESETS.normal;
console.log('thr | breeds | repeat | samePref | lines/100 | expl/100 | maxChain | over%');
for (const samePref of [0, 0.8]) {
  for (const thr of [7, 8, 9, 10, 12]) {
    for (const breeds of [4, 5, 6]) {
      for (const repeat of [0, 0.15, 0.3]) {
        const preset: DifficultyPreset = { ...base, clusterThreshold: thr, breedsStart: breeds, breedsMax: breeds, breedRepeatChance: repeat };
        const rs = Array.from({ length: GAMES }, (_, i) => playGame(preset, 500 + i * 7919, MAX, samePref));
        const avg = (f: (r: typeof rs[0]) => number) => rs.reduce((a, r) => a + f(r), 0) / rs.length;
        const pieces = avg(r => r.pieces);
        console.log(`${String(thr).padStart(3)} | ${String(breeds).padStart(6)} | ${repeat.toFixed(2).padStart(6)} | ${samePref.toFixed(1).padStart(8)} | ${(avg(r => r.lines) / pieces * 100).toFixed(1).padStart(9)} | ${(avg(r => r.explosions) / pieces * 100).toFixed(1).padStart(8)} | ${avg(r => r.maxChain).toFixed(1).padStart(8)} | ${(avg(r => r.over ? 1 : 0) * 100).toFixed(0)}%`);
      }
    }
  }
}
