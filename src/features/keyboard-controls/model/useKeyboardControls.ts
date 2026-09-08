import { useEffect } from 'react';
import type { GameActions, GameStatus } from '@/features/game-session/@x/keyboard-controls';

/**
 * 가이드라인 기본 키 배치:
 * ← → 이동, ↓ 소프트 드롭, Space 하드 드롭, ↑/X 시계 회전, Z/Ctrl 반시계 회전,
 * C/Shift 홀드, P/Esc 일시정지, Enter 시작(대기 화면)
 */
export function useKeyboardControls(status: GameStatus, actions: GameActions) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (status === 'playing' || status === 'paused') {
          e.preventDefault();
          actions.togglePause();
        }
        return;
      }
      if (status === 'ready' && e.code === 'Enter') {
        e.preventDefault();
        actions.start();
        return;
      }
      if (status !== 'playing') return;

      switch (e.code) {
        case 'ArrowLeft': e.preventDefault(); actions.moveLeft(); break;
        case 'ArrowRight': e.preventDefault(); actions.moveRight(); break;
        case 'ArrowDown': e.preventDefault(); actions.softDrop(); break;
        case 'Space': if (!e.repeat) { e.preventDefault(); actions.hardDrop(); } break;
        case 'ArrowUp':
        case 'KeyX': if (!e.repeat) { e.preventDefault(); actions.rotateCW(); } break;
        case 'KeyZ':
        case 'ControlLeft':
        case 'ControlRight': if (!e.repeat) { e.preventDefault(); actions.rotateCCW(); } break;
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight': if (!e.repeat) { e.preventDefault(); actions.hold(); } break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [status, actions]);
}
