import { memo } from 'react';
import styles from './StatsHUD.module.css';

interface Props {
  score: number;
  level: number;
  lines: number;
  combo: number;
  highScore: number;
}

function StatsHUD({ score, level, lines, combo, highScore }: Props) {
  return (
    <div className={styles.container}>
      <div className={`${styles.statBlock} ${styles.scoreBlock}`}>
        <p className={styles.label}>점수</p>
        <p className={styles.scoreValue}>{score.toLocaleString()}</p>
      </div>
      <div className={styles.statBlock}>
        <p className={styles.label}>최고</p>
        <p className={styles.subValue}>{highScore.toLocaleString()}</p>
      </div>
      <div className={styles.statBlock}>
        <p className={styles.label}>레벨</p>
        <p className={styles.metaValue}>{level}</p>
      </div>
      <div className={styles.statBlock}>
        <p className={styles.label}>줄</p>
        <p className={styles.metaValue}>{lines}</p>
      </div>
      <div className={styles.statBlock}>
        <p className={styles.label}>콤보</p>
        <p key={combo} className={`${styles.metaValue} ${combo > 1 ? styles.comboHot : ''}`}>x{combo}</p>
      </div>
    </div>
  );
}

export default memo(StatsHUD);
