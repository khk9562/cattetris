import { useEffect, useRef, useState } from 'react';
import styles from './RollingNumber.module.css';

interface Props {
  value: number;
  /** 롤링 시간(ms) */
  duration?: number;
  className?: string;
}

/** 숫자가 바뀌면 이전 값에서 새 값까지 굴러가며 살짝 튀어오른다 */
export default function RollingNumber({ value, duration = 380, className }: Props) {
  const [shown, setShown] = useState({ value, bump: 0 });
  const from = useRef(value);
  const raf = useRef(0);

  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const t0 = performance.now();
    // 모든 상태 갱신은 프레임 콜백 안에서만 일어난다
    const step = (now: number) => {
      const t = reduce ? 1 : Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(start + (value - start) * eased);
      setShown(prev => ({ value: v, bump: prev.bump }));
      if (t < 1) raf.current = requestAnimationFrame(step);
      else from.current = value;
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(now => {
      setShown(prev => ({ ...prev, bump: prev.bump + 1 }));
      step(now);
    });
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return (
    <span key={shown.bump} className={`${styles.num} ${shown.bump ? styles.bump : ''} ${className ?? ''}`}>
      {shown.value.toLocaleString()}
    </span>
  );
}
