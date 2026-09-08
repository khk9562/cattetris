import { CatBlock, CAT_NAMES, type CatType } from '@/entities/cat';
import styles from './CollectionOverlay.module.css';

interface Props {
  stats: Record<string, number>;
  onClose: () => void;
}

const UNLOCK_THRESHOLD = 10000;

export default function CollectionOverlay({ stats, onClose }: Props) {
  const catTypes = Object.keys(CAT_NAMES) as CatType[];

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>고양이 도감</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="도감 닫기">
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
                    <p className={styles.count}>누적 제거: {count.toLocaleString()}개</p>
                  </div>
                ) : (
                  <div className={styles.info}>
                    <p className={styles.name}>???</p>
                    <p className={styles.count}>
                      미등록 (<span className={styles.progressText}>{count.toLocaleString()} / {UNLOCK_THRESHOLD.toLocaleString()}</span>)
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
