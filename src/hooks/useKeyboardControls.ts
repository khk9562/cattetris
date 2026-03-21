import { useEffect } from 'react';

// Type representing the shape of the game returned by useGame
interface GameActions {
  status: string;
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  rotate: () => void;
  hardDrop: () => void;
}

export function useKeyboardControls(game: GameActions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (game.status !== 'playing') return;

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          game.moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          game.moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          game.moveDown();
          break;
        case 'Space':
        case 'ArrowUp':
          e.preventDefault();
          game.rotate();
          break;
        case 'Enter':
          e.preventDefault();
          game.hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.status, game.moveLeft, game.moveRight, game.moveDown, game.rotate, game.hardDrop]);
}
