import { memo, useEffect, useRef } from 'react';
import type { Board } from '@/entities/board';
import { CAT_FUR_COLORS, type CatType } from '@/entities/cat';
import type { ClearCell } from '@/features/game-session';
import { BOARD_HEIGHT, BOARD_WIDTH } from '@/shared/config';
import styles from './ExplosionLayer.module.css';

type ParticleKind = 'fur' | 'spark' | 'paw' | 'star' | 'ring' | 'flash';

interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
  color2?: string;
  life: number;
  maxLife: number;
  gravity: number;
  drag: number;
}

interface Props {
  board: Board;
  clearing: ClearCell[];
  /** 큰 폭발일 때 보드 흔들림을 부모에게 알린다 */
  onShake?: (strength: number) => void;
}

const GRAVITY = 0.0016; // px/ms^2 (셀 크기로 다시 스케일)

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function spawnForCell(
  out: Particle[],
  cell: ClearCell,
  cat: CatType | null,
  cellW: number,
  cellH: number,
) {
  const cx = (cell.x + 0.5) * cellW;
  const cy = (cell.y + 0.5) * cellH;
  const [base, pattern] = cat ? CAT_FUR_COLORS[cat] : ['#ffffff', '#ffd54f'];
  const scale = cellW / 30;

  if (cell.kind === 'cluster') {
    // 털 조각: 사방으로 튀어 오르며 회전
    for (let i = 0; i < 14; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(0.25, 0.75) * scale;
      out.push({
        kind: 'fur', x: cx + rand(-cellW * 0.3, cellW * 0.3), y: cy + rand(-cellH * 0.3, cellH * 0.3),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.35 * scale,
        size: rand(3, 7) * scale, rotation: rand(0, Math.PI * 2), spin: rand(-0.02, 0.02),
        color: Math.random() < 0.6 ? base : pattern, life: 0, maxLife: rand(600, 1000),
        gravity: GRAVITY * scale, drag: 0.0015,
      });
    }
    // 불꽃
    for (let i = 0; i < 10; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(0.5, 1.2) * scale;
      out.push({
        kind: 'spark', x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        size: rand(1.5, 3) * scale, rotation: 0, spin: 0,
        color: Math.random() < 0.5 ? '#ffd54f' : '#fff3c4', life: 0, maxLife: rand(250, 450),
        gravity: GRAVITY * 0.3 * scale, drag: 0.004,
      });
    }
    // 발자국 몇 개
    for (let i = 0; i < 2; i++) {
      const a = rand(-Math.PI, 0);
      const sp = rand(0.2, 0.45) * scale;
      out.push({
        kind: 'paw', x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        size: rand(5, 8) * scale, rotation: rand(-0.5, 0.5), spin: rand(-0.01, 0.01),
        color: 'rgba(255,255,255,0.95)', life: 0, maxLife: rand(700, 1000),
        gravity: GRAVITY * 0.6 * scale, drag: 0.002,
      });
    }
  } else if (cell.kind === 'splash') {
    for (let i = 0; i < 6; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(0.15, 0.45) * scale;
      out.push({
        kind: 'fur', x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.2 * scale,
        size: rand(2.5, 5) * scale, rotation: rand(0, Math.PI * 2), spin: rand(-0.02, 0.02),
        color: Math.random() < 0.6 ? base : pattern, life: 0, maxLife: rand(500, 800),
        gravity: GRAVITY * scale, drag: 0.0015,
      });
    }
    for (let i = 0; i < 3; i++) {
      out.push({
        kind: 'star', x: cx + rand(-cellW * 0.4, cellW * 0.4), y: cy + rand(-cellH * 0.4, cellH * 0.4),
        vx: rand(-0.05, 0.05), vy: rand(-0.12, -0.04) * scale,
        size: rand(3, 5) * scale, rotation: rand(0, Math.PI), spin: rand(-0.01, 0.01),
        color: '#ffe082', life: 0, maxLife: rand(350, 600), gravity: 0, drag: 0,
      });
    }
  } else {
    // 줄 삭제: 위로 흩어지는 잔털과 작은 불꽃
    for (let i = 0; i < 4; i++) {
      out.push({
        kind: 'fur', x: cx + rand(-cellW * 0.4, cellW * 0.4), y: cy,
        vx: rand(-0.12, 0.12) * scale, vy: rand(-0.45, -0.15) * scale,
        size: rand(2, 4) * scale, rotation: rand(0, Math.PI * 2), spin: rand(-0.02, 0.02),
        color: Math.random() < 0.6 ? base : pattern, life: 0, maxLife: rand(450, 750),
        gravity: GRAVITY * scale, drag: 0.001,
      });
    }
    out.push({
      kind: 'spark', x: cx + rand(-cellW * 0.4, cellW * 0.4), y: cy, vx: rand(-0.2, 0.2) * scale, vy: rand(-0.3, -0.1) * scale,
      size: rand(1.5, 2.5) * scale, rotation: 0, spin: 0, color: '#ffffff', life: 0, maxLife: rand(200, 350),
      gravity: 0, drag: 0.003,
    });
  }
}

