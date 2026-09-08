/**
 * mulberry32: 결정적(seedable) 난수 생성기.
 * 리듀서가 순수 함수로 남도록 시드를 상태로 들고 다니며 매 호출마다 다음 시드를 반환한다.
 */
export function nextRandom(seed: number): { value: number; seed: number } {
  const t = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(t ^ (t >>> 15), 1 | t);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  const value = ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  return { value, seed: t };
}

export function randomSeed(): number {
  return (Math.random() * 2 ** 32) >>> 0;
}
