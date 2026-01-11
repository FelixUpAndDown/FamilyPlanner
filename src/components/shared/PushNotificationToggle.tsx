// Component for toggling daily push notifications for a user and family.
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface PushNotificationToggleProps {
  userId: string;
  familyId: string;
  compact?: boolean;
}
type ReadonlyPushNotificationToggleProps = Readonly<PushNotificationToggleProps>;

export default function PushNotificationToggle({
  userId,
  familyId,
  compact = false,
}: ReadonlyPushNotificationToggleProps) {
  // Destructure push notification state and handlers from custom hook
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe, loading, error } =
    usePushNotifications(userId, familyId);

  // If push notifications are not supported, do not render anything
  if (!isSupported) {
    return null;
  }

  // Handler for toggling subscription status
  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  // Render compact version if requested
  if (compact) {
    return (
      <div className="w-full">
        <button
          onClick={handleToggle}
          disabled={loading || permission === 'denied'}
          className="w-full text-left flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <span>Tägl. Erinnerung</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Show checkmark if permission is granted and subscribed */}
            {permission === 'granted' && isSubscribed && (
              <span className="text-xs text-green-600">✓</span>
            )}
            {/* Toggle switch visual indicator */}
            <div
              className={`w-9 h-5 rounded-full transition-colors ${
                isSubscribed ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isSubscribed ? 'translate-x-4' : 'translate-x-0.5'
                } mt-0.5`}
              ></div>
            </div>
          </div>
        </button>
        {/* Show error message if present */}
        {error && <div className="mt-1 px-2 text-xs text-red-600">{error}</div>}
      </div>
    );
  }

  // Render full version with notification details and controls
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <h3 className="font-semibold">Tägl. Erinnerung</h3>
        </div>
      </div>

      {/* Description of notification feature */}
      <p className="text-sm text-gray-600 mb-3">
        Get a morning notification with your events, birthdays, todos, and shopping items for the
        day.
      </p>

      {/* Show error message if present */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm">
          {/* Show status based on permission and subscription */}
          {permission === 'denied' && (
            <span className="text-red-600">Blocked. Enable in browser settings.</span>
          )}
          {permission === 'default' && <span className="text-gray-600">Not activated</span>}
          {permission === 'granted' && isSubscribed && (
            <span className="text-green-600">✓ Active</span>
          )}
        </div>

        {/* Button to activate/deactivate notifications */}
        {/* Extracted button label logic to avoid nested ternary */}
        {(() => {
          let buttonLabel = '';
          if (loading) {
            buttonLabel = '...';
          } else if (isSubscribed) {
            buttonLabel = 'Deactivate';
          } else if (permission === 'denied') {
            buttonLabel = 'Blocked';
          } else {
            buttonLabel = 'Activate';
          }
          return (
            <button
              onClick={handleToggle}
              disabled={loading || permission === 'denied'}
              className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                isSubscribed
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {buttonLabel}
            </button>
          );
        })()}
      </div>
    </div>
  );
}
