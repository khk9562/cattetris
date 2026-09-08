import { useEffect, useRef } from 'react';
import type { Feedback, GameStatus } from '@/features/game-session/@x/sound';
import { SFX, SFX_THROTTLE_MS } from '../lib/sfx';
import { setMusicTempo, startMusic, stopMusic } from '../lib/music';
import { setMusicEnabled, setSfxEnabled, suspend, unlock } from '../lib/synth';

interface Options {
  sound: boolean;
  music: boolean;
  status: GameStatus;
  level: number;
}

/**
 * 엔진 이벤트를 효과음으로, 플레이 상태를 배경음으로 연결한다.
 * AudioContext는 첫 사용자 입력에서 해제(iOS 정책)하고 화면을 벗어나면 멈춘다.
 */
export function useSound(events: Feedback[], { sound, music, status, level }: Options) {
  const lastSeq = useRef(0);
  const lastPlayed = useRef<Partial<Record<string, number>>>({});

  // 첫 입력에서 오디오 잠금 해제
  useEffect(() => {
    if (!sound && !music) return;
    const handler = () => unlock();
    window.addEventListener('pointerdown', handler, { passive: true });
    window.addEventListener('keydown', handler);
    const onVisibility = () => { if (document.hidden) suspend(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sound, music]);

  useEffect(() => { setSfxEnabled(sound); }, [sound]);
  useEffect(() => { setMusicEnabled(music); }, [music]);

  // 효과음
  useEffect(() => {
    let last = lastSeq.current;
    const now = performance.now();
    for (const ev of events) {
      if (ev.seq <= last) continue;
      last = ev.seq;
      if (!sound) continue;
      const throttle = SFX_THROTTLE_MS[ev.kind];
      if (throttle) {
        const prev = lastPlayed.current[ev.kind] ?? 0;
        if (now - prev < throttle) continue;
        lastPlayed.current[ev.kind] = now;
      }
      SFX[ev.kind](ev.strength ?? 1);
    }
    lastSeq.current = last;
  }, [events, sound]);

  // 배경음: 플레이 중에만
  useEffect(() => {
    if (music && status === 'playing') {
      unlock();
      startMusic();
    } else {
      stopMusic();
    }
    return stopMusic;
  }, [music, status]);

  useEffect(() => { setMusicTempo(level); }, [level]);
}
