import { useAuthStore } from '../store/authStore';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { ClubDashboard } from '../components/dashboards/ClubDashboard';
import { PlayerDashboard } from '../components/dashboards/PlayerDashboard';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const role = profile?.role || 'player';

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'club':
      return <ClubDashboard />;
    case 'player':
    default:
      return <PlayerDashboard />;
  }
}
