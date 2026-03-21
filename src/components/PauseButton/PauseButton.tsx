import styles from './PauseButton.module.css';
import type { GameStatus } from '../../game/types';

interface Props {
  status: GameStatus;
  onToggle: () => void;
}

export default function PauseButton({ status, onToggle }: Props) {
  if (status !== 'playing' && status !== 'paused') return null;

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={onToggle}>
        <span className="material-symbols-outlined">
          {status === 'paused' ? 'play_arrow' : 'pause'}
        </span>
      </button>
    </div>
  );
}
