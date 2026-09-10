import { memo } from 'react';
import type { MissionItem } from '@/features/daily-missions';
import MissionRows from './MissionRows';
import styles from './MissionOverlays.module.css';

interface Props {
  items: MissionItem[];
  onClose: () => void;
}

/** 오늘 첫 접속에만 뜨는 미션 안내 팝업 */
function MissionModal({ items, onClose }: Props) {
  return (
    <>
      <button className={styles.scrim} onClick={onClose} aria-label="닫기" tabIndex={-1} />
      <div className={styles.modalWrap}>
        <div className={styles.modalCard} role="dialog" aria-label="오늘의 미션">
          <span className={styles.fieldLabel}>오늘의 미션</span>
          <h3 className={styles.modalTitle}>왔냥? 좀 늦었다냥</h3>
          <p className={styles.modalLead}>오늘 미션 3개. 자정에 사라짐. 못 깨면 칭호도 없음 🐾</p>
          <div className={styles.modalRows}>
            <MissionRows items={items} />
          </div>
          <button className={styles.confirmBtn} onClick={onClose}>알았다냥</button>
        </div>
      </div>
    </>
  );
}

export default memo(MissionModal);
