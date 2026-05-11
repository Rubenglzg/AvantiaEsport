import { useState, useEffect } from 'react';
import { Users, Building2, Loader2 } from 'lucide-react';
import { getClubs, getAllPlayers } from '../../lib/userService';
import type { UserProfile } from '../../store/authStore';

export function AdminPlayersPage() {
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
        console.error("Error loading players:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
              <Users className="w-7 h-7" />
            </div>
            Directorio de Jugadores
          </h1>
          <p className="text-slate-500 mt-2 text-base">Vista global de todos los jugadores registrados en la plataforma.</p>
        </div>
        <span className="text-sm font-semibold text-brand-600 bg-brand-50 px-4 py-2 rounded-full border border-brand-100">Vista de Solo Lectura</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" /> Todos los Jugadores
          </h2>
          <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{allPlayers.length} fichas</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
          ) : allPlayers.length === 0 ? (
            <div className="text-center p-12">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Sin jugadores</h3>
              <p className="text-slate-500">Aún no hay jugadores registrados en ningún club.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Jugador / Contacto</th>
                  <th className="px-6 py-4 font-semibold">Club Perteneciente</th>
                  <th className="px-6 py-4 font-semibold">Categoría / Tipo</th>
                  <th className="px-6 py-4 font-semibold">Estado Global</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allPlayers.map((player) => {
                  const clubObj = clubs.find(c => c.uid === player.clubId);
                  return (
                    <tr key={player.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{player.name}</span>
                          <span className="text-xs text-slate-500">@{player.username} • {player.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                          <Building2 className="w-3 h-3" /> {clubObj?.name || 'Club Desconocido'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">{player.category || '-'}</span>
                          <span className="text-xs text-slate-500 capitalize">{player.accountType || 'Jugador'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          player.status === 'Aprobada' || player.status === 'Activo' ? 'text-emerald-700 bg-emerald-100 border border-emerald-200' :
                          player.status === 'Pendiente' ? 'text-amber-700 bg-amber-100 border border-amber-200' :
                          'text-brand-700 bg-brand-100 border border-brand-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            player.status === 'Aprobada' || player.status === 'Activo' ? 'bg-emerald-500' :
                            player.status === 'Pendiente' ? 'bg-amber-500' : 'bg-brand-500'
                          }`}></span>
                          {player.status || 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
