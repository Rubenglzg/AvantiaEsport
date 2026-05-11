import { useState, useEffect } from 'react';
import { Shield, Plus, X, Loader2, Trash2, Save } from 'lucide-react';
import { getPlayersByClub } from '../../lib/userService';
import { getTeamsByClub, createTeam, deleteTeam, assignPlayerToTeam, removePlayerFromTeam, type Team } from '../../lib/teamsService';
import { useAuthStore, type UserProfile } from '../../store/authStore';

export function ClubTeamsPage() {
  const profile = useAuthStore((state) => state.profile);
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const loadData = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const [playersData, teamsData] = await Promise.all([
        getPlayersByClub(profile.uid),
        getTeamsByClub(profile.uid)
      ]);
      setPlayers(playersData);
      setTeams(teamsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [profile?.uid]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setFormLoading(true);
    try {
      await createTeam(profile.uid, newTeamName);
      setShowTeamModal(false);
      setNewTeamName('');
      await loadData();
    } catch (error) {
      console.error("Error creating team:", error);
      alert("Error al crear equipo.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm("¿Seguro que quieres borrar este equipo?")) return;
    try {
      await deleteTeam(teamId);
      if (selectedTeam?.id === teamId) setSelectedTeam(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  const handleTogglePlayerInTeam = async (teamId: string, playerId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await removePlayerFromTeam(teamId, playerId);
      } else {
        await assignPlayerToTeam(teamId, playerId);
      }
      await loadData();
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(prev => {
          if (!prev) return prev;
          if (isAssigned) return { ...prev, playerIds: prev.playerIds.filter(id => id !== playerId) };
          return { ...prev, playerIds: [...prev.playerIds, playerId] };
        });
      }
    } catch (error) {
      console.error("Error assigning player:", error);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-100 text-brand-600 rounded-xl">
              <Shield className="w-7 h-7" />
            </div>
            Gestor de Equipos
          </h1>
          <p className="text-slate-500 mt-2 text-base">Crea equipos y asigna jugadores por categorías.</p>
        </div>
        <button
          onClick={() => setShowTeamModal(true)}
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/30"
        >
          <Plus className="w-5 h-5" /> Crear Equipo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <div className="lg:col-span-1 space-y-4">
            {teams.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-500">No has creado ningún equipo.</p>
              </div>
            ) : (
              teams.map(team => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTeam?.id === team.id
                      ? 'border-brand-500 bg-brand-50 shadow-md ring-2 ring-brand-500/20'
                      : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 text-lg">{team.name}</h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id!); }}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{team.playerIds.length} jugadores</p>
                </div>
              ))
            )}
          </div>

          {/* Player Assignment */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-900">Plantilla: {selectedTeam.name}</h3>
                  <p className="text-sm text-slate-500">Selecciona o desmarca los jugadores para asignarlos a este equipo.</p>
                </div>
                <div className="p-6">
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {players.map(player => {
                      const isAssigned = selectedTeam.playerIds.includes(player.uid!);
                      return (
                        <div key={player.uid} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                              {player.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{player.name}</p>
                              <p className="text-xs text-slate-500 capitalize">{player.accountType}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleTogglePlayerInTeam(selectedTeam.id!, player.uid!, isAssigned)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isAssigned
                                ? 'bg-brand-600 text-white border border-transparent shadow-sm'
                                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {isAssigned ? 'Asignado' : 'Añadir'}
                          </button>
                        </div>
                      );
                    })}
                    {players.length === 0 && (
                      <p className="text-center text-slate-500 py-4">No hay jugadores registrados.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white rounded-3xl border border-slate-200 border-dashed flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <Shield className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-lg font-semibold">Selecciona un equipo</p>
                <p className="text-sm">Haz clic en un equipo de la lista para ver y editar su plantilla.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Crear Equipo</h3>
              <button onClick={() => setShowTeamModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del Equipo</label>
                <input type="text" required value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="Ej. Cadete A" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={formLoading} className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-brand-500/30 disabled:opacity-50">
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4"/> Guardar Equipo</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
