import { useEffect, useRef } from 'react';

export default function useSwipe({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 30 }) {
  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) >= threshold) {
          if (deltaX > 0 && onSwipeRight) onSwipeRight();
          if (deltaX < 0 && onSwipeLeft) onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) >= threshold) {
          if (deltaY > 0 && onSwipeDown) onSwipeDown();
          if (deltaY < 0 && onSwipeUp) onSwipeUp();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);
}
