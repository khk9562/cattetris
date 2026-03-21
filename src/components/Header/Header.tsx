import styles from './Header.module.css';

interface Props {
  elapsedTime: number;
}

export default function Header({ elapsedTime }: Props) {
  const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
  const seconds = String(elapsedTime % 60).padStart(2, '0');

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 24 }}>pets</span>
        <h1 className={styles.title}>Cat Tetris</h1>
      </div>
      <div className={styles.timer}>
        {minutes}:{seconds}
      </div>
    </header>
  );
}
