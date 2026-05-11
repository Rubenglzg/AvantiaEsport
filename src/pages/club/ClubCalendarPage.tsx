import { useState, useEffect } from 'react';
import { CalendarDays, Plus, X, Loader2, Trash2, MapPin, Clock } from 'lucide-react';
import { createEvent, getClubEvents, deleteEvent, type ClubEvent, type EventType } from '../../lib/eventsService';
import { getTeamsByClub, type Team } from '../../lib/teamsService';
import { useAuthStore } from '../../store/authStore';

const eventTypeLabels: Record<EventType, { label: string; color: string; bg: string }> = {
  training: { label: 'Entrenamiento', color: 'text-blue-700', bg: 'bg-blue-100' },
  match: { label: 'Partido', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  event: { label: 'Evento', color: 'text-amber-700', bg: 'bg-amber-100' },
};

export function ClubCalendarPage() {
  const profile = useAuthStore((state) => state.profile);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('training');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [teamId, setTeamId] = useState('');

  const loadData = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const [eventsData, teamsData] = await Promise.all([
        getClubEvents(profile.uid),
        getTeamsByClub(profile.uid)
      ]);
      setEvents(eventsData);
      setTeams(teamsData);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [profile?.uid]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setFormLoading(true);
    try {
      await createEvent({
        clubId: profile.uid, teamId: teamId || undefined,
        title, description, type, date, time, location,
        createdAt: new Date().toISOString()
      });
      setShowModal(false);
      setTitle(''); setDescription(''); setType('training'); setDate(''); setTime(''); setLocation(''); setTeamId('');
      await loadData();
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error al crear evento.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este evento?')) return;
    try { await deleteEvent(id); await loadData(); }
    catch (error) { console.error("Error deleting event:", error); }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter(e => e.date >= today);
  const pastEvents = events.filter(e => e.date < today);

  const formatDate = (d: string) => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }); }
    catch { return d; }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><CalendarDays className="w-7 h-7" /></div>
            Calendario de Eventos
          </h1>
          <p className="text-slate-500 mt-2 text-base">Programa entrenamientos, partidos y eventos del club.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30">
          <Plus className="w-5 h-5" /> Nuevo Evento
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
      ) : (
        <>
          {/* Upcoming */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Próximos Eventos ({upcomingEvents.length})</h2>
            {upcomingEvents.length === 0 ? (
              <div className="text-center p-8 bg-white border border-slate-200 border-dashed rounded-2xl text-slate-500">No hay eventos próximos.</div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(ev => {
                  const typeInfo = eventTypeLabels[ev.type];
                  return (
                    <div key={ev.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all flex items-start justify-between gap-4 group">
                      <div className="flex gap-4">
                        <div className="text-center shrink-0 w-14">
                          <p className="text-2xl font-black text-slate-900">{new Date(ev.date + 'T00:00:00').getDate()}</p>
                          <p className="text-xs font-semibold text-slate-500 uppercase">{new Date(ev.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' })}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${typeInfo.bg} ${typeInfo.color}`}>{typeInfo.label}</span>
                            {ev.teamId && <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{teams.find(t => t.id === ev.teamId)?.name}</span>}
                          </div>
                          <h3 className="font-bold text-slate-900">{ev.title}</h3>
                          {ev.description && <p className="text-sm text-slate-500 mt-0.5">{ev.description}</p>}
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ev.time}</span>
                            {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.location}</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(ev.id!)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-500 mb-4">Eventos Pasados ({pastEvents.length})</h2>
              <div className="space-y-2 opacity-60">
                {pastEvents.slice(0, 10).map(ev => {
                  const typeInfo = eventTypeLabels[ev.type];
                  return (
                    <div key={ev.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${typeInfo.bg} ${typeInfo.color}`}>{typeInfo.label}</span>
                        <span className="font-semibold text-slate-700 text-sm">{ev.title}</span>
                        <span className="text-xs text-slate-400">{formatDate(ev.date)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-900">Nuevo Evento</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Título</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Ej. Entrenamiento semanal" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Evento</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['training', 'match', 'event'] as EventType[]).map(t => (
                    <label key={t} className={`border-2 rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all text-sm font-bold ${type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <input type="radio" name="type" className="sr-only" checked={type === t} onChange={() => setType(t)} />
                      {eventTypeLabels[t].label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hora</label>
                  <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ubicación</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Ej. Polideportivo Municipal" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Equipo (opcional)</label>
                <select value={teamId} onChange={e => setTeamId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all">
                  <option value="">Todos los equipos</option>
                  {teams.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descripción (opcional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" placeholder="Notas adicionales..." />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold">Cancelar</button>
                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
