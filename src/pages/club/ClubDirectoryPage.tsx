import { useState, useEffect } from 'react';
import { Users, Plus, X, Loader2, Edit, Trash2, Lock, Unlock, AlertCircle, CheckCircle } from 'lucide-react';
import { getPlayersByClub, createPlayerUser, deleteUserAccount, updateUserAuth, updateUserProfile } from '../../lib/userService';
import { getTeamsByClub, assignPlayerToTeam, removePlayerFromTeam, type Team } from '../../lib/teamsService';
import { useAuthStore, type UserProfile } from '../../store/authStore';

export function ClubDirectoryPage() {
  const profile = useAuthStore((state) => state.profile);
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<UserProfile | null>(null);
  const [isAuthUnlocked, setIsAuthUnlocked] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newTeamId, setNewTeamId] = useState('');
  const [newAccountType, setNewAccountType] = useState<'jugador' | 'tutor'>('jugador');
  const [newIsAdult, setNewIsAdult] = useState(true);
  const [newStatus, setNewStatus] = useState('Pendiente');

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

  const pendingPlayers = players.filter(p => p.status === 'Pendiente');
  const activePlayers = players.filter(p => p.status === 'Activo' || p.status === 'Aprobada');

  const handleOpenCreateModal = () => {
    setEditingPlayer(null);
    setNewName(''); setNewUsername(''); setNewEmail(''); setNewPassword('');
    setNewTeamId(''); setNewAccountType('jugador'); setNewIsAdult(true); setNewStatus('Pendiente');
    setIsAuthUnlocked(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (player: UserProfile) => {
    setEditingPlayer(player);
    setNewName(player.name || ''); setNewUsername(player.username || '');
    setNewEmail(player.email || ''); setNewPassword('');
    setNewTeamId(player.teamId || ''); setNewAccountType(player.accountType || 'jugador');
    setNewIsAdult(player.isAdult ?? true); setNewStatus(player.status || 'Pendiente');
    setIsAuthUnlocked(false);
    setIsModalOpen(true);
  };

  const handleDeletePlayer = async (uid: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar a este usuario?')) return;
    try {
      setLoading(true);
      await deleteUserAccount(uid);
      await loadData();
    } catch (error: any) {
      console.error("Error deleting player:", error);
      alert("Error al eliminar: " + error.message);
      setLoading(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setFormLoading(true);
    try {
      if (editingPlayer) {
        await updateUserProfile(editingPlayer.uid!, {
          name: newName, username: newUsername, teamId: newTeamId,
          accountType: newAccountType, isAdult: newAccountType === 'tutor' ? true : newIsAdult, status: newStatus
        });
        if (editingPlayer.teamId !== newTeamId) {
          if (editingPlayer.teamId) await removePlayerFromTeam(editingPlayer.teamId, editingPlayer.uid!);
          if (newTeamId) await assignPlayerToTeam(newTeamId, editingPlayer.uid!);
        }
        if (isAuthUnlocked && (newEmail !== editingPlayer.email || newPassword.length > 0)) {
          await updateUserAuth(editingPlayer.uid!, newEmail, newPassword || undefined);
        }
      } else {
        const newPlayer = await createPlayerUser({
          email: newEmail, password: newPassword, name: newName, username: newUsername,
          clubId: profile.uid, teamId: newTeamId, accountType: newAccountType,
          isAdult: newAccountType === 'tutor' ? true : newIsAdult
        });
        if (newTeamId && newPlayer.uid) await assignPlayerToTeam(newTeamId, newPlayer.uid);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Error saving account:", error);
      alert("Error al guardar la cuenta: " + error.message);
    } finally {
      setFormLoading(false);
    }
  };

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
          <p className="text-slate-500 mt-2 text-base">Gestiona las fichas de todos los jugadores y tutores del club.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/30 hover:-translate-y-0.5">
          <Plus className="w-5 h-5" />
          Añadir Jugador / Tutor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
          <div><p className="text-2xl font-black text-slate-900">{players.length}</p><p className="text-xs text-slate-500 font-semibold">Total Fichas</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
          <div><p className="text-2xl font-black text-slate-900">{pendingPlayers.length}</p><p className="text-xs text-slate-500 font-semibold">Pendientes</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
          <div><p className="text-2xl font-black text-slate-900">{activePlayers.length}</p><p className="text-xs text-slate-500 font-semibold">Aprobadas</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
          ) : players.length === 0 ? (
            <div className="text-center p-12">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4"><Users className="w-10 h-10" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Aún no hay fichas</h3>
              <p className="text-slate-500">Añade a tu primer jugador o tutor pulsando el botón superior.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Jugador / Contacto</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">Equipo</th>
                  <th className="px-6 py-4 font-semibold">Estado de Ficha</th>
                  <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {players.map((row) => (
                  <tr key={row.uid} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">{row.name?.charAt(0).toUpperCase()}</div>
                        <div><p className="font-bold text-slate-900">{row.name}</p><p className="text-xs text-slate-500">@{row.username} • {row.email}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">{row.accountType || 'Jugador'}</span></td>
                    <td className="px-6 py-4 font-medium text-slate-700">{teams.find(t => t.id === row.teamId)?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        row.status === 'Aprobada' || row.status === 'Activo' ? 'text-emerald-700 bg-emerald-100 border border-emerald-200' :
                        row.status === 'Pendiente' ? 'text-amber-700 bg-amber-100 border border-amber-200' :
                        'text-brand-700 bg-brand-100 border border-brand-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Aprobada' || row.status === 'Activo' ? 'bg-emerald-500' : row.status === 'Pendiente' ? 'bg-amber-500' : 'bg-brand-500'}`}></span>
                        {row.status || 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEditModal(row)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeletePlayer(row.uid!)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-900">{editingPlayer ? 'Editar Ficha' : 'Registrar Nueva Ficha'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Datos Personales</h4>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre Completo</label>
                  <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="Nombre del jugador o tutor" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre de Usuario</label>
                  <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="ej. carlos_perez10" />
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Credenciales de Acceso</h4>
                  {editingPlayer && (
                    <button type="button" onClick={() => setIsAuthUnlocked(!isAuthUnlocked)} className={`text-xs flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg transition-colors ${isAuthUnlocked ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                      {isAuthUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {isAuthUnlocked ? 'Bloquear' : 'Desbloquear'}
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
                  <input type="email" required disabled={!isAuthUnlocked} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" placeholder="correo@ejemplo.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{editingPlayer ? 'Nueva Contraseña (opcional)' : 'Contraseña Inicial'}</label>
                  <input type="password" required={!editingPlayer} disabled={!isAuthUnlocked} minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Mínimo 6 caracteres" />
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 space-y-4">
                <h4 className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Detalles Deportivos</h4>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Cuenta</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['jugador', 'tutor'] as const).map(type => (
                      <label key={type} className={`border-2 rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all ${newAccountType === type ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <input type="radio" name="accountType" className="sr-only" checked={newAccountType === type} onChange={() => setNewAccountType(type)} />
                        <span className="text-sm font-bold capitalize">{type === 'tutor' ? 'Padre / Tutor' : 'Jugador'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {newAccountType === 'jugador' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Edad del Jugador</label>
                    <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 text-sm">
                        <input type="radio" name="isAdult" checked={newIsAdult} onChange={() => setNewIsAdult(true)} className="w-4 h-4 text-brand-600" /> Mayor de Edad
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 text-sm">
                        <input type="radio" name="isAdult" checked={!newIsAdult} onChange={() => setNewIsAdult(false)} className="w-4 h-4 text-brand-600" /> Menor de Edad
                      </label>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Equipo</label>
                  <select value={newTeamId} onChange={(e) => setNewTeamId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-medium text-slate-700">
                    <option value="">Ninguno / Sin Equipo</option>
                    {teams.map(team => (<option key={team.id} value={team.id}>{team.name}</option>))}
                  </select>
                </div>
                {editingPlayer && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado de la Ficha</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-medium text-slate-700">
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Activo">Activo / Aprobada</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-brand-500/30 disabled:opacity-50">
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingPlayer ? 'Guardar Cambios' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
