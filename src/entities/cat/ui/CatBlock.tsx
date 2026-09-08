import { memo } from 'react';
import { DARK_CAT_TYPES, type CatType } from '../model/types';
import { getSkin, paletteVars, type AccessoryId } from '../config/skins';
import { useEquippedSkins } from '../model/skinContext';
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
  /** 보드 좌표. 무늬 타일이 셀에 붙어 이어지도록 위상을 정한다 */
  cellX?: number;
  cellY?: number;
  /** 컨텍스트 대신 직접 지정할 스킨 (도감 미리보기용) */
  skinId?: string;
  accessory?: AccessoryId | null;
}

export type CatExpression = 'idle' | 'happy' | 'scared' | 'dizzy' | 'sleepy';

const R = '38%';

function CatBlock({
  catType, ghost, conn, showFace, showEars, showTail, effect, expression = 'idle', blinkDelay = 0, cellX = 0, cellY = 0, skinId, accessory,
}: Props) {
  const isDark = DARK_CAT_TYPES.includes(catType);
  const equipped = useEquippedSkins();
  const skin = getSkin(catType, skinId ?? equipped.palettes[catType]);
  const acc = accessory === undefined ? equipped.accessory : accessory;
  const c = conn || { top: false, right: false, bottom: false, left: false };

  // 조각 전체가 하나의 둥근 덩어리로 보이도록 바깥 모서리만 크게 둥글린다
  const tl = !c.top && !c.left ? R : '0';
  const tr = !c.top && !c.right ? R : '0';
  const bl = !c.bottom && !c.left ? R : '0';
  const br = !c.bottom && !c.right ? R : '0';

  const shadows: string[] = [];
  if (!ghost) {
    if (!c.top) shadows.push('inset 0 3px 4px rgba(255,255,255,0.35)');
    if (!c.left) shadows.push('inset 3px 0 4px rgba(255,255,255,0.22)');
    if (!c.bottom) shadows.push('inset 0 -4px 5px rgba(0,0,0,0.16)');
    if (!c.right) shadows.push('inset -3px 0 4px rgba(0,0,0,0.12)');
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

  const style = {
    ...paletteVars(skin.palette),
    '--px': String(Math.abs(cellX) % 2),
    '--py': String(Math.abs(cellY) % 2),
    borderRadius: `${tl} ${tr} ${br} ${bl}`,
    boxShadow: ghost ? 'none' : shadows.join(', '),
  } as React.CSSProperties;

  return (
    <div className={classNames} style={style}>
      {showEars && !ghost && (
        <>
          <div className={styles.earLeft} />
          <div className={styles.earRight} />
        </>
      )}
      {showFace && !ghost && (
        <div className={styles.face}>
          <span className={`${styles.cheek} ${styles.cheekL}`} />
          <span className={`${styles.cheek} ${styles.cheekR}`} />
          <span className={`${styles.whisker} ${styles.whiskerL}`} />
          <span className={`${styles.whisker} ${styles.whiskerR}`} />
          <div className={styles.eyes} style={expression === 'idle' ? { animationDelay: `${blinkDelay}s` } : undefined}>
            <div className={`${styles.eye} ${styles.eyeLeft} ${isDark ? styles.lightEye : ''}`} />
            <div className={`${styles.eye} ${styles.eyeRight} ${isDark ? styles.lightEye : ''}`} />
          </div>
          <div className={styles.snout}>
            <span className={styles.nose} />
            <div className={styles.mouth}>
              <div className={`${styles.mouthArc} ${isDark ? styles.lightMouth : ''}`} />
              <div className={`${styles.mouthArc} ${isDark ? styles.lightMouth : ''}`} />
            </div>
          </div>
          {expression === 'sleepy' && <span className={styles.zzz}>z</span>}
          {expression === 'scared' && <span className={styles.sweat} />}
        </div>
      )}
      {showFace && !ghost && acc && (
        <div className={`${styles.acc} ${styles[`acc_${acc}`]}`} aria-hidden="true"><span /></div>
      )}
      {showTail && !ghost && (
        <svg className={styles.tail} viewBox="0 0 40 40" aria-hidden="true">
          <path d="M6 37 C 4 22, 30 26, 31 13 C 31.5 5, 21 4, 18 11" fill="none" stroke="var(--fur-tail)" strokeWidth="7.5" strokeLinecap="round" />
          <path d="M6 37 C 4 22, 30 26, 31 13 C 31.5 5, 21 4, 18 11" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round" transform="translate(-1,-1.5)" />
        </svg>
      )}
    </div>
  );
}

export default memo(CatBlock);
