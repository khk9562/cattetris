import { memo } from 'react';
import type { MissionItem } from '@/features/daily-missions';
import MissionRows from './MissionRows';
import styles from './MissionOverlays.module.css';

interface Props {
  items: MissionItem[];
  onClaim: (id: string) => void;
  onClose: () => void;
}

/** 헤더의 목록 아이콘에서 열리는 오늘의 미션 팝오버 */
function MissionPopover({ items, onClaim, onClose }: Props) {
  const done = items.filter(it => it.done).length;

  return (
    <>
      <button className={styles.scrim} onClick={onClose} aria-label="미션 닫기" />
      <div className={styles.popover} role="dialog" aria-label="오늘의 미션">
        <div className={styles.arrow} />
        <div className={styles.head}>
          <span className={styles.fieldLabel}>오늘의 미션</span>
          <span className={styles.summary}>{done} / {items.length} 완료</span>
        </div>
        <MissionRows items={items} onClaim={onClaim} />
      </div>
    </>
  );
}

export default memo(MissionPopover);
