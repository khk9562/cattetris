/**
 * 스테이지 30개 달성 가능성 점검.
 * 연쇄를 노리는 봇(한 수 앞 완전 해석 + "하나 모자란 뭉치" 선호)으로 스테이지마다 여러 판을 돌려
 * 클리어율, 쓴 조각 수, 최대 연쇄를 표로 낸다. 연쇄 목표 스테이지가 운에만 기대지 않는지 확인하는 용도.
 *
 * 실행: npm run sim:stages            (전체)
 *       npm run sim:stages -- 7 14    (특정 스테이지만)
 */
import { ALL_CAT_TYPES } from '@/entities/cat';
import { applyGravity, clearMatches, findClusters, getCompletedRows, getGhostPosition, isValidPosition, placePiece, type Board } from '@/entities/board';
import { DIFFICULTY_PRESETS } from '@/entities/difficulty';
import { rotatedPiece, type ActivePiece } from '@/entities/piece';
import { STAGES, stageProgress } from '@/entities/stage';
import { createInitialState, engineReducer, progressInput, type EngineState } from '@/features/game-session';
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

/** 엔진과 같은 규칙으로 줄/뭉치 제거와 중력을 끝까지 돌려 연쇄 수와 지운 셀 수를 돌려준다 (연출 없이) */
function resolve(board: Board, threshold: number): { board: Board; chain: number; cleared: number; explosions: number; lines: number } {
  let b = board;
  let chain = -1;
  let cleared = 0;
  let explosions = 0;
  let lines = 0;
  for (let step = 0; step < 12; step++) {
    const rows = getCompletedRows(b);
    const clusters = findClusters(b, threshold);
    if (rows.length === 0 && clusters.length === 0) break;
    chain++;
    explosions += clusters.length;
    lines += rows.length;
    const cells = [...clusters.flatMap(c => c.cells), ...rows.flatMap(y => Array.from({ length: BOARD_WIDTH }, (_, x) => ({ x, y })))];
    cleared += cells.length;
    b = applyGravity(clearMatches(b, cells)).newBoard;
  }
  return { board: b, chain: Math.max(0, chain), cleared, explosions, lines };
}

function shapeScore(board: Board): number {
  let holes = 0, aggregate = 0, maxH = 0;
  const heights: number[] = [];
  for (let x = 0; x < BOARD_WIDTH; x++) {
    let y = 0;
    while (y < BOARD_HEIGHT && board[y][x] === null) y++;
    const h = BOARD_HEIGHT - y;
    heights.push(h); aggregate += h; maxH = Math.max(maxH, h);
    for (let yy = y + 1; yy < BOARD_HEIGHT; yy++) if (board[yy][x] === null) holes++;
  }
  let bump = 0;
  for (let x = 1; x < BOARD_WIDTH; x++) bump += Math.abs(heights[x] - heights[x - 1]);
  return -0.4 * aggregate - 3 * holes - 0.3 * bump - 1.2 * maxH;
}

/** "하나/둘 모자란 뭉치"가 많을수록 연쇄 재료가 많다 */
function potential(board: Board, threshold: number): number {
  let p = 0;
  for (const c of findClusters(board, Math.max(2, threshold - 2))) {
    if (c.cells.length >= threshold) continue;
    p += c.cells.length === threshold - 1 ? 2 : 1;
  }
  return p;
}

interface Want { chain: number; explosions: number; lines: number; score: number }

function wantsOf(stage: (typeof STAGES)[number]): Want {
  const w: Want = { chain: 0, explosions: 0, lines: 0, score: 0 };
  for (const g of stage.goals) {
    if (g.type === 'chain') w.chain = g.steps;
    if (g.type === 'explosions' || g.type === 'breed') w.explosions += 1;
    if (g.type === 'lines') w.lines += 1;
    if (g.type === 'score') w.score += 1;
  }
  return w;
}

function valueOf(board: Board, o: ActivePiece, thr: number, want: Want, rnd: () => number): { v: number; board: Board } {
  const placed = placePiece(board, o);
  const r = resolve(placed, thr);
  let v = shapeScore(r.board) + rnd() * 0.3;
  if (want.chain > 0) {
    v += r.chain >= want.chain - 1 ? 40 * r.chain : r.chain * 6;
    v += potential(r.board, thr) * 2.5;
    if (r.explosions > 0 && r.chain < want.chain - 1) v -= 4;
  } else {
    v += r.cleared * 0.6 + r.chain * 8 + potential(r.board, thr) * 1.2;
    if (want.lines > 0) v += r.lines * 6;
  }
  return { v, board: r.board };
}

