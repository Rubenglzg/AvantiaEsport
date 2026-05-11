import { useState } from 'react';
import { Building2, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { updateUserProfile } from '../../lib/userService';

export function ClubSettingsPage() {
  const profile = useAuthStore((state) => state.profile);
  const [clubName, setClubName] = useState(profile?.name || '');
  const [clubSport, setClubSport] = useState<'soccer' | 'basketball' | 'futsal'>(profile?.sportType || 'soccer');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setLoading(true);
    try {
      await updateUserProfile(profile.uid, { name: clubName, sportType: clubSport as any });
      useAuthStore.getState().setProfile({ ...profile, name: clubName, sportType: clubSport as any });
      alert('Información del club actualizada correctamente.');
    } catch (error) {
      console.error("Error al guardar info del club:", error);
      alert('Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-brand-100 text-brand-600 rounded-xl">
            <Building2 className="w-7 h-7" />
          </div>
          Configuración del Club
        </h1>
        <p className="text-slate-500 mt-2 text-base">Personaliza los datos de tu club y el tipo de deporte.</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre Oficial del Club</label>
            <input
              type="text"
              required
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deporte Principal</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'soccer', label: 'Fútbol Césped' },
                { value: 'basketball', label: 'Baloncesto' },
                { value: 'futsal', label: 'Fútbol Sala' },
              ].map(sport => (
                <label key={sport.value} className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${clubSport === sport.value ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                  <input type="radio" name="sport" value={sport.value} className="sr-only" checked={clubSport === sport.value} onChange={() => setClubSport(sport.value as 'soccer' | 'basketball' | 'futsal')} />
                  <span className="font-bold">{sport.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Esto personalizará el aspecto de tu panel y el de tus jugadores.</p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
