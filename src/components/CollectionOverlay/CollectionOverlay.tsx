import type { CatType } from '../../game/types';
import CatBlock from '../CatBlock/CatBlock';
import styles from './CollectionOverlay.module.css';

interface Props {
  stats: Record<string, number>;
  onClose: () => void;
}

const CAT_NAMES: Record<CatType, string> = {
  ginger: '분홍 치즈 (Ginger)',
  tuxedo: '턱시도고양이 (Tuxedo)',
  russianBlue: '러시안블루 (Russian Blue)',
  calico: '삼색고양이 (Calico)',
  siamese: '샴고양이 (Siamese)',
  black: '까만고양이 (Black Cat)',
  tabby: '고등어태비 (Brown Tabby)',
  darkTabby: '실버태비 (Silver Tabby)',
};

const UNLOCK_THRESHOLD = 10000;

export default function CollectionOverlay({ stats, onClose }: Props) {
  const catTypes = Object.keys(CAT_NAMES) as CatType[];

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Cat Encyclopedia</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close Encyclopedia">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className={styles.grid}>
          {catTypes.map(cat => {
            const count = stats[cat] || 0;
            const isUnlocked = count >= UNLOCK_THRESHOLD;

            return (
              <div key={cat} className={`${styles.card} ${!isUnlocked ? styles.locked : ''}`}>
                <div className={styles.catImageWrapper}>
                  <CatBlock 
                    catType={cat} 
                    showFace 
                    showEars 
                    showTail 
                  />
                </div>
                {isUnlocked ? (
                  <div className={styles.info}>
                    <p className={styles.name}>{CAT_NAMES[cat]}</p>
                    <p className={styles.count}>{count.toLocaleString()} Destroyed</p>
                  </div>
                ) : (
                  <div className={styles.info}>
                    <p className={styles.name}>???</p>
                    <p className={styles.count}>
                      Locked (<span className={styles.progressText}>{count.toLocaleString()} / {UNLOCK_THRESHOLD.toLocaleString()}</span>)
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
