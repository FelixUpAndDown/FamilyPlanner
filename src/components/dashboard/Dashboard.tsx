// Dashboard component for displaying main app overview and navigation tiles
// Only comments are changed, no user-facing German content is modified
import DashboardHeader from './DashboardHeader';
import DashboardTiles, { type DashboardTile } from './DashboardTiles';
import { useDashboardData } from './useDashboardData';
import { PullToRefresh } from '../shared/PullToRefresh';

// Props for the Dashboard component
interface DashboardProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
  users: { id: string; name: string }[];
  onOpenTodos: () => void;
  onOpenNotes?: () => void;
  onOpenShopping?: () => void;
  onOpenRecipes?: () => void;
  onOpenContacts?: () => void;
  onOpenCalendar?: () => void;
  userEmail?: string | null;
  onLogout?: () => void;
}

type ReadonlyDashboardProps = Readonly<DashboardProps>;

// Main Dashboard component definition
export default function Dashboard({
  familyId,
  currentUserId,
  currentProfileId,
  users,
  onOpenTodos,
  onOpenNotes,
  onOpenShopping,
  onOpenRecipes,
  onOpenContacts,
  onOpenCalendar,
  userEmail,
  onLogout,
}: ReadonlyDashboardProps) {
  // Get dashboard data (counts, family name, loading state, etc.)
  const { openCount, noteCount, todayEventsCount, loading, familyName, refetch } =
    useDashboardData(familyId);
  // Get current profile name from users list
  const profileName = users.find((u) => u.id === currentProfileId)?.name ?? null;

  // Define dashboard navigation tiles
  // Extract subtitle values to avoid nested ternaries and negated conditions
  const todosSubtitle = (() => {
    if (loading) return 'Lädt…';
    if (openCount != null) return `${openCount} offen`;
    return '—';
  })();
  const calendarSubtitle = (() => {
    if (loading) return 'Lädt…';
    if (todayEventsCount != null) return `${todayEventsCount} heute`;
    return '—';
  })();
  const notesSubtitle = (() => {
    if (loading) return 'Lädt…';
    if (noteCount != null) return `${noteCount} Notizen`;
    return '—';
  })();

  const tiles: DashboardTile[] = [
    {
      key: 'todos',
      emoji: '📝',
      label: 'Todos',
      subtitle: todosSubtitle,
      onClick: onOpenTodos,
    },
    {
      key: 'calendar',
      emoji: '📅',
      label: 'Kalender',
      subtitle: calendarSubtitle,
      onClick: onOpenCalendar,
    },
    {
      key: 'groceries',
      emoji: '🛒',
      label: 'Einkaufsliste',
      subtitle: '',
      onClick: onOpenShopping,
    },
    {
      key: 'recipes',
      emoji: '🍳',
      label: 'Rezepte',
      subtitle: '',
      onClick: onOpenRecipes,
    },
    {
      key: 'notes',
      emoji: '🗒️',
      label: 'Notizen',
      subtitle: notesSubtitle,
      onClick: onOpenNotes,
    },
    {
      key: 'contacts',
      emoji: '👥',
      label: 'Kontakte',
      subtitle: '',
      onClick: onOpenContacts,
    },
  ];

  // Render dashboard header and navigation tiles
  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative">
        <DashboardHeader
          familyName={familyName}
          profileName={profileName}
          userEmail={userEmail}
          currentUserId={currentUserId}
          currentProfileId={currentProfileId}
          familyId={familyId}
          onLogout={onLogout}
        />
        <DashboardTiles tiles={tiles} />
      </div>
    </PullToRefresh>
  );
}