function drawPaw(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath();
  ctx.ellipse(0, size * 0.25, size * 0.55, size * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [dx, dy] of [[-0.6, -0.45], [-0.2, -0.75], [0.2, -0.75], [0.6, -0.45]]) {
    ctx.beginPath();
    ctx.arc(dx * size, dy * size, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStar(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? size : size * 0.35;
    const a = (i / 8) * Math.PI * 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

function ExplosionLayer({ board, clearing, onShake }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);
  const lastClearing = useRef<ClearCell[]>([]);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  // 캔버스를 보드 픽셀 크기에 맞춤 (DPR 반영)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // 제거 셀 묶음이 새로 들어오면 파티클 생성
  useEffect(() => {
    if (clearing.length === 0 || clearing === lastClearing.current || reduceMotion.current) return;
    lastClearing.current = clearing;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cellW = rect.width / BOARD_WIDTH;
    const cellH = rect.height / BOARD_HEIGHT;
    const out = particles.current;

    const clusterCells = clearing.filter(c => c.kind === 'cluster');
    for (const cell of clearing) {
      const cat = cell.y >= 0 && cell.y < BOARD_HEIGHT ? board[cell.y][cell.x] : null;
      spawnForCell(out, cell, cat, cellW, cellH);
    }
    if (clusterCells.length > 0) {
      // 뭉치 중심에 충격파 링과 섬광
      const cx = (clusterCells.reduce((a, c) => a + c.x, 0) / clusterCells.length + 0.5) * cellW;
      const cy = (clusterCells.reduce((a, c) => a + c.y, 0) / clusterCells.length + 0.5) * cellH;
      const radius = Math.sqrt(clusterCells.length) * cellW * 1.6;
      out.push({ kind: 'ring', x: cx, y: cy, vx: 0, vy: 0, size: radius, rotation: 0, spin: 0, color: '#ff8a3d', life: 0, maxLife: 520, gravity: 0, drag: 0 });
      out.push({ kind: 'ring', x: cx, y: cy, vx: 0, vy: 0, size: radius * 0.7, rotation: 0, spin: 0, color: '#ffd54f', life: -90, maxLife: 420, gravity: 0, drag: 0 });
      out.push({ kind: 'flash', x: cx, y: cy, vx: 0, vy: 0, size: radius * 0.9, rotation: 0, spin: 0, color: '#fff8e1', life: 0, maxLife: 260, gravity: 0, drag: 0 });
      onShake?.(Math.min(1, clusterCells.length / 12));
    }

    if (!raf.current) {
      let last = performance.now();
      const loop = (now: number) => {
        const dt = Math.min(48, now - last);
        last = now;
        const ctx = canvas.getContext('2d');
        const list = particles.current;
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        for (let i = list.length - 1; i >= 0; i--) {
          const p = list[i];
          p.life += dt;
          if (p.life >= p.maxLife) { list.splice(i, 1); continue; }
          if (p.life < 0) continue;
          p.vy += p.gravity * dt;
          const dragF = 1 - p.drag * dt;
          p.vx *= dragF;
          p.vy *= dragF;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rotation += p.spin * dt;
          const t = p.life / p.maxLife;
          const alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = alpha;
          switch (p.kind) {
            case 'fur': {
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            case 'spark': {
              ctx.globalCompositeOperation = 'lighter';
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(0, 0, p.size * (1 - t * 0.5), 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            case 'paw': {
              ctx.fillStyle = p.color;
              drawPaw(ctx, p.size * 0.5);
              break;
            }
            case 'star': {
              ctx.globalCompositeOperation = 'lighter';
              ctx.fillStyle = p.color;
              drawStar(ctx, p.size * (0.6 + 0.4 * Math.sin(t * Math.PI)));
              break;
            }
            case 'ring': {
              const r = p.size * (0.15 + 0.85 * Math.pow(t, 0.55));
              ctx.globalAlpha = alpha * (1 - t) * 0.9;
              ctx.strokeStyle = p.color;
              ctx.lineWidth = Math.max(1.5, p.size * 0.08 * (1 - t));
              ctx.beginPath();
              ctx.arc(0, 0, r, 0, Math.PI * 2);
              ctx.stroke();
              break;
            }
            case 'flash': {
              ctx.globalCompositeOperation = 'lighter';
              const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
              g.addColorStop(0, `rgba(255,248,225,${0.9 * (1 - t)})`);
              g.addColorStop(0.5, `rgba(255,171,64,${0.45 * (1 - t)})`);
              g.addColorStop(1, 'rgba(255,138,61,0)');
              ctx.fillStyle = g;
              ctx.beginPath();
              ctx.arc(0, 0, p.size, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
          }
          ctx.restore();
        }

        if (list.length > 0) {
          raf.current = requestAnimationFrame(loop);
        } else {
          raf.current = 0;
          ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        }
      };
      raf.current = requestAnimationFrame(loop);
    }
  }, [clearing, board, onShake]);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}

export default memo(ExplosionLayer);
