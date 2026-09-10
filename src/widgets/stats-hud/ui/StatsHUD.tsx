import { memo } from 'react';
import { RollingNumber } from '@/shared/ui';
import styles from './StatsHUD.module.css';

interface Props {
  score: number;
  level: number;
  lines: number;
  combo: number;
}

function StatsHUD({ score, level, lines, combo }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.scoreBlock}>
        <p className={styles.label}>점수</p>
        <p className={styles.scoreValue}><RollingNumber value={score} /></p>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.stat}>Lv <b>{level}</b></span>
        <span className={styles.stat}>줄 <b>{lines}</b></span>
        <span key={combo} className={`${styles.stat} ${combo > 1 ? styles.comboHot : ''}`}>콤보 <b>x{combo}</b></span>
      </div>
    </div>
  );
}

export default memo(StatsHUD);
