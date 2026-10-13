import { noise, tone } from './synth';

/** 반음 계단 */
const semitone = (base: number, n: number) => base * Math.pow(2, n / 12);

/**
 * 화면 장식용 효과음 (엔진 이벤트와 무관). 효과음 설정이 꺼져 있으면 sfx 버스가 0이라 자동으로 조용하다.
 * boing: 시작 화면 퍼레이드 고양이를 누르면 통처럼 튀어오르는 소리. index로 음정을 바꿔 나란히 누르면 멜로디가 된다
 */
export const UI_SFX = {
  boing: (index = 0) => {
    const base = semitone(392, Math.min(12, index * 2));
    // 눌리는 '툭' + 튀어오르는 상승 슬라이드 + 꼭대기의 짧은 반짝
    noise(0.03, { filterFrom: 900, filterTo: 300, gain: 0.12 });
    tone(base * 0.6, 0.16, { type: 'sine', gain: 0.22, slideTo: base * 1.6, decay: 0.16 });
    tone(base * 2, 0.07, { type: 'triangle', gain: 0.12, at: 0.1 });
  },
};

export type UiSfxName = keyof typeof UI_SFX;

export function playUiSfx(name: UiSfxName, strength = 0): void {
  UI_SFX[name](strength);
}
