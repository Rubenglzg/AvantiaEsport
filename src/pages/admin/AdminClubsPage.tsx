import { useState, useEffect } from 'react';
import { Building2, Plus, X, Loader2, Edit, Trash2, Lock, Unlock, Shield } from 'lucide-react';
import { getClubs, createClubUser, deleteUserAccount, updateUserAuth, updateUserProfile } from '../../lib/userService';
import type { UserProfile } from '../../store/authStore';

export function AdminClubsPage() {
  const [clubs, setClubs] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingClub, setEditingClub] = useState<UserProfile | null>(null);
  const [isAuthUnlocked, setIsAuthUnlocked] = useState(false);

  // Form state
  const [newClubName, setNewClubName] = useState('');
  const [newClubUsername, setNewClubUsername] = useState('');
  const [newClubEmail, setNewClubEmail] = useState('');
  const [newClubPassword, setNewClubPassword] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const clubsData = await getClubs();
      setClubs(clubsData);
    } catch (error) {
      console.error("Error loading clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenCreateModal = () => {
    setEditingClub(null);
    setNewClubName(''); setNewClubUsername(''); setNewClubEmail(''); setNewClubPassword('');
    setIsAuthUnlocked(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (club: UserProfile) => {
    setEditingClub(club);
    setNewClubName(club.name || ''); setNewClubUsername(club.username || '');
    setNewClubEmail(club.email || ''); setNewClubPassword('');
    setIsAuthUnlocked(false);
    setIsModalOpen(true);
  };

  const handleDeleteClub = async (uid: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar completamente este club?')) return;
    try {
      setLoading(true);
      await deleteUserAccount(uid);
      await loadData();
    } catch (error: any) {
      console.error("Error deleting club:", error);
      alert("Error al eliminar el club: " + error.message);
      setLoading(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingClub) {
        await updateUserProfile(editingClub.uid!, { name: newClubName, username: newClubUsername });
        if (isAuthUnlocked && (newClubEmail !== editingClub.email || newClubPassword.length > 0)) {
          await updateUserAuth(editingClub.uid!, newClubEmail, newClubPassword || undefined);
        }
      } else {
        await createClubUser(newClubEmail, newClubPassword, newClubName, newClubUsername);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Error saving club:", error);
      alert("Error al guardar el club: " + error.message);
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
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
              <Building2 className="w-7 h-7" />
            </div>
            Directorio de Clubes
          </h1>
          <p className="text-slate-500 mt-2 text-base">Gestiona todos los clubes registrados en la plataforma.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Registrar Nuevo Club
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-slate-700" /> Clubes Registrados
          </h2>
          <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{clubs.length} clubes</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
          ) : clubs.length === 0 ? (
            <div className="text-center p-12">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No hay clubes</h3>
              <p className="text-slate-500">Registra el primer club para empezar a operar.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Club / Entidad</th>
                  <th className="px-6 py-4 font-semibold">Usuario</th>
                  <th className="px-6 py-4 font-semibold">Email de Contacto</th>
                  <th className="px-6 py-4 font-semibold">Fecha de Alta</th>
                  <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clubs.map((club) => (
                  <tr key={club.uid} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-sm">
                          {club.name?.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-bold text-slate-900">{club.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">@{club.username || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{club.email}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {club.createdAt ? new Date(club.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEditModal(club)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteClub(club.uid!)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              <h3 className="text-xl font-bold text-slate-900">
                {editingClub ? 'Editar Club' : 'Registrar Nuevo Club'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Datos de la Entidad</h4>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre Oficial del Club</label>
                  <input type="text" required value={newClubName} onChange={(e) => setNewClubName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Ej. FC Barcelona Esports" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Identificador Único (Username)</label>
                  <input type="text" required value={newClubUsername} onChange={(e) => setNewClubUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="ej. fcb_esports" />
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Credenciales de Acceso</h4>
                  {editingClub && (
                    <button type="button" onClick={() => setIsAuthUnlocked(!isAuthUnlocked)} className={`text-xs flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg transition-colors ${isAuthUnlocked ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                      {isAuthUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {isAuthUnlocked ? 'Bloquear' : 'Desbloquear para editar'}
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo de Administración</label>
                    <input type="email" required disabled={!isAuthUnlocked} value={newClubEmail} onChange={(e) => setNewClubEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" placeholder="admin@club.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      {editingClub ? 'Nueva Contraseña (opcional)' : 'Contraseña Inicial Segura'}
                    </label>
                    <input type="password" required={!editingClub} disabled={!isAuthUnlocked} minLength={6} value={newClubPassword} onChange={(e) => setNewClubPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Mínimo 6 caracteres" />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-50">
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingClub ? 'Guardar Cambios' : 'Registrar Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
