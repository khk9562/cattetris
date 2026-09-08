import { memo } from 'react';
import { PiecePreview, type ActivePiece } from '@/entities/piece';
import { Icon } from '@/shared/ui';
import styles from './HoldSlot.module.css';

interface Props {
  piece: ActivePiece | null;
  disabled: boolean;
  onHold: () => void;
}

function HoldSlot({ piece, disabled, onHold }: Props) {
  return (
    <button
      type="button"
      className={`${styles.container} ${disabled ? styles.disabled : ''}`}
      onPointerDown={e => { e.preventDefault(); onHold(); }}
      aria-label="홀드"
      data-coach-target="hold"
    >
      <p className={styles.label}>홀드</p>
      <div className={styles.body}>
        {piece ? <PiecePreview piece={piece} /> : <Icon name="hold" size="1.5rem" style={{ opacity: 0.35 }} />}
      </div>
    </button>
  );
}

export default memo(HoldSlot);
