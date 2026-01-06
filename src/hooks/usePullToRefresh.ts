import { useEffect, useState, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  threshold?: number;
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || startY === 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [disabled, isRefreshing, startY, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    if (disabled) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled]);

  const progress = Math.min(pullDistance / threshold, 1);

  return {
    pullDistance,
    isRefreshing,
    progress,
  };
}
