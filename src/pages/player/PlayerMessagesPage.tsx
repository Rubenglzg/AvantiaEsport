import { useState, useEffect } from 'react';
import { Mail, Loader2, Pin } from 'lucide-react';
import { getPlayerAnnouncements, type Announcement } from '../../lib/announcementsService';
import { useAuthStore } from '../../store/authStore';

export function PlayerMessagesPage() {
  const profile = useAuthStore((s) => s.profile);
  const [messages, setMessages] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile?.clubId) return;
      setLoading(true);
      try { setMessages(await getPlayerAnnouncements(profile.clubId)); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [profile?.clubId]);

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl"><Mail className="w-7 h-7" /></div>
          Buzón de Mensajes
        </h1>
        <p className="text-slate-500 mt-2">Comunicados de tu club y de la plataforma.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
      ) : messages.length === 0 ? (
        <div className="text-center p-12 bg-white border border-slate-200 border-dashed rounded-2xl text-slate-500">
          <Mail className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">No hay mensajes</p>
          <p className="text-sm mt-1">Los comunicados de tu club y de la plataforma aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`bg-white rounded-2xl border p-5 transition-colors ${m.pinned ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {m.pinned && <Pin className="w-3.5 h-3.5 text-amber-600" />}
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${m.scope === 'global' ? 'bg-indigo-100 text-indigo-700' : 'bg-brand-100 text-brand-700'}`}>
                  {m.scope === 'global' ? 'Plataforma' : 'Club'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{m.title}</h3>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{m.body}</p>
              <p className="text-xs text-slate-400 mt-3 font-semibold">{m.authorName} • {formatDate(m.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
