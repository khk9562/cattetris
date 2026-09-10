import { memo, useMemo, type CSSProperties } from 'react';
import { THEMES, type AtmosphereKind, type ThemeId } from '@/shared/config';
import styles from './Atmosphere.module.css';

interface Props {
  theme: ThemeId;
}

interface Particle {
  kind: AtmosphereKind;
  style: CSSProperties;
}

/** 배치가 매번 흔들리지 않도록 시드 하나로 고정한다 */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

const rem = (px: number) => `${(px / 16).toFixed(3)}rem`;

function build(kind: AtmosphereKind, count: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const a = rand(i + 1);
    const b = rand(i + 11);
    const c = rand(i + 29);
    const left = `${Math.round(a * 96)}%`;
    const delay = `${(a * 9).toFixed(1)}s`;

    if (kind === 'ray' || kind === 'beam') {
      const wide = kind === 'beam';
      const side = wide ? { right: `${4 + i * 18}%` } : { left: `${-10 + i * 22}%` };
      out.push({
        kind,
        style: {
          ...side,
          width: rem(wide ? 26 + Math.round(b * 26) : 18 + Math.round(b * 22)),
          animationDuration: `${(wide ? 9 : 8) + Math.round(c * 6)}s`,
          animationDelay: `${(a * 5).toFixed(1)}s`,
          ['--rot' as string]: wide ? `${-14 - Math.round(b * 8)}deg` : `${16 + Math.round(b * 8)}deg`,
        } as CSSProperties,
      });
      continue;
    }

    if (kind === 'star') {
      const size = rem(2 + Math.round(c * 2));
      out.push({
        kind,
        style: {
          left, top: `${Math.round(b * 62)}%`, width: size, height: size,
          animationDuration: `${(2.4 + c * 3).toFixed(1)}s`,
          animationDelay: `${(a * 3).toFixed(1)}s`,
        },
      });
      continue;
    }

    if (kind === 'petal' || kind === 'snow' || kind === 'leaf') {
      const size = kind === 'snow' ? 4 + Math.round(c * 4) : 7 + Math.round(c * 5);
      out.push({
        kind,
        style: {
          left,
          width: rem(size),
          height: rem(kind === 'snow' ? size : Math.round(size * 0.78)),
          animationDuration: `${((kind === 'snow' ? 11 : 8.5) + c * 6).toFixed(1)}s`,
          animationDelay: delay,
          ['--dx' as string]: rem(Math.round((b - 0.5) * 90)),
          ['--dr' as string]: `${Math.round(180 + c * 420)}deg`,
        } as CSSProperties,
      });
      continue;
    }

    if (kind === 'bubble') {
      const size = rem(6 + Math.round(c * 12));
      out.push({
        kind,
        style: {
          left, width: size, height: size,
          animationDuration: `${(11 + c * 7).toFixed(1)}s`,
          animationDelay: `${(a * 10).toFixed(1)}s`,
          ['--dx' as string]: rem(Math.round((b - 0.5) * 40)),
        } as CSSProperties,
      });
      continue;
    }

    const size = rem(3 + Math.round(c * 3));
    out.push({
      kind: 'mote',
      style: {
        left, top: `${10 + Math.round(b * 70)}%`, width: size, height: size,
        animationDuration: `${(7 + c * 6).toFixed(1)}s`,
        animationDelay: `${(a * 5).toFixed(1)}s`,
      },
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
        <div key={`${theme}-${i}`} className={`${styles.particle} ${styles[p.kind]}`} style={p.style} />
      ))}
    </div>
  );
}

export default memo(Atmosphere);
