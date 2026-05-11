import { useState, useEffect } from 'react';
import { ClipboardCheck, Loader2, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { getClubEvents, type ClubEvent } from '../../lib/eventsService';
import { getPlayersByClub } from '../../lib/userService';
import { saveAttendance, getEventAttendance, type AttendanceRecord, type AttendanceStatus } from '../../lib/attendanceService';
import { useAuthStore, type UserProfile } from '../../store/authStore';

export function ClubAttendancePage() {
  const profile = useAuthStore((state) => state.profile);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!profile?.uid) return;
      setLoading(true);
      try {
        const [evData, plData] = await Promise.all([getClubEvents(profile.uid), getPlayersByClub(profile.uid)]);
        setEvents(evData);
        setPlayers(plData);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [profile?.uid]);

  const handleSelectEvent = async (ev: ClubEvent) => {
    setSelectedEvent(ev);
    const existing = await getEventAttendance(ev.id!);
    if (existing) {
      setRecords(existing.records);
    } else {
      setRecords(players.map(p => ({ playerId: p.uid!, status: 'absent' as AttendanceStatus })));
    }
  };

  const toggleStatus = (playerId: string) => {
    setRecords(prev => prev.map(r => {
      if (r.playerId !== playerId) return r;
      const next: AttendanceStatus = r.status === 'present' ? 'absent' : r.status === 'absent' ? 'justified' : 'present';
      return { ...r, status: next };
    }));
  };

  const handleSave = async () => {
    if (!selectedEvent || !profile?.uid) return;
    setSaving(true);
    try {
      await saveAttendance({ eventId: selectedEvent.id!, eventTitle: selectedEvent.title, clubId: profile.uid, date: selectedEvent.date, records });
      alert('Asistencia guardada correctamente.');
    } catch (e) { console.error(e); alert('Error al guardar.'); }
    finally { setSaving(false); }
  };

  const statusIcon = (s: AttendanceStatus) => {
    if (s === 'present') return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    if (s === 'justified') return <MinusCircle className="w-5 h-5 text-amber-600" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const statusLabel = (s: AttendanceStatus) => s === 'present' ? 'Presente' : s === 'justified' ? 'Justificado' : 'Ausente';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl"><ClipboardCheck className="w-7 h-7" /></div>
          Control de Asistencia
        </h1>
        <p className="text-slate-500 mt-2 text-base">Selecciona un evento y pasa lista a los jugadores.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">Eventos</h3>
            {events.length === 0 ? (
              <p className="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl">No hay eventos creados.</p>
            ) : events.map(ev => (
              <div key={ev.id} onClick={() => handleSelectEvent(ev)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedEvent?.id === ev.id ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <p className="font-bold text-slate-900 text-sm">{ev.title}</p>
                <p className="text-xs text-slate-500 mt-1">{ev.date} • {ev.time}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedEvent ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedEvent.title}</h3>
                    <p className="text-sm text-slate-500">{selectedEvent.date} a las {selectedEvent.time}</p>
                  </div>
                  <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-500 disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Guardar
                  </button>
                </div>
                <div className="p-6 space-y-2">
                  {players.map(p => {
                    const rec = records.find(r => r.playerId === p.uid);
                    const status = rec?.status || 'absent';
                    return (
                      <div key={p.uid} onClick={() => toggleStatus(p.uid!)} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">{p.name?.charAt(0).toUpperCase()}</div>
                          <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">{statusLabel(status)}</span>
                          {statusIcon(status)}
                        </div>
                      </div>
                    );
                  })}
                  {players.length === 0 && <p className="text-center text-slate-500 py-4">No hay jugadores registrados.</p>}
                </div>
              </div>
            ) : (
              <div className="h-full bg-white rounded-3xl border border-slate-200 border-dashed flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <ClipboardCheck className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-lg font-semibold">Selecciona un evento</p>
                <p className="text-sm">Haz clic en un evento de la lista para pasar lista.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
