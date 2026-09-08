/**
 * 페이지 스크롤/바운스 차단.
 * [data-scroll] 안에서 실제로 더 스크롤할 수 있을 때만 터치/휠을 통과시키고, 그 외에는 기본 동작을 막는다.
 * iOS Safari의 고무줄 스크롤과 툴바 접힘 제스처가 여기서 걸러진다.
 */
export function lockScroll(): () => void {
  let startY = 0;

  const scrollableAncestor = (target: EventTarget | null): HTMLElement | null => {
    let el = target instanceof Element ? target : null;
    while (el) {
      if (el instanceof HTMLElement && el.hasAttribute('data-scroll') && el.scrollHeight > el.clientHeight + 1) return el;
      el = el.parentElement;
    }
    return null;
  };

  /** 해당 방향으로 더 스크롤할 여지가 있는가 (delta > 0: 아래로) */
  const canScroll = (el: HTMLElement, delta: number) => {
    if (delta > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    if (delta < 0) return el.scrollTop > 0;
    return true;
  };

  const onTouchStart = (e: TouchEvent) => {
    startY = e.touches[0]?.clientY ?? 0;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1) { e.preventDefault(); return; }
    const y = e.touches[0]?.clientY ?? 0;
    const delta = startY - y;
    const el = scrollableAncestor(e.target);
    if (el && canScroll(el, delta)) return;
    if (e.cancelable) e.preventDefault();
  };

  const onWheel = (e: WheelEvent) => {
    const el = scrollableAncestor(e.target);
    if (el && canScroll(el, e.deltaY)) return;
    if (e.cancelable) e.preventDefault();
  };

  const onScroll = () => {
    if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
    const se = document.scrollingElement;
    if (se && (se.scrollTop || se.scrollLeft)) { se.scrollTop = 0; se.scrollLeft = 0; }
  };

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onScroll);
  };
}
