import { useState, useEffect } from 'react';
import { Megaphone, Plus, X, Loader2, Trash2, Pin } from 'lucide-react';
import { createAnnouncement, getGlobalAnnouncements, deleteAnnouncement, type Announcement } from '../../lib/announcementsService';
import { useAuthStore } from '../../store/authStore';

export function AdminAnnouncementsPage() {
  const profile = useAuthStore((state) => state.profile);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getGlobalAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setFormLoading(true);
    try {
      await createAnnouncement({
        title, body, pinned,
        authorId: profile.uid,
        authorName: profile.name || 'Administrador',
        scope: 'global',
        createdAt: new Date().toISOString()
      });
      setShowModal(false);
      setTitle(''); setBody(''); setPinned(false);
      await loadData();
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert("Error al crear comunicado.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este comunicado?')) return;
    try {
      await deleteAnnouncement(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl"><Megaphone className="w-7 h-7" /></div>
            Comunicados Globales
          </h1>
          <p className="text-slate-500 mt-2 text-base">Publica avisos visibles para todos los clubes y jugadores.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-amber-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-amber-500 transition-all shadow-lg shadow-amber-500/30">
          <Plus className="w-5 h-5" /> Nuevo Comunicado
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
        ) : announcements.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900">Sin comunicados</h3>
            <p className="text-sm text-slate-500 mt-1">Publica el primer comunicado global.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(a => (
              <div key={a.id} className={`p-5 rounded-2xl border transition-colors hover:shadow-sm ${a.pinned ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {a.pinned && <Pin className="w-3.5 h-3.5 text-amber-600" />}
                      <h3 className="font-bold text-slate-900">{a.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{a.body}</p>
                    <p className="text-xs text-slate-400 mt-3 font-semibold">{a.authorName} • {formatDate(a.createdAt)}</p>
                  </div>
                  <button onClick={() => handleDelete(a.id!)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Nuevo Comunicado Global</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Título</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="Ej. Inicio de temporada 2025-2026" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mensaje</label>
                <textarea required value={body} onChange={e => setBody(e.target.value)} rows={4} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none" placeholder="Escribe el contenido del comunicado..." />
              </div>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={pinned} onChange={() => setPinned(!pinned)} className="w-4 h-4 text-amber-600 rounded" />
                <div>
                  <span className="text-sm font-semibold text-slate-700">Fijar como destacado</span>
                  <p className="text-xs text-slate-500">Aparecerá siempre al principio</p>
                </div>
              </label>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-500 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
