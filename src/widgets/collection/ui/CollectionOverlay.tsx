import { memo, useState } from 'react';
import {
  ACCESSORIES,
  ALL_CAT_TYPES,
  CatBlock,
  CAT_INFO,
  CAT_SKINS,
  COLLECTION_UNLOCK_THRESHOLD,
  SKIN_TIER_THRESHOLDS,
  isAccessoryUnlocked,
  isSkinUnlocked,
  type AccessoryId,
  type CatType,
  type EquippedSkins,
} from '@/entities/cat';
import { Icon } from '@/shared/ui';
import styles from './CollectionOverlay.module.css';

interface Props {
  stats: Partial<Record<CatType, number>>;
  equipped: EquippedSkins;
  totalStars: number;
  skinsUnlocked: number;
  skinsTotal: number;
  onEquipPalette: (cat: CatType, skinId: string) => void;
  onEquipAccessory: (id: AccessoryId | null) => void;
  onClose: () => void;
}

function CollectionOverlay({ stats, equipped, totalStars, skinsUnlocked, skinsTotal, onEquipPalette, onEquipAccessory, onClose }: Props) {
  const [openCat, setOpenCat] = useState<CatType | null>(null);
  const registered = ALL_CAT_TYPES.filter(cat => (stats[cat] ?? 0) >= COLLECTION_UNLOCK_THRESHOLD).length;

  return (
    <div className={styles.overlay} role="dialog" aria-label="고양이 도감">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>고양이 도감 <span className={styles.progress}>{registered}/{ALL_CAT_TYPES.length}</span></h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="도감 닫기">
            <Icon name="close" size="1.5rem" />
          </button>
        </div>

        <div className={styles.body} data-scroll>
          <section className={styles.accessories} aria-label="액세서리">
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>액세서리</span>
              <span className={styles.sectionHint}>스테이지 별로 해금 · 스킨 {skinsUnlocked}/{skinsTotal}</span>
            </div>
            <div className={styles.accRow}>
              {ACCESSORIES.map(acc => {
                const unlocked = isAccessoryUnlocked(acc.id, totalStars);
                const on = equipped.accessory === acc.id;
                return (
                  <button
                    key={acc.id}
                    className={`${styles.accItem} ${on ? styles.accOn : ''} ${!unlocked ? styles.accLocked : ''}`}
                    disabled={!unlocked}
                    onClick={() => onEquipAccessory(acc.id)}
                    aria-pressed={on}
                    aria-label={`${acc.name}${unlocked ? '' : ` (별 ${acc.stars}개 필요)`}`}
                  >
                    <span className={styles.accPreview}>
                      <CatBlock catType="ginger" showFace showEars skinId="default" accessory={acc.id} />
                    </span>
                    <span className={styles.accName}>{acc.name}</span>
                    <span className={styles.accReq}>{unlocked ? (on ? '장착 중' : '탭하여 장착') : <><Icon name="star" size="0.7rem" /> {acc.stars}</>}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className={styles.grid}>
            {ALL_CAT_TYPES.map(cat => {
              const count = stats[cat] ?? 0;
              const isRegistered = count >= COLLECTION_UNLOCK_THRESHOLD;
              const open = openCat === cat;
              const skins = CAT_SKINS[cat];
              const current = equipped.palettes[cat] ?? skins[0].id;

              return (
                <div key={cat} className={`${styles.card} ${!isRegistered ? styles.locked : ''} ${open ? styles.cardOpen : ''}`}>
                  <button
                    className={styles.cardMain}
                    onClick={() => isRegistered && setOpenCat(open ? null : cat)}
                    aria-expanded={open}
                    aria-label={isRegistered ? `${CAT_INFO[cat].name} 스킨 고르기` : '미등록 고양이'}
                  >
                    <div className={styles.catImageWrapper}>
                      <CatBlock catType={cat} showFace showEars showTail />
                    </div>
                    {isRegistered ? (
                      <div className={styles.info}>
                        <p className={styles.name}>{CAT_INFO[cat].name}</p>
                        <p className={styles.desc}>{CAT_INFO[cat].description}</p>
                        <p className={styles.count}>누적 {count.toLocaleString()}마리 · 스킨 {skins.filter(s => isSkinUnlocked(s, count)).length}/{skins.length}</p>
                      </div>
                    ) : (
                      <div className={styles.info}>
                        <p className={styles.name}>???</p>
                        <p className={styles.count}>
                          미등록 (<span className={styles.progressText}>{count.toLocaleString()} / {COLLECTION_UNLOCK_THRESHOLD.toLocaleString()}</span>)
                        </p>
                      </div>
                    )}
                  </button>

                  {open && (
                    <div className={styles.swatches} role="radiogroup" aria-label={`${CAT_INFO[cat].name} 스킨`}>
                      {skins.map(skin => {
                        const unlocked = isSkinUnlocked(skin, count);
                        const selected = current === skin.id;
                        return (
                          <button
                            key={skin.id}
                            role="radio"
                            aria-checked={selected}
                            disabled={!unlocked}
                            className={`${styles.swatch} ${selected ? styles.swatchOn : ''} ${!unlocked ? styles.swatchLocked : ''}`}
                            onClick={() => onEquipPalette(cat, skin.id)}
                            aria-label={`${skin.name}${unlocked ? '' : ` (${SKIN_TIER_THRESHOLDS[skin.tier as 1 | 2].toLocaleString()}마리 필요)`}`}
                          >
                            <span className={styles.swatchPreview}>
                              <CatBlock catType={cat} showFace showEars skinId={skin.id} accessory={null} />
                              {!unlocked && <span className={styles.swatchLock}><Icon name="lock" size="0.9rem" /></span>}
                            </span>
                            <span className={styles.swatchName}>{skin.name}</span>
                            {!unlocked && skin.tier !== 0 && (
                              <span className={styles.swatchReq}>{SKIN_TIER_THRESHOLDS[skin.tier].toLocaleString()}마리</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CollectionOverlay);
