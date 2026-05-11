import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { updateUsername } from '../lib/userService';
import { Settings as SettingsIcon, User, Save, Loader2, CheckCircle } from 'lucide-react';

export function Settings() {
  const { profile, setProfile } = useAuthStore();
  const [usernameInput, setUsernameInput] = useState(profile?.username || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    
    setError('');
    setSuccess(false);
    setLoading(true);
    
    try {
      const newUsername = usernameInput.toLowerCase().replace(/\s/g, '');
      if (newUsername === profile.username) {
        setLoading(false);
        return; // Nothing changed
      }
      
      await updateUsername(profile.uid, newUsername);
      setProfile({ ...profile, username: newUsername });
      setUsernameInput(newUsername);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          Ajustes de la Cuenta
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configura tu perfil y preferencias de acceso.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-slate-500" />
          Datos de Acceso
        </h2>
        
        <form onSubmit={handleUpdateUsername} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico (No modificable)</label>
            <input 
              type="text"
              disabled
              value={profile?.email || ''}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Usuario Único</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-medium">@</span>
                <input 
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  className="w-full pl-8 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="nuevo_usuario"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || usernameInput === profile?.username}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Puedes usar este nombre de usuario para iniciar sesión en lugar de tu correo electrónico. 
              Debe estar en minúsculas y no contener espacios.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Nombre de usuario actualizado correctamente.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
