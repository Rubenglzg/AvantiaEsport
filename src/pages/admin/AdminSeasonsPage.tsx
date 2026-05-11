import { useState, useEffect } from 'react';
import { Calendar, Plus, X, Loader2, Star, CheckCircle } from 'lucide-react';
import { createSeason, getSeasons, setActiveSeason, type Season } from '../../lib/seasonsService';

export function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fee, setFee] = useState('120');
  const [isActive, setIsActive] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setSeasons(await getSeasons());
    } catch (error) {
      console.error("Error loading seasons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await createSeason({ name, startDate, endDate, fee: Number(fee), isActive, createdAt: new Date().toISOString() });
      setShowModal(false);
      setName(''); setStartDate(''); setEndDate(''); setFee('120'); setIsActive(false);
      await loadData();
    } catch (error) {
      console.error("Error creating season:", error);
      alert("Error al crear temporada.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await setActiveSeason(id);
      await loadData();
    } catch (error) {
      console.error("Error setting active season:", error);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-100 text-brand-600 rounded-xl"><Calendar className="w-7 h-7" /></div>
            Gestión de Temporadas
          </h1>
          <p className="text-slate-500 mt-2 text-base">Define temporadas, fechas y cuotas. La temporada activa se aplica a los pagos.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/30">
          <Plus className="w-5 h-5" /> Nueva Temporada
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
        ) : seasons.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900">Sin temporadas</h3>
            <p className="text-sm text-slate-500 mt-1">Crea la primera temporada de la plataforma.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seasons.map(s => (
              <div key={s.id} className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${s.isActive ? 'border-brand-500 bg-brand-50/50 shadow-md ring-2 ring-brand-500/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                {s.isActive && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200">
                      <CheckCircle className="w-3.5 h-3.5" /> ACTIVA
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-black text-slate-900 mb-3">{s.name}</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-600"><span className="font-semibold text-slate-700">Inicio:</span> {s.startDate}</p>
                  <p className="text-slate-600"><span className="font-semibold text-slate-700">Fin:</span> {s.endDate}</p>
                  <p className="text-slate-600"><span className="font-semibold text-slate-700">Cuota:</span> <span className="font-bold text-slate-900">{s.fee}€</span></p>
                </div>
                {!s.isActive && (
                  <button
                    onClick={() => handleSetActive(s.id!)}
                    className="mt-4 w-full py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" /> Establecer como Activa
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Nueva Temporada</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" placeholder="Ej. Temporada 2025-2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha Inicio</label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha Fin</label>
                  <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cuota por Jugador (€)</label>
                <input type="number" required min="0" value={fee} onChange={e => setFee(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" />
              </div>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} className="w-4 h-4 text-brand-600 rounded" />
                <span className="text-sm font-semibold text-slate-700">Establecer como temporada activa</span>
              </label>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Temporada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
