import type { CatType } from '../../game/types';
import { CAT_COLORS } from '../../game/constants';
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
}

export default function CatBlock({ catType, ghost, conn, showFace, showEars, showTail }: Props) {
  const color = CAT_COLORS[catType];
  const isDark = catType === 'black';
  const c = conn || { top: false, right: false, bottom: false, left: false };

  const tl = !c.top && !c.left ? '0.25rem' : '0';
  const tr = !c.top && !c.right ? '0.25rem' : '0';
  const bl = !c.bottom && !c.left ? '0.25rem' : '0';
  const br = !c.bottom && !c.right ? '0.25rem' : '0';

  const shadows: string[] = [];
  if (!ghost) {
    shadows.push('inset 1px 1px 2px rgba(255,255,255,0.35)');
    shadows.push('inset -1px -1px 2px rgba(0,0,0,0.08)');
    if (c.right) shadows.push(`1px 0 0 ${color}`);
    if (c.bottom) shadows.push(`0 1px 0 ${color}`);
  }

  return (
    <div
      className={`${styles.block} ${ghost ? styles.ghost : ''}`}
      style={{
        backgroundColor: ghost ? 'transparent' : color,
        borderColor: color,
        borderRadius: `${tl} ${tr} ${br} ${bl}`,
        boxShadow: ghost ? 'none' : shadows.join(', '),
      }}
    >
      {showEars && !ghost && (
        <>
          <div className={styles.earLeft} style={{ backgroundColor: color }} />
          <div className={styles.earRight} style={{ backgroundColor: color }} />
        </>
      )}
      {showFace && !ghost && (
        <div className={styles.face}>
          <div className={styles.eyes}>
            <div className={`${styles.eye} ${isDark ? styles.light : ''}`} />
            <div className={`${styles.eye} ${isDark ? styles.light : ''}`} />
          </div>
          <div className={styles.mouth}>
            <div className={`${styles.mouthArc} ${isDark ? styles.light : ''}`} />
            <div className={`${styles.mouthArc} ${isDark ? styles.light : ''}`} />
          </div>
        </div>
      )}
      {showTail && !ghost && (
        <div
          className={styles.tail}
          style={{ borderColor: color, filter: 'brightness(0.75)' }}
        />
      )}
    </div>
  );
}
