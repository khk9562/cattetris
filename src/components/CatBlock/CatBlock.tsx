import type { CatType } from '../../game/types';
import { CAT_COLORS } from '../../game/constants';
import styles from './CatBlock.module.css';

interface Props {
  catType: CatType;
  ghost?: boolean;
  showFace?: boolean;
}

export default function CatBlock({ catType, ghost, showFace }: Props) {
  const color = CAT_COLORS[catType];
  const isDark = catType === 'black';

  return (
    <div
      className={`${styles.block} ${ghost ? styles.ghost : ''}`}
      style={{ backgroundColor: ghost ? 'transparent' : color, borderColor: color }}
    >
      {showFace && !ghost && (
        <div className={styles.face}>
          <div className={`${styles.eye} ${isDark ? styles.lightEye : ''}`} />
          <div className={`${styles.eye} ${isDark ? styles.lightEye : ''}`} />
          <div className={styles.nose} />
        </div>
      )}
    </div>
  );
}
