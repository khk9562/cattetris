import { ALL_CAT_TYPES, CatBlock, CAT_INFO, COLLECTION_UNLOCK_THRESHOLD } from '@/entities/cat';
import { Icon } from '@/shared/ui';
import styles from './CollectionOverlay.module.css';

interface Props {
  stats: Record<string, number>;
  onClose: () => void;
}

export default function CollectionOverlay({ stats, onClose }: Props) {
  const unlockedCount = ALL_CAT_TYPES.filter(cat => (stats[cat] || 0) >= COLLECTION_UNLOCK_THRESHOLD).length;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>고양이 도감 <span className={styles.progress}>{unlockedCount}/{ALL_CAT_TYPES.length}</span></h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="도감 닫기">
            <Icon name="close" size="1.5rem" />
          </button>
        </div>
        <div className={styles.grid}>
          {ALL_CAT_TYPES.map(cat => {
            const count = stats[cat] || 0;
            const isUnlocked = count >= COLLECTION_UNLOCK_THRESHOLD;

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
                    <p className={styles.name}>{CAT_INFO[cat].name}</p>
                    <p className={styles.desc}>{CAT_INFO[cat].description}</p>
                    <p className={styles.count}>누적 {count.toLocaleString()}마리</p>
                  </div>
                ) : (
                  <div className={styles.info}>
                    <p className={styles.name}>???</p>
                    <p className={styles.count}>
                      미등록 (<span className={styles.progressText}>{count.toLocaleString()} / {COLLECTION_UNLOCK_THRESHOLD.toLocaleString()}</span>)
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
