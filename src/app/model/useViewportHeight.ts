import { useEffect } from 'react';

/**
 * 실제 보이는 뷰포트 높이를 --app-height(px)로 고정한다.
 * 주소창/툴바가 오르내리는 모바일 브라우저에서 dvh보다 즉각적이고, 미지원 브라우저에서도 동작한다.
 */
export function useViewportHeight() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let last = -1;
    const apply = () => {
      raf = 0;
      const h = Math.round(window.visualViewport?.height ?? window.innerHeight);
      if (h > 0 && h !== last) {
        last = h;
        root.style.setProperty('--app-height', `${h}px`);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('scroll', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('scroll', schedule);
    };
  }, []);
}
