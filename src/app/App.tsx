import { useEffect } from 'react';
import { GamePage } from '@/pages/game';
import { lockScroll } from './lib/lockScroll';
import { useViewportHeight } from './model/useViewportHeight';

export default function App() {
  useViewportHeight();
  useEffect(() => lockScroll(), []);
  return <GamePage />;
}
