import { memo } from 'react';
import { DIFFICULTY_ORDER, DIFFICULTY_PRESETS, type DifficultyId } from '@/entities/difficulty';
import { STAGES } from '@/entities/stage';
import type { PlayerTotals } from '@/features/player-stats';
import { Icon } from '@/shared/ui';
import styles from './StatsOverlay.module.css';

interface Props {
  totals: PlayerTotals;
  highScores: Record<DifficultyId, number>;
  stageStars: Record<number, number>;
  titles: string[];
  skinsUnlocked: number;
  skinsTotal: number;
  onClose: () => void;
}

function formatDuration(ms: number): string {
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min}분`;
  return `${Math.floor(min / 60)}시간 ${min % 60}분`;
}

function StatsOverlay({ totals, highScores, stageStars, titles, skinsUnlocked, skinsTotal, onClose }: Props) {
  const stars = Object.values(stageStars).reduce((a, b) => a + b, 0);
  return (
    <div className={styles.overlay} role="dialog" aria-label="통계">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>통계</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="통계 닫기"><Icon name="close" size="1.5rem" /></button>
        </div>
        <div className={styles.body}>
          <div className={styles.tiles}>
            <div className={styles.tile}><span>플레이</span><strong>{totals.games}판</strong></div>
            <div className={styles.tile}><span>시간</span><strong>{formatDuration(totals.playMs)}</strong></div>
            <div className={styles.tile}><span>줄</span><strong>{totals.lines.toLocaleString()}</strong></div>
            <div className={styles.tile}><span>폭발</span><strong>{totals.explosions.toLocaleString()}</strong></div>
            <div className={styles.tile}><span>최대 연쇄</span><strong>{totals.bestChain}</strong></div>
            <div className={styles.tile}><span>누적 점수</span><strong>{totals.totalScore.toLocaleString()}</strong></div>
          </div>

          <h3 className={styles.section}>무한 모드 최고 기록</h3>
          <table className={styles.table}>
            <thead><tr><th>난이도</th><th>최고 점수</th><th>최고 레벨</th></tr></thead>
            <tbody>
              {DIFFICULTY_ORDER.map(id => (
                <tr key={id}>
                  <td>{DIFFICULTY_PRESETS[id].label}</td>
                  <td>{highScores[id].toLocaleString()}</td>
                  <td>{totals.bestLevel[id] || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className={styles.section}>스테이지</h3>
          <p className={styles.line}><Icon name="star" size="1rem" /> {stars} / {STAGES.length * 3} · 클리어 {Object.keys(stageStars).length} / {STAGES.length}</p>

          <h3 className={styles.section}>스킨</h3>
          <p className={styles.line}>해금 {skinsUnlocked} / {skinsTotal} · 도감 누적 500/2,000마리와 스테이지 별로 열려요</p>

          <h3 className={styles.section}>얻은 칭호</h3>
          {titles.length === 0 ? (
            <p className={styles.muted}>오늘의 미션을 완료하면 칭호를 받아요</p>
          ) : (
            <div className={styles.titles}>{titles.map(t => <span key={t} className={styles.badge}>{t}</span>)}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(StatsOverlay);
