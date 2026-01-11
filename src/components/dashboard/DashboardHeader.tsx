// DashboardHeader component for displaying app header and settings menu
// Only comments are changed, no user-facing German content is modified
import { useState } from 'react';
import PushNotificationToggle from '../shared/PushNotificationToggle';

// Props for the DashboardHeader component
interface DashboardHeaderProps {
  familyName: string | null;
  profileName: string | null;
  userEmail: string | null | undefined;
  currentUserId: string;
  currentProfileId: string;
  familyId: string;
  onLogout?: () => void;
}

type ReadonlyDashboardHeaderProps = Readonly<DashboardHeaderProps>;

// Main DashboardHeader component definition
export default function DashboardHeader({
  profileName,
  userEmail,
  currentUserId,
  currentProfileId,
  familyId,
  onLogout,
}: ReadonlyDashboardHeaderProps) {
  // Render header with app name, welcome message, and settings menu
  return (
    <div className="flex items-center justify-between mb-6 bg-linear-to-r from-blue-800 via-blue-400 to-green-400 rounded-2xl shadow-lg p-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-4">👨‍👩‍👧 FamilyApp</h1>
        <div className="text-xs font-medium text-white/80 uppercase tracking-wider mb-1">
          Willkommen, {profileName}!
        </div>
      </div>

      <SettingsMenu
        profileName={profileName}
        userEmail={userEmail}
        currentUserId={currentUserId}
        currentProfileId={currentProfileId}
        familyId={familyId}
        onLogout={onLogout}
      />
    </div>
  );
}

// Props for the SettingsMenu component
interface SettingsMenuProps {
  profileName: string | null;
  userEmail: string | null | undefined;
  currentUserId: string;
  currentProfileId: string;
  familyId: string;
  onLogout?: () => void;
}

type ReadonlySettingsMenuProps = Readonly<SettingsMenuProps>;

// SettingsMenu component for user actions and notifications
function SettingsMenu({
  profileName,
  userEmail,
  currentUserId,
  currentProfileId: _currentProfileId,
  familyId,
  onLogout,
}: ReadonlySettingsMenuProps) {
  // State for menu open/close
  const [menuOpen, setMenuOpen] = useState(false);

  // Render settings menu with profile info, notification toggle, and logout button
  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((s) => !s)}
        aria-label="Open settings"
        className="p-2 rounded-lg hover:bg-white/20 transition-colors text-2xl"
        onMouseDown={(e) => e.preventDefault()}
      >
        ⚙️
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow p-3 text-sm z-10">
          <div className="font-medium mb-0">{profileName ?? 'Unknown'}</div>
          <div className="text-xs text-gray-500 mb-2">{userEmail ?? '—'}</div>

          <div className="border-t pt-2 mt-2 mb-2">
            <div className="px-2 py-1">
              <PushNotificationToggle userId={currentUserId} familyId={familyId} compact={true} />
            </div>
          </div>

          <div className="border-t pt-2">
            <button
              onClick={() => {
                setMenuOpen(false);
                onLogout?.();
              }}
              className="w-full text-left flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"
            >
              <span className="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
