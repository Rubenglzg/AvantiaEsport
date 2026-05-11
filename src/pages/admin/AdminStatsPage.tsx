import { useState, useEffect } from 'react';
import { BarChart3, Database, Shield, Loader2, Building2, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { getClubs, getAllPlayers } from '../../lib/userService';
import type { UserProfile } from '../../store/authStore';

export function AdminStatsPage() {
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
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activePlayersCount = allPlayers.filter(p => p.status === 'Activo' || p.status === 'Aprobada').length;
  const pendingPlayersCount = allPlayers.filter(p => p.status === 'Pendiente').length;

  const exportToCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Tipo,Nombre,Email,Username,Club Perteneciente,Categoría,Estado\n";
      clubs.forEach(c => {
        csvContent += `Club,${c.name},${c.email},${c.username},-,-,${c.status || 'Activo'}\n`;
      });
      allPlayers.forEach(p => {
        const clubName = clubs.find(c => c.uid === p.clubId)?.name || 'Desconocido';
        csvContent += `Jugador,${p.name},${p.email},${p.username},${clubName},${p.category || '-'},${p.status || 'Pendiente'}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `avantia_database_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Error al exportar los datos.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-24">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-brand-100 text-brand-600 rounded-xl">
            <BarChart3 className="w-7 h-7" />
          </div>
          Estadísticas y Métricas
        </h1>
        <p className="text-slate-500 mt-2 text-base">Visión global del estado de la plataforma y herramientas de exportación.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Clubes" value={clubs.length.toString()} icon={<Building2 className="w-6 h-6 text-indigo-600" />} trend="Registrados en plataforma" />
        <StatCard title="Total Fichas" value={allPlayers.length.toString()} icon={<Users className="w-6 h-6 text-blue-600" />} trend="Jugadores y Tutores" />
        <StatCard title="Fichas Aprobadas" value={activePlayersCount.toString()} icon={<CheckCircle className="w-6 h-6 text-emerald-600" />} trend="Listos para competir" trendColor="text-emerald-600" />
        <StatCard title="Pendientes" value={pendingPlayersCount.toString()} icon={<AlertCircle className="w-6 h-6 text-amber-600" />} trend="Requieren acción de clubes" trendColor="text-amber-600" />
      </div>

      {/* Platform Health & Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
            <Database className="w-48 h-48" />
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-8">Salud de la Plataforma</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-slate-300">Tasa de Aprobación Global</span>
                  <span className="text-white">{allPlayers.length > 0 ? Math.round((activePlayersCount / allPlayers.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-brand-400 h-2 rounded-full" style={{ width: `${allPlayers.length > 0 ? (activePlayersCount / allPlayers.length) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-slate-300">Uso de Almacenamiento (Docs)</span>
                  <span className="text-white">Estable</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-slate-300">Clubes con Jugadores Activos</span>
                  <span className="text-white">{clubs.filter(c => allPlayers.some(p => p.clubId === c.uid)).length} / {clubs.length}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${clubs.length > 0 ? (clubs.filter(c => allPlayers.some(p => p.clubId === c.uid)).length / clubs.length) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Herramientas Globales</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Configuración de Seguridad</p>
                <p className="text-xs text-slate-500">Gestionar permisos y accesos globales</p>
              </div>
            </button>
            <button onClick={exportToCSV} className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Exportar Base de Datos</p>
                <p className="text-xs text-slate-500">Descargar CSV de todos los clubes y jugadores</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendColor = "text-slate-500" }: { title: string, value: string, icon: React.ReactNode, trend: string, trendColor?: string }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
        {icon}
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className="p-3 bg-slate-50 rounded-2xl">
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <span className="text-4xl font-black text-slate-900 tracking-tight">{value}</span>
      </div>
      <p className={`text-xs mt-3 font-semibold ${trendColor} relative z-10`}>{trend}</p>
    </div>
  );
}
