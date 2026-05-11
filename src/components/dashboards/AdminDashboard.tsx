import { useState, useEffect } from 'react';
import { Building2, Users, CheckCircle, AlertCircle, TrendingUp, ArrowRight, Activity, Megaphone, Calendar } from 'lucide-react';
import { getClubs, getAllPlayers } from '../../lib/userService';
import type { UserProfile } from '../../store/authStore';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const [clubs, setClubs] = useState<UserProfile[]>([]);
  const [allPlayers, setAllPlayers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [clubsData, playersData] = await Promise.all([getClubs(), getAllPlayers()]);
        setClubs(clubsData);
        setAllPlayers(playersData);
      } catch (error) {
        console.error("Error loading admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activePlayersCount = allPlayers.filter(p => p.status === 'Activo' || p.status === 'Aprobada').length;
  const pendingPlayersCount = allPlayers.filter(p => p.status === 'Pendiente').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="relative h-56 rounded-3xl overflow-hidden shadow-md">
        <img src="/images/banners/soccer.png" alt="Admin Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end">
          <div className="p-8 w-full">
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-sm">Panel de Administración</h1>
            <p className="text-slate-200 mt-2 text-lg font-medium">Visión global de todos los clubes, jugadores y métricas del sistema.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Clubes" value={loading ? "-" : clubs.length.toString()} icon={<Building2 className="w-6 h-6 text-indigo-600" />} trend="Registrados en plataforma" />
        <StatCard title="Total Fichas" value={loading ? "-" : allPlayers.length.toString()} icon={<Users className="w-6 h-6 text-blue-600" />} trend="Jugadores y Tutores" />
        <StatCard title="Fichas Aprobadas" value={loading ? "-" : activePlayersCount.toString()} icon={<CheckCircle className="w-6 h-6 text-emerald-600" />} trend="Listos para competir" trendColor="text-emerald-600" />
        <StatCard title="Pendientes" value={loading ? "-" : pendingPlayersCount.toString()} icon={<AlertCircle className="w-6 h-6 text-amber-600" />} trend="Requieren acción de clubes" trendColor="text-amber-600" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink to="/clubs" icon={<Building2 className="w-6 h-6" />} title="Gestionar Clubes" desc="Crear, editar y eliminar clubes" color="indigo" />
        <QuickLink to="/players" icon={<Users className="w-6 h-6" />} title="Ver Jugadores" desc="Directorio global de fichas" color="blue" />
        <QuickLink to="/stats" icon={<TrendingUp className="w-6 h-6" />} title="Estadísticas" desc="Métricas y exportar datos" color="brand" />
        <QuickLink to="/activity" icon={<Activity className="w-6 h-6" />} title="Actividad" desc="Registro de acciones" color="slate" />
        <QuickLink to="/announcements" icon={<Megaphone className="w-6 h-6" />} title="Comunicados" desc="Avisos globales" color="amber" />
        <QuickLink to="/seasons" icon={<Calendar className="w-6 h-6" />} title="Temporadas" desc="Gestionar temporadas y cuotas" color="brand" />
      </div>

      {/* Recent Clubs */}
      {!loading && clubs.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Últimos Clubes Registrados</h2>
            <Link to="/clubs" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">Ver todos <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="space-y-2">
            {clubs.slice(0, 5).map(club => (
              <div key={club.uid} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-sm">
                    {club.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{club.name}</p>
                    <p className="text-xs text-slate-500">@{club.username}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{club.createdAt ? new Date(club.createdAt).toLocaleDateString() : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendColor = "text-slate-500" }: { title: string, value: string, icon: React.ReactNode, trend: string, trendColor?: string }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-125 transition-transform duration-500">{icon}</div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      </div>
      <div className="relative z-10"><span className="text-4xl font-black text-slate-900 tracking-tight">{value}</span></div>
      <p className={`text-xs mt-3 font-semibold ${trendColor} relative z-10`}>{trend}</p>
    </div>
  );
}

function QuickLink({ to, icon, title, desc, color }: { to: string, icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <Link to={to} className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-4 group`}>
      <div className={`p-3 bg-${color}-100 text-${color}-600 rounded-xl group-hover:scale-110 transition-transform`}>{icon}</div>
      <div>
        <p className="font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
    </Link>
  );
}