const PLY = Number(process.env.PLY ?? 1);

function choose(s: EngineState, want: Want, rnd: () => number): ActivePiece {
  const thr = s.preset.clusterThreshold;
  const opts = placements(s.board, s.current!);
  let best = -Infinity;
  let target = opts[0];
  const nextPiece = s.queue[0];
  for (const o of opts) {
    const first = valueOf(s.board, o, thr, want, rnd);
    let v = first.v;
    if (PLY >= 2 && nextPiece && want.chain > 0) {
      // 다음 조각까지 내다본다: 다음 수의 최선값을 절반 반영
      let bestNext = -Infinity;
      for (const n of placements(first.board, nextPiece)) bestNext = Math.max(bestNext, valueOf(first.board, n, thr, want, rnd).v);
      v += 0.5 * bestNext;
    }
    if (v > best) { best = v; target = o; }
  }
  return target;
}

function apply(s: EngineState, target: ActivePiece): EngineState {
  let st = s;
  const rot = (target.rotationIndex - st.current!.rotationIndex + 4) % 4;
  for (let i = 0; i < rot; i++) st = engineReducer(st, { type: 'rotate', direction: 1 });
  const dx = target.position.x - st.current!.position.x;
  for (let i = 0; i < Math.abs(dx); i++) st = engineReducer(st, { type: 'move', dx: dx > 0 ? 1 : -1 });
  return engineReducer(st, { type: 'hardDrop' });
}

function play(stageId: number, seed: number) {
  const stage = STAGES.find(st => st.id === stageId)!;
  const want = wantsOf(stage);
  const over: Record<string, number> = {};
  if (process.env.THR) over.clusterThreshold = Number(process.env.THR);
  if (process.env.MIX) over.mixCells = Number(process.env.MIX);
  let s = engineReducer(createInitialState(), { type: 'start', preset: DIFFICULTY_PRESETS.easy, breeds: ALL_CAT_TYPES, seed, stage, mode: 'stage', presetOverride: over });
  let rnd = seed;
  const next = () => { rnd = (rnd * 1664525 + 1013904223) >>> 0; return rnd / 4294967296; };
  let pieces = 0;
  while (s.status === 'playing' && pieces < 400) {
    s = settle(apply(s, choose(s, want, next)));
    pieces++;
    // 시간 제한 스테이지: 조각당 2.5초 쓴 것으로 친다
    if (stage.limit.type === 'seconds') s = { ...s, elapsedMs: pieces * 2500 };
  }
  const goals = stageProgress(stage, progressInput(s));
  return { cleared: s.status === 'cleared', pieces, maxChain: s.stats.maxChain, explosions: s.stats.explosions, lines: s.lines, score: s.score, goals: goals.map(g => `${g.label} ${g.current}/${g.target}`).join(', ') };
}

const only = process.argv.slice(2).map(Number).filter(n => !Number.isNaN(n));
const GAMES = Number(process.env.GAMES ?? 8);
console.log('stage | title        | thr | mix | limit      | clear% | pieces(avg) | maxChain(avg/max) | goals (first game)');
for (const stage of STAGES) {
  if (only.length && !only.includes(stage.id)) continue;
  const rs = Array.from({ length: GAMES }, (_, i) => play(stage.id, 100 + i * 7919));
  const avg = (f: (r: (typeof rs)[number]) => number) => rs.reduce((a, r) => a + f(r), 0) / rs.length;
  const thr = stage.preset.clusterThreshold ?? DIFFICULTY_PRESETS.easy.clusterThreshold;
  const mix = stage.preset.mixCells ?? DIFFICULTY_PRESETS.easy.mixCells;
  const limit = `${stage.limit.type === 'pieces' ? '조각' : '초'} ${stage.limit.count}`;
  console.log(
    `${String(stage.id).padStart(5)} | ${stage.title.padEnd(12)} | ${String(thr >= 99 ? '-' : thr).padStart(3)} | ${String(mix).padStart(3)} | ${limit.padEnd(10)} | ${(avg(r => (r.cleared ? 1 : 0)) * 100).toFixed(0).padStart(5)}% | ${avg(r => r.pieces).toFixed(0).padStart(11)} | ${avg(r => r.maxChain).toFixed(1).padStart(8)}/${Math.max(...rs.map(r => r.maxChain))}       | ${rs[0].goals}`,
  );
}
