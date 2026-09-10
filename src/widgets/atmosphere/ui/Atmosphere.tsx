import { memo, useMemo, type CSSProperties } from 'react';
import { THEMES, type AtmosphereKind, type ThemeId } from '@/shared/config';
import styles from './Atmosphere.module.css';

interface Props {
  theme: ThemeId;
}

interface Particle {
  kind: AtmosphereKind;
  /** 세로 이동을 맡는 바깥 겹 */
  track: CSSProperties;
  /** 좌우 흔들림·회전·반짝임을 맡는 안쪽 겹 */
  shape: CSSProperties;
}

/** 배치가 새로고침마다 흔들리지 않도록 시드 하나로 고정한다 */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

const rem = (px: number) => `${(px / 16).toFixed(3)}rem`;
const between = (t: number, lo: number, hi: number) => lo + t * (hi - lo);

/** 입자 하나가 화면을 한 번 가로지르는 데 걸리는 시간과 크기·투명도. 멀수록 작고 흐리고 느리다 */
interface Depth {
  size: number;
  opacity: number;
  speed: number;
}

function depthOf(t: number, minSize: number, maxSize: number): Depth {
  return {
    size: between(t, minSize, maxSize),
    opacity: between(t, 0.32, 0.95),
    // 가까운 입자가 더 빨리 지나간다 (원경일수록 배율이 커진다)
    speed: between(t, 1.45, 0.75),
  };
}

function build(kind: AtmosphereKind, count: number): Particle[] {
  const out: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const a = rand(i + 1);
    const b = rand(i + 11);
    const c = rand(i + 29);
    const d = rand(i + 53);
    // 시작 시점은 가로 위치와 다른 난수로 뽑는다. 같은 값을 쓰면 입자가 사선으로 줄지어 선다
    const e = rand(i + 71);

    if (kind === 'ray' || kind === 'beam') {
      const wide = kind === 'beam';
      const span = 100 / count;
      out.push({
        kind,
        track: wide
          ? { right: `${2 + i * span}%`, width: rem(between(b, 26, 54)) }
          : { left: `${-8 + i * span}%`, width: rem(between(b, 20, 42)) },
        shape: {
          animationDuration: `${between(c, 7, 13).toFixed(1)}s`,
          animationDelay: `-${(a * 9).toFixed(1)}s`,
          ['--rot' as string]: wide ? `${-12 - Math.round(b * 10)}deg` : `${14 + Math.round(b * 10)}deg`,
        } as CSSProperties,
      });
      continue;
    }

    if (kind === 'star' || kind === 'mote') {
      const isStar = kind === 'star';
      const { size, opacity, speed } = depthOf(c, isStar ? 1.6 : 2.2, isStar ? 4 : 5.5);
      // 하늘 전체에 고르게. 별은 지수를 1보다 크게 줘 위쪽이 조금 더 촘촘하다
      const top = isStar ? Math.round(b ** 1.2 * 92) : Math.round(between(b, 4, 94));
      out.push({
        kind,
        track: {
          left: `${(a * 97).toFixed(1)}%`,
          top: `${top}%`,
          animationDuration: `${(between(d, 14, 30) * speed).toFixed(1)}s`,
          animationDelay: `-${(e * 20).toFixed(1)}s`,
          ['--dx' as string]: rem(between(b, -26, 26)),
          ['--dy' as string]: rem(between(c, -22, 22)),
        } as CSSProperties,
        shape: {
          width: rem(size),
          height: rem(size),
          opacity,
          animationDuration: `${between(d, 2.4, 6).toFixed(1)}s`,
          animationDelay: `-${(c * 6).toFixed(1)}s`,
        },
      });
      continue;
    }

    // 흩날려 내려오거나 떠오르는 것들
    const spec = {
      petal: { min: 7, max: 15, fall: [11, 21] as const, sway: [22, 62] as const, spin: [420, 900] as const, ratio: 0.78 },
      snow: { min: 4, max: 10, fall: [15, 27] as const, sway: [10, 34] as const, spin: [180, 360] as const, ratio: 1 },
      leaf: { min: 8, max: 17, fall: [12, 22] as const, sway: [26, 70] as const, spin: [360, 820] as const, ratio: 0.72 },
      bubble: { min: 7, max: 20, fall: [13, 23] as const, sway: [14, 40] as const, spin: [120, 300] as const, ratio: 1 },
    }[kind];

    const { size, opacity, speed } = depthOf(c, spec.min, spec.max);
    const travel = between(d, spec.fall[0], spec.fall[1]) * speed;

    out.push({
      kind,
      track: {
        left: `${(a * 98).toFixed(1)}%`,
        animationDuration: `${travel.toFixed(1)}s`,
        // 음수 지연: 처음부터 화면 곳곳에 이미 떠 있는 상태로 시작한다
        animationDelay: `-${(e * travel).toFixed(1)}s`,
      },
      shape: {
        width: rem(size),
        height: rem(size * spec.ratio),
        opacity,
        animationDuration: `${between(b, 3.2, 7.5).toFixed(1)}s, ${between(d, 6, 15).toFixed(1)}s`,
        animationDelay: `-${(b * 7).toFixed(1)}s, -${(c * 12).toFixed(1)}s`,
        ['--sway' as string]: rem(between(b, spec.sway[0], spec.sway[1])),
        ['--spin' as string]: `${Math.round(between(d, spec.spin[0], spec.spin[1])) * (b > 0.5 ? 1 : -1)}deg`,
      } as CSSProperties,
    });
  }

  return out;
}

/** 테마 컨셉을 살리는 분위기 입자 (햇살·별·꽃잎·눈 …) */
function Atmosphere({ theme }: Props) {
  const t = THEMES[theme];
  const particles = useMemo(() => build(t.atmosphere, t.atmosphereCount), [t.atmosphere, t.atmosphereCount]);

  return (
    <div className={styles.layer} aria-hidden="true">
      {particles.map((p, i) => (
        <div key={`${theme}-${i}`} className={`${styles.track} ${styles[`t_${p.kind}`]}`} style={p.track}>
          <div className={`${styles.shape} ${styles[p.kind]}`} style={p.shape} />
        </div>
      ))}
    </div>
  );
}

export default memo(Atmosphere);
