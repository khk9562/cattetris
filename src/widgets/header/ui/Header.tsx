import { memo } from 'react';
import type { GameStatus } from '@/features/game-session';
import { Icon } from '@/shared/ui';
import styles from './Header.module.css';

interface Props {
  elapsedSeconds: number;
  status: GameStatus;
  /** 왼쪽 작은 글자: 시작 화면은 NYANG STACK, 게임 중은 모드·난이도 */
  kicker: string;
  /** 아직 받지 않은 미션이 있으면 목록 아이콘에 점을 찍는다 */
  missionBadge: boolean;
  onOpenMissions: () => void;
  onTogglePause: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onGoHome: () => void;
  onOpenCollection: () => void;
}

function Header({
  elapsedSeconds, status, kicker, missionBadge,
  onOpenMissions, onTogglePause, onOpenSettings, onOpenStats, onGoHome, onOpenCollection,
}: Props) {
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');
  const inGame = status === 'playing' || status === 'paused';
  const isHome = status === 'ready';

  return (
    <header className={styles.header}>
      <span className={styles.kicker}>{kicker}</span>
      <div className={styles.right}>
        {inGame ? (
          <>
            <span className={styles.timer}>{minutes}:{seconds}</span>
            <button className={styles.iconBtn} onClick={onTogglePause} aria-label={status === 'paused' ? '이어하기' : '일시 정지'}>
              <Icon name={status === 'paused' ? 'play' : 'pause'} size="1.3rem" />
            </button>
          </>
        ) : (
          <>
            {isHome ? (
              <button className={styles.iconBtn} onClick={onOpenMissions} aria-label="오늘의 미션">
                <Icon name="list" size="1.3rem" />
                {missionBadge && <span className={styles.badge} />}
              </button>
            ) : (
              <button className={styles.iconBtn} onClick={onGoHome} aria-label="메인 메뉴">
                <Icon name="home" size="1.3rem" />
              </button>
            )}
            <button className={styles.iconBtn} onClick={onOpenCollection} aria-label="도감 열기">
              <Icon name="book" size="1.3rem" />
            </button>
            <button className={styles.iconBtn} onClick={onOpenStats} aria-label="통계 열기">
              <Icon name="chart" size="1.3rem" />
            </button>
          </>
        )}
        <button className={styles.iconBtn} onClick={onOpenSettings} aria-label="설정">
          <Icon name="gear" size="1.3rem" />
        </button>
      </div>
    </header>
  );
}

export default memo(Header);
