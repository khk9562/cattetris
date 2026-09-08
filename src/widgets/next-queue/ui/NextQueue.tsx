import { memo } from 'react';
import { PiecePreview, type ActivePiece } from '@/entities/piece';
import styles from './NextQueue.module.css';

interface Props {
  pieces: ActivePiece[];
}

function NextQueue({ pieces }: Props) {
  return (
    <div className={styles.container}>
      <p className={styles.label}>다음</p>
      <div className={styles.list}>
        {pieces.map((p, i) => (
          <div key={i} className={i === 0 ? styles.first : styles.rest}>
            <PiecePreview piece={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(NextQueue);
