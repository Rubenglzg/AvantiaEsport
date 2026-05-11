import { User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function PlayerProfilePage() {
  const profile = useAuthStore((state) => state.profile);

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
            <UserIcon className="w-7 h-7" />
          </div>
          Mis Datos Personales
        </h1>
        <p className="text-slate-500 mt-2 text-base">Consulta la información asociada a tu ficha federativa.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre Completo</label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">{profile.name}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">{profile.email}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre de Usuario (@)</label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">@{profile.username}</div>
            <p className="text-xs text-slate-500 mt-2">Para modificar tu nombre de usuario, dirígete a la sección Ajustes.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Cuenta</label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium capitalize">{profile.accountType || 'Jugador'}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Ficha</label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">{profile.isAdult ? 'Mayor de edad' : 'Menor de edad'}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado de la Ficha</label>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
              profile.status === 'Aprobada' || profile.status === 'Activo' ? 'text-emerald-700 bg-emerald-100 border border-emerald-200' :
              profile.status === 'Pendiente' ? 'text-amber-700 bg-amber-100 border border-amber-200' :
              'text-brand-700 bg-brand-100 border border-brand-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                profile.status === 'Aprobada' || profile.status === 'Activo' ? 'bg-emerald-500' :
                profile.status === 'Pendiente' ? 'bg-amber-500' : 'bg-brand-500'
              }`}></span>
              {profile.status || 'Pendiente'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
