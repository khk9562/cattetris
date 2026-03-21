import { useCallback, useEffect, useRef, useState } from 'react';
import { createBoard, isValidPosition, placePiece, getCompletedRows, clearRows, getGhostPosition, findMatches, clearMatches, applyGravity } from './board';
import { createPiece, rotatePiece, type ActivePiece } from './pieces';
import { SCORE_TABLE, SPEED_TABLE, LINES_PER_LEVEL, HIGH_SCORE_KEY } from './constants';
import type { Board, GameStatus } from './types';

const STATS_KEY = 'cattetris_stats';

function getStoredHighScore(): number {
  try {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

export function getStoredStats(): Record<string, number> {
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function useGame() {
  const [board, setBoard] = useState<Board>(createBoard);
  const [currentPiece, setCurrentPiece] = useState<ActivePiece | null>(null);
  const [nextPiece, setNextPiece] = useState<ActivePiece>(createPiece);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(getStoredHighScore);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [status, setStatus] = useState<GameStatus>('ready');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [destroyedStats, setDestroyedStats] = useState<Record<string, number>>(getStoredStats);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardRef = useRef(board);
  boardRef.current = board;
  const currentPieceRef = useRef(currentPiece);
  currentPieceRef.current = currentPiece;
  const comboRef = useRef(combo);
  comboRef.current = combo;
  const statusRef = useRef(status);
  statusRef.current = status;
  const destroyedStatsRef = useRef(destroyedStats);
  destroyedStatsRef.current = destroyedStats;

  const spawnPiece = useCallback(() => {
    const piece = nextPiece;
    const next = createPiece();
    if (!isValidPosition(boardRef.current, piece)) {
      setStatus('gameover');
      const finalScore = score;
      if (finalScore > getStoredHighScore()) {
        localStorage.setItem(HIGH_SCORE_KEY, String(finalScore));
        setHighScore(finalScore);
      }
      localStorage.setItem(STATS_KEY, JSON.stringify(destroyedStatsRef.current));
      return;
    }
    setCurrentPiece(piece);
    setNextPiece(next);
  }, [nextPiece, score]);

  const lockPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece) return;
    let newBoard = placePiece(boardRef.current, piece);
    let totalScoreToAdd = 0;
    let didClearSomething = false;

    let settling = true;
    let localCombo = comboRef.current;

    while (settling) {
      settling = false;

      // 1. Process matches (15+)
      const matches = findMatches(newBoard, 15);
      if (matches.length > 0) {
        const typeCounts: Record<string, number> = {};
        for (const m of matches) {
          const type = newBoard[m.y][m.x];
          if (type && typeof type === 'string') {
            typeCounts[type] = (typeCounts[type] || 0) + 1;
          }
        }
        setDestroyedStats(prev => {
          const next = { ...prev };
          for (const [t, count] of Object.entries(typeCounts)) {
            next[t] = (next[t] || 0) + count;
          }
          return next;
        });

        newBoard = clearMatches(newBoard, matches);
        totalScoreToAdd += matches.length * 20 * (1 + localCombo * 0.5);
        didClearSomething = true;
        settling = true;
      }

      // 2. Process Line Clears
      const completed = getCompletedRows(newBoard);
      if (completed.length > 0) {
        const typeCounts: Record<string, number> = {};
        for (const r of completed) {
          for (let c = 0; c < 10; c++) {
            const type = newBoard[r][c];
            if (type && typeof type === 'string') {
              typeCounts[type] = (typeCounts[type] || 0) + 1;
            }
          }
        }
        setDestroyedStats(prev => {
          const next = { ...prev };
          for (const [t, count] of Object.entries(typeCounts)) {
            next[t] = (next[t] || 0) + count;
          }
          return next;
        });

        newBoard = clearRows(newBoard, completed);
        totalScoreToAdd += (SCORE_TABLE[completed.length] || 0) * (1 + localCombo * 0.5);
        didClearSomething = true;
        settling = true;
        
        setLinesCleared(l => {
          const newTotal = l + completed.length;
          const newLevel = Math.floor(newTotal / LINES_PER_LEVEL) + 1;
          setLevel(newLevel);
          return newTotal;
        });
      }

      // 3. Apply gravity if any clears occurred
      if (settling) {
        const gravityResult = applyGravity(newBoard);
        if (gravityResult.changed) {
          newBoard = gravityResult.newBoard;
          localCombo += 1; // Increase combo for consecutive chains!
        }
      }
    }

    setBoard(newBoard);

    if (didClearSomething) {
      setScore(s => s + Math.floor(totalScoreToAdd));
      setCombo(localCombo + 1);
    } else {
      setCombo(0);
    }
    
    setCurrentPiece(null);
  }, []);

  // Spawn piece when currentPiece becomes null during playing
  useEffect(() => {
    if (status === 'playing' && currentPiece === null) {
      spawnPiece();
    }
  }, [status, currentPiece, spawnPiece]);

  // Auto drop
  useEffect(() => {
    if (status !== 'playing' || !currentPiece) return;
    const speed = SPEED_TABLE[Math.min(level, 10)] || 300;
    dropRef.current = setInterval(() => {
      moveDown();
    }, speed);
    return () => {
      if (dropRef.current) clearInterval(dropRef.current);
    };
  }, [status, currentPiece, level]);

  // Timer
  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsedTime(t => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const moveDown = useCallback(() => {
    setCurrentPiece(prev => {
      if (!prev) return prev;
      const b = boardRef.current;
      const moved = { ...prev, position: { ...prev.position, y: prev.position.y + 1 } };
      if (isValidPosition(b, moved)) {
        return moved;
      }
      setTimeout(() => lockPiece(), 0);
      return prev;
    });
  }, [lockPiece]);

  const moveLeft = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    setCurrentPiece(prev => {
      if (!prev) return prev;
      const moved = { ...prev, position: { ...prev.position, x: prev.position.x - 1 } };
      return isValidPosition(boardRef.current, moved) ? moved : prev;
    });
  }, []);

  const moveRight = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    setCurrentPiece(prev => {
      if (!prev) return prev;
      const moved = { ...prev, position: { ...prev.position, x: prev.position.x + 1 } };
      return isValidPosition(boardRef.current, moved) ? moved : prev;
    });
  }, []);

  const rotate = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    setCurrentPiece(prev => {
      if (!prev) return prev;
      const b = boardRef.current;
      const rotated = rotatePiece(prev);
      if (isValidPosition(b, rotated)) return rotated;
      for (const offset of [-1, 1, -2, 2]) {
        const kicked = { ...rotated, position: { ...rotated.position, x: rotated.position.x + offset } };
        if (isValidPosition(b, kicked)) return kicked;
      }
      return prev;
    });
  }, []);

  const hardDrop = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    setCurrentPiece(prev => {
      if (!prev) return prev;
      const b = boardRef.current;
      const ghost = getGhostPosition(b, prev);
      const dropDistance = ghost.position.y - prev.position.y;
      setScore(s => s + dropDistance * 2);
      setTimeout(() => lockPiece(), 0);
      return ghost;
    });
  }, [lockPiece]);

  const startGame = useCallback(() => {
    setBoard(createBoard());
    setCurrentPiece(null);
    setNextPiece(createPiece());
    setScore(0);
    setCombo(0);
    setLevel(1);
    setLinesCleared(0);
    setElapsedTime(0);
    setHighScore(getStoredHighScore());
    setStatus('playing');
  }, []);

  const togglePause = useCallback(() => {
    setStatus(s => s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s);
  }, []);

  const goHome = useCallback(() => {
    setStatus('ready');
  }, []);

  const ghostPiece = currentPiece ? getGhostPosition(board, currentPiece) : null;

  return {
    board,
    currentPiece,
    nextPiece,
    ghostPiece,
    score,
    highScore,
    combo,
    level,
    linesCleared,
    status,
    elapsedTime,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    startGame,
    togglePause,
    goHome,
    destroyedStats,
  };
}
