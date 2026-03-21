import styles from './StatsHUD.module.css';

interface Props {
  score: number;
  combo: number;
  highScore: number;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function StatsHUD({ score, combo, highScore }: Props) {
  return (
    <div className={styles.container}>
      <div>
        <p className={styles.label}>최고 기록</p>
        <p className={styles.comboValue}>{formatNumber(highScore)}</p>
      </div>
      <div>
        <p className={styles.label}>콤보</p>
        <p className={styles.comboValue}>x{combo}</p>
      </div>
      <div className={styles.scoreBlock}>
        <p className={styles.label}>점수</p>
        <p className={styles.scoreValue}>{formatNumber(score)}</p>
      </div>
    </div>
  );
}
