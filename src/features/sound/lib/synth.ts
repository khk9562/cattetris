/**
 * Web Audio 기반 합성 효과음. 에셋 파일 없이 오실레이터/노이즈로 만든다.
 * 모든 재생 함수는 AudioContext가 없거나 suspended면 조용히 무시한다.
 */
type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;

export function getContext(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.7;
  sfxBus.connect(master);
  musicBus = ctx.createGain();
  musicBus.gain.value = 0.35;
  musicBus.connect(master);
  return ctx;
}

/** iOS/모바일: 사용자 입력 안에서 호출해야 소리가 난다 */
export function unlock(): void {
  const c = getContext();
  if (c && c.state === 'suspended') void c.resume();
}

export function suspend(): void {
  if (ctx && ctx.state === 'running') void ctx.suspend();
}

export function setSfxEnabled(on: boolean): void {
  if (sfxBus) sfxBus.gain.value = on ? 0.7 : 0;
}

export function setMusicEnabled(on: boolean): void {
  if (musicBus) musicBus.gain.value = on ? 0.35 : 0;
}

export function musicDestination(): AudioNode | null {
  getContext();
  return musicBus;
}

function ready(): AudioContext | null {
  const c = getContext();
  return c && c.state === 'running' && sfxBus ? c : null;
}

export interface ToneOptions {
  type?: OscillatorType;
  /** 시작 주파수에서 이 주파수로 미끄러짐 */
  slideTo?: number;
  attack?: number;
  decay?: number;
  gain?: number;
  /** 시작 지연(초) */
  at?: number;
}

export function tone(freq: number, duration: number, opts: ToneOptions = {}): void {
  const c = ready();
  if (!c || !sfxBus) return;
  const { type = 'square', slideTo, attack = 0.005, decay = duration, gain = 0.25, at = 0 } = opts;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + duration);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  osc.connect(env).connect(sfxBus);
  osc.start(t0);
  osc.stop(t0 + attack + decay + 0.02);
}

let noiseBuffer: AudioBuffer | null = null;

function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === c.sampleRate) return noiseBuffer;
  const length = c.sampleRate * 1.5;
  const buf = c.createBuffer(1, length, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}

export interface NoiseOptions {
  filterFrom?: number;
  filterTo?: number;
  gain?: number;
  at?: number;
}

export function noise(duration: number, opts: NoiseOptions = {}): void {
  const c = ready();
  if (!c || !sfxBus) return;
  const { filterFrom = 4000, filterTo = 200, gain = 0.4, at = 0 } = opts;
  const t0 = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = getNoiseBuffer(c);
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterFrom, t0);
  filter.frequency.exponentialRampToValueAtTime(Math.max(40, filterTo), t0 + duration);
  const env = c.createGain();
  env.gain.setValueAtTime(gain, t0);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter).connect(env).connect(sfxBus);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}
