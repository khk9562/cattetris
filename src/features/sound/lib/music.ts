/**
 * 시드 없는 짧은 칩튠 루프. 두 성부(삼각파 베이스, 부드러운 사각파 멜로디)를
 * lookahead 스케줄러로 재생한다. 레벨이 오르면 템포가 조금 빨라진다.
 */
import { getContext, musicDestination } from './synth';

const MELODY = [
  // 펜타토닉(C D E G A) 위주의 16스텝 두 마디, 0은 쉼표
  523, 659, 784, 659, 880, 784, 659, 523, 587, 659, 784, 880, 1047, 880, 784, 659,
  523, 659, 784, 880, 784, 659, 587, 523, 440, 523, 587, 659, 784, 659, 587, 523,
];
const BASS = [131, 0, 131, 0, 175, 0, 175, 0, 196, 0, 196, 0, 165, 0, 165, 0];

let timer: ReturnType<typeof setInterval> | null = null;
let nextTime = 0;
let step = 0;
let bpm = 112;

function scheduleNote(freq: number, at: number, dur: number, type: OscillatorType, gain: number) {
  const c = getContext();
  const dest = musicDestination();
  if (!c || !dest || freq <= 0) return;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(env).connect(dest);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

export function startMusic(): void {
  const c = getContext();
  if (!c || timer) return;
  nextTime = c.currentTime + 0.05;
  step = 0;
  timer = setInterval(() => {
    const ctx = getContext();
    if (!ctx || ctx.state !== 'running') return;
    const stepDur = 60 / bpm / 4;
    while (nextTime < ctx.currentTime + 0.2) {
      const m = MELODY[step % MELODY.length];
      const b = BASS[step % BASS.length];
      if (m) scheduleNote(m, nextTime, stepDur * 0.9, 'square', 0.08);
      if (b) scheduleNote(b, nextTime, stepDur * 1.6, 'triangle', 0.18);
      nextTime += stepDur;
      step++;
    }
  }, 50);
}

export function stopMusic(): void {
  if (timer) clearInterval(timer);
  timer = null;
}

export function setMusicTempo(level: number): void {
  bpm = Math.min(150, 108 + level * 3);
}

export function isMusicPlaying(): boolean {
  return timer !== null;
}
