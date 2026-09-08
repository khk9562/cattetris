import { useMemo, useRef } from 'react';
import type { GameActions } from '@/features/game-session/@x/touch-gestures';
import { BOARD_HEIGHT, BOARD_WIDTH } from '@/shared/config';

/** 탭으로 판정할 최대 이동 거리(px)와 시간(ms) */
const TAP_MAX_DIST = 12;
const TAP_MAX_MS = 260;
/** 하드 드롭으로 판정할 최소 아래 방향 속도(px/ms)와 거리(셀 단위) */
const FLICK_MIN_VELOCITY = 0.9;
const FLICK_MIN_CELLS = 1.5;

interface Drag {
  pointerId: number;
  startX: number;
  startY: number;
  startT: number;
  lastY: number;
  lastT: number;
  movedCols: number;
  movedRows: number;
  axis: 'none' | 'horizontal' | 'vertical';
  cellW: number;
  cellH: number;
}

/**
 * 보드 위 터치 제스처.
 * - 좌우로 끌면 셀 단위로 이동 (드래그 거리 = 이동 칸수)
 * - 아래로 천천히 끌면 셀 단위 소프트 드롭
 * - 아래로 빠르게 튕기면 하드 드롭
 * - 움직임 없이 짧게 탭하면 시계 방향 회전
 */
export function useBoardGestures(actions: GameActions, enabled: boolean) {
  const drag = useRef<Drag | null>(null);

  return useMemo(() => {
    if (!enabled) return {};

    const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
      if (!e.isPrimary) return;
      const rect = e.currentTarget.getBoundingClientRect();
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startT: e.timeStamp,
        lastY: e.clientY,
        lastT: e.timeStamp,
        movedCols: 0,
        movedRows: 0,
        axis: 'none',
        cellW: rect.width / BOARD_WIDTH,
        cellH: rect.height / BOARD_HEIGHT,
      };
    };

    const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.pointerId !== e.pointerId) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      if (d.axis === 'none') {
        if (Math.abs(dx) >= d.cellW * 0.6) d.axis = 'horizontal';
        else if (dy >= d.cellH * 0.8 && Math.abs(dy) > Math.abs(dx)) d.axis = 'vertical';
      }

      if (d.axis === 'horizontal') {
        const targetCols = Math.trunc(dx / d.cellW);
        while (d.movedCols < targetCols) { actions.moveRight(); d.movedCols++; }
        while (d.movedCols > targetCols) { actions.moveLeft(); d.movedCols--; }
      } else if (d.axis === 'vertical') {
        const targetRows = Math.trunc(dy / d.cellH);
        while (d.movedRows < targetRows) { actions.softDrop(); d.movedRows++; }
      }
      d.lastY = e.clientY;
      d.lastT = e.timeStamp;
    };

    const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.pointerId !== e.pointerId) return;
      drag.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);

      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const dt = e.timeStamp - d.startT;

      if (d.axis === 'none' && Math.hypot(dx, dy) <= TAP_MAX_DIST && dt <= TAP_MAX_MS) {
        actions.rotateCW();
        return;
      }
      if (d.axis === 'vertical') {
        // 마지막 구간 속도로 플릭 판정
        const recentDt = Math.max(1, e.timeStamp - d.lastT);
        const recentV = (e.clientY - d.lastY) / recentDt;
        const overallV = dy / Math.max(1, dt);
        if (dy >= d.cellH * FLICK_MIN_CELLS && Math.max(recentV, overallV) >= FLICK_MIN_VELOCITY) {
          actions.hardDrop();
        }
      }
    };

    const onPointerCancel = (e: React.PointerEvent<HTMLElement>) => {
      if (drag.current?.pointerId === e.pointerId) drag.current = null;
    };

    return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
  }, [actions, enabled]);
}
