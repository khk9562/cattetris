import type { CatType } from '../../game/types';
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
  const isDark = catType === 'black' || catType === 'russianBlue';
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
    c.left ? styles.connLeft : ''
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
          <div className={styles.eyes}>
            <div className={`${styles.eye} ${isDark ? styles.lightEye : ''}`} />
            <div className={`${styles.eye} ${isDark ? styles.lightEye : ''}`} />
          </div>
          <div className={styles.mouth}>
            <div className={`${styles.mouthArc} ${isDark ? styles.lightMouth : ''}`} />
            <div className={`${styles.mouthArc} ${isDark ? styles.lightMouth : ''}`} />
          </div>
        </div>
      )}
      {showTail && !ghost && (
        <div className={styles.tail} />
      )}
    </div>
  );
}
