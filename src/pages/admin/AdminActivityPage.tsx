import { useState, useEffect } from 'react';
import { Activity, Building2, Users, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { getClubs, getAllPlayers } from '../../lib/userService';
import { getSeasons } from '../../lib/seasonsService';
import type { UserProfile } from '../../store/authStore';

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  color: string;
}

export function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [clubs, players, seasons] = await Promise.all([
          getClubs(),
          getAllPlayers(),
          getSeasons()
        ]);

        // Build activity feed from real data
        const feed: ActivityItem[] = [];

        // Club registrations
        clubs.forEach((club: UserProfile) => {
          if (club.createdAt) {
            feed.push({
              id: `club-${club.uid}`,
              icon: <Building2 className="w-4 h-4" />,
              title: `Club "${club.name}" registrado`,
              description: `Email: ${club.email} • @${club.username}`,
              time: club.createdAt,
              color: 'indigo'
            });
          }
        });

        // Player registrations
        players.forEach((player: UserProfile) => {
          if (player.createdAt) {
            feed.push({
              id: `player-${player.uid}`,
              icon: <Users className="w-4 h-4" />,
              title: `Ficha "${player.name}" creada`,
              description: `Tipo: ${player.accountType || 'Jugador'} • Estado: ${player.status || 'Pendiente'}`,
              time: player.createdAt,
              color: 'blue'
            });
          }
        });

        // Approved players
        players.filter(p => p.status === 'Activo' || p.status === 'Aprobada').forEach((player: UserProfile) => {
          feed.push({
            id: `approved-${player.uid}`,
            icon: <CheckCircle className="w-4 h-4" />,
            title: `Ficha de "${player.name}" aprobada`,
            description: `Ficha activa y lista para competir`,
            time: player.createdAt || new Date().toISOString(),
            color: 'emerald'
          });
        });

        // Seasons
        seasons.forEach(s => {
          feed.push({
            id: `season-${s.id}`,
            icon: <Clock className="w-4 h-4" />,
            title: `Temporada "${s.name}" creada`,
            description: `${s.startDate} — ${s.endDate} • Cuota: ${s.fee}€${s.isActive ? ' • ACTIVA' : ''}`,
            time: s.createdAt,
            color: 'brand'
          });
        });

        // Sort by time desc
        feed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setActivities(feed);
      } catch (error) {
        console.error("Error loading activity:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Hace unos minutos';
      if (diffHours < 24) return `Hace ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `Hace ${diffDays}d`;
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return iso; }
  };

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
    brand: { bg: 'bg-brand-100', text: 'text-brand-600', border: 'border-brand-100' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl"><Activity className="w-7 h-7" /></div>
          Registro de Actividad
        </h1>
        <p className="text-slate-500 mt-2 text-base">Historial de todas las acciones realizadas en la plataforma.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
        ) : activities.length === 0 ? (
          <div className="text-center p-12 text-slate-500">No hay actividad registrada aún.</div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100"></div>
            <div className="space-y-0">
              {activities.map((item) => {
                const c = colorMap[item.color] || colorMap.blue;
                return (
                  <div key={item.id} className="relative pl-12 pb-8 group">
                    <div className={`absolute left-2.5 top-1 w-5 h-5 rounded-full ${c.bg} ${c.text} flex items-center justify-center ring-4 ring-white`}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${c.bg} ${c.text} rounded-lg`}>{item.icon}</div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">{formatDate(item.time)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
