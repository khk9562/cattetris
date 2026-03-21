import styles from './StatsHUD.module.css';

interface Props {
  highScore: number;
  score: number;
  combo: number;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function StatsHUD({ highScore, score, combo }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.highScore}>
        <p className={styles.label}>High Score</p>
        <p className={styles.highScoreValue}>{formatNumber(highScore)}</p>
      </div>
      <div className={styles.row}>
        <div>
          <p className={styles.label}>Combo</p>
          <p className={styles.comboValue}>x{combo}</p>
        </div>
        <div className={styles.scoreBlock}>
          <p className={styles.label}>Score</p>
          <p className={styles.scoreValue}>{formatNumber(score)}</p>
        </div>
      </div>
    </div>
  );
}
