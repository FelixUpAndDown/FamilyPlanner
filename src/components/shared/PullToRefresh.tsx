import { usePullToRefresh } from '../../hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => void | Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const { pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh,
    disabled,
  });

  return (
    <div className="relative">
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          opacity: progress,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <div
            className={`text-2xl transition-transform duration-300 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: `rotate(${progress * 360}deg)`,
            }}
          >
            🔄
          </div>
          {isRefreshing && (
            <span className="text-xs text-gray-600 dark:text-gray-400">Aktualisieren...</span>
          )}
          {!isRefreshing && progress > 0.8 && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Loslassen zum Aktualisieren
            </span>
          )}
        </div>
      </div>

      {/* Content with offset when pulling */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
