/**
 * 난이도 밸런스 시뮬레이션.
 * 두 종류의 봇(무작위 배치 / 높이·구멍 최소화 휴리스틱)으로 여러 판을 돌려
 * 난이도별 폭발 빈도, 줄 삭제, 게임 오버까지 버틴 조각 수를 측정한다.
 *
 * 실행: npx vite-node scripts/balance-sim.ts
 */
import { ALL_CAT_TYPES } from '@/entities/cat';
import { getGhostPosition, isValidPosition, type Board } from '@/entities/board';
import { DIFFICULTY_ORDER, DIFFICULTY_PRESETS } from '@/entities/difficulty';
import { rotatedPiece, type ActivePiece } from '@/entities/piece';
import { createInitialState, engineReducer } from '@/features/game-session';
import type { EngineState } from '@/features/game-session';
import { BOARD_HEIGHT, BOARD_WIDTH, CLEAR_ANIMATION_MS, SETTLE_MS } from '@/shared/config';

type Bot = 'random' | 'heuristic';

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
  let holes = 0;
  let aggregate = 0;
  let maxH = 0;
  const heights: number[] = [];
  for (let x = 0; x < BOARD_WIDTH; x++) {
    let y = 0;
    while (y < BOARD_HEIGHT && board[y][x] === null) y++;
    const h = BOARD_HEIGHT - y;
    heights.push(h);
    aggregate += h;
    maxH = Math.max(maxH, h);
    for (let yy = y + 1; yy < BOARD_HEIGHT; yy++) if (board[yy][x] === null) holes++;
  }
  let bump = 0;
  for (let x = 1; x < BOARD_WIDTH; x++) bump += Math.abs(heights[x] - heights[x - 1]);
  return -0.5 * aggregate - 3 * holes - 0.3 * bump - 1.5 * maxH;
}

function applyPlacement(s: EngineState, target: ActivePiece): EngineState {
  // 회전 후 목표 x로 이동, 하드 드롭 (킥 없이 단순 이동이므로 실패하면 그대로 드롭)
  let st = s;
  const cur = st.current!;
  const rot = (target.rotationIndex - cur.rotationIndex + 4) % 4;
  for (let i = 0; i < rot; i++) st = engineReducer(st, { type: 'rotate', direction: 1 });
  const dx = target.position.x - st.current!.position.x;
  for (let i = 0; i < Math.abs(dx); i++) st = engineReducer(st, { type: 'move', dx: dx > 0 ? 1 : -1 });
  return engineReducer(st, { type: 'hardDrop' });
}

function playGame(bot: Bot, seed: number, presetId: 'easy' | 'normal' | 'hard', maxPieces: number) {
  let s = engineReducer(createInitialState(), { type: 'start', preset: DIFFICULTY_PRESETS[presetId], breeds: ALL_CAT_TYPES, seed });
  let rnd = seed;
  const next = () => { rnd = (rnd * 1664525 + 1013904223) >>> 0; return rnd / 4294967296; };
  let pieces = 0;
  while (s.status === 'playing' && pieces < maxPieces) {
    const opts = placements(s.board, s.current!);
    let target: ActivePiece;
    if (bot === 'random') {
      target = opts[Math.floor(next() * opts.length)];
    } else {
      let best = -Infinity;
      target = opts[0];
      for (const o of opts) {
        const b = s.board.map(r => [...r]);
        for (let r = 0; r < o.shape.length; r++) for (let c = 0; c < o.shape[r].length; c++) {
          if (o.shape[r][c]) { const y = o.position.y + r, x = o.position.x + c; if (y >= 0) b[y][x] = o.catType; }
        }
        // 뭉치 형성을 약간 선호 (사람이 같은 색을 붙이려는 경향)
        let same = 0;
        for (let r = 0; r < o.shape.length; r++) for (let c = 0; c < o.shape[r].length; c++) {
          if (!o.shape[r][c]) continue;
          const y = o.position.y + r, x = o.position.x + c;
          for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const nx = x + dx, ny = y + dy;
            if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH && s.board[ny][nx] === o.catType) same++;
          }
        }
        const v = evaluateBoard(b) + same * 0.8 + next() * 0.2;
        if (v > best) { best = v; target = o; }
      }
    }
    s = settle(applyPlacement(s, target));
    pieces++;
  }
  return { pieces, score: s.score, lines: s.lines, explosions: s.stats.explosions, maxChain: s.stats.maxChain, level: s.level, over: s.status === 'gameover' };
}

const GAMES = 12;
const MAX_PIECES = 400;
for (const bot of ['random', 'heuristic'] as Bot[]) {
  console.log(`\n=== bot: ${bot} (${GAMES} games, max ${MAX_PIECES} pieces) ===`);
  console.log('diff   | pieces | lines/100 | explosions/100 | maxChain | score  | gameover%');
  for (const id of DIFFICULTY_ORDER) {
    const rs = Array.from({ length: GAMES }, (_, i) => playGame(bot, 1000 + i * 7919, id, MAX_PIECES));
    const avg = (f: (r: typeof rs[0]) => number) => rs.reduce((a, r) => a + f(r), 0) / rs.length;
    const pieces = avg(r => r.pieces);
    console.log(
      `${id.padEnd(6)} | ${pieces.toFixed(0).padStart(6)} | ${(avg(r => r.lines) / pieces * 100).toFixed(1).padStart(9)} | ${(avg(r => r.explosions) / pieces * 100).toFixed(1).padStart(14)} | ${avg(r => r.maxChain).toFixed(1).padStart(8)} | ${avg(r => r.score).toFixed(0).padStart(6)} | ${(avg(r => r.over ? 1 : 0) * 100).toFixed(0)}%`,
    );
  }
}
