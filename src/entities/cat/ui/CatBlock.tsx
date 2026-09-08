import { memo } from 'react';
import { DARK_CAT_TYPES, type CatType } from '../model/types';
import styles from './CatBlock.module.css';

export interface Conn {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

interface Props {
  catType: CatType;
  ghost?: boolean;
  conn?: Conn;
  showFace?: boolean;
  showEars?: boolean;
  showTail?: boolean;
  /** 제거 연출 종류 */
  effect?: 'line' | 'cluster' | 'splash';
  /** 얼굴 표정 (기본 idle: 가끔 깜빡임) */
  expression?: CatExpression;
  /** 깜빡임 타이밍을 셀마다 다르게 하기 위한 지연(초) */
  blinkDelay?: number;
}

export type CatExpression = 'idle' | 'happy' | 'scared' | 'dizzy' | 'sleepy';

function CatBlock({ catType, ghost, conn, showFace, showEars, showTail, effect, expression = 'idle', blinkDelay = 0 }: Props) {
  const isDark = DARK_CAT_TYPES.includes(catType);
  const c = conn || { top: false, right: false, bottom: false, left: false };

  const tl = !c.top && !c.left ? '0.35rem' : '0';
  const tr = !c.top && !c.right ? '0.35rem' : '0';
  const bl = !c.bottom && !c.left ? '0.35rem' : '0';
  const br = !c.bottom && !c.right ? '0.35rem' : '0';

  const shadows: string[] = [];
  if (!ghost) {
    if (!c.top) shadows.push('inset 0 2px 3px rgba(255,255,255,0.3)');
    if (!c.left) shadows.push('inset 2px 0 3px rgba(255,255,255,0.3)');
    if (!c.bottom) shadows.push('inset 0 -2px 3px rgba(0,0,0,0.2)');
    if (!c.right) shadows.push('inset -2px 0 3px rgba(0,0,0,0.2)');
  }

  const classNames = [
    styles.block,
    ghost ? styles.ghost : '',
    styles[catType] || '',
    c.top ? styles.connTop : '',
    c.right ? styles.connRight : '',
    c.bottom ? styles.connBottom : '',
    c.left ? styles.connLeft : '',
    effect ? styles[`fx_${effect}`] : '',
    styles[`face_${expression}`] || '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      style={{
        backgroundColor: ghost ? 'transparent' : undefined,
        borderRadius: `${tl} ${tr} ${br} ${bl}`,
        boxShadow: ghost ? 'none' : shadows.join(', '),
      }}
    >
      {showEars && !ghost && (
        <>
          <div className={styles.earLeft} />
          <div className={styles.earRight} />
        </>
      )}
      {showFace && !ghost && (
        <div className={styles.face}>
          <div className={styles.eyes} style={expression === 'idle' ? { animationDelay: `${blinkDelay}s` } : undefined}>
            <div className={`${styles.eye} ${styles.eyeLeft} ${isDark ? styles.lightEye : ''}`} />
            <div className={`${styles.eye} ${styles.eyeRight} ${isDark ? styles.lightEye : ''}`} />
          </div>
          <div className={styles.mouth}>
            <div className={`${styles.mouthArc} ${isDark ? styles.lightMouth : ''}`} />
            <div className={`${styles.mouthArc} ${isDark ? styles.lightMouth : ''}`} />
          </div>
          {expression === 'sleepy' && <span className={styles.zzz}>z</span>}
          {expression === 'scared' && <span className={styles.sweat} />}
        </div>
      )}
      {showTail && !ghost && (
        <div className={styles.tail} />
      )}
    </div>
  );
}

export default memo(CatBlock);
