import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { getPlayersByClub } from '../../lib/userService';
import { getTeamsByClub, type Team } from '../../lib/teamsService';
import { getClubPayments, type PaymentRecord } from '../../lib/paymentService';
import { useAuthStore, type UserProfile } from '../../store/authStore';

export function ClubTreasuryPage() {
  const profile = useAuthStore((state) => state.profile);
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile?.uid) return;
      setLoading(true);
      try {
        const [playersData, teamsData, paymentsData] = await Promise.all([
          getPlayersByClub(profile.uid),
          getTeamsByClub(profile.uid),
          getClubPayments(profile.uid)
        ]);
        setPlayers(playersData);
        setTeams(teamsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error("Error loading treasury:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile?.uid]);

  const totalExpectedRevenue = players.length * 120;
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidCount = players.filter(p => payments.some(payment => payment.userId === p.uid)).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-24">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
            <CreditCard className="w-7 h-7" />
          </div>
          Tesorería del Club
        </h1>
        <p className="text-slate-500 mt-2 text-base">Control de cuotas y pagos de los jugadores.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard className="w-32 h-32" /></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Ingresos Esperados</p>
            <h3 className="text-4xl font-black mb-1">{totalExpectedRevenue}€</h3>
            <p className="text-sm text-slate-300">Temporada Actual (120€/jugador)</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Recaudado</p>
          <h3 className="text-4xl font-black text-emerald-600 mb-1">{totalCollected}€</h3>
          <p className="text-sm text-slate-500">{paidCount} de {players.length} jugadores han pagado</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Pendiente</p>
          <h3 className="text-4xl font-black text-amber-600 mb-1">{totalExpectedRevenue - totalCollected}€</h3>
          <p className="text-sm text-slate-500">{players.length - paidCount} jugadores sin abonar</p>
        </div>
      </div>

      {/* Player Payment Status */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Estado de Cuotas</h2>
        <div className="space-y-3">
          {players.map(p => {
            const hasPaid = payments.some(payment => payment.userId === p.uid);
            return (
              <div key={p.uid} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                    {p.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{teams.find(t => t.id === p.teamId)?.name || 'Sin equipo'}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <p className="font-bold text-slate-900 hidden sm:block">120€</p>
                  {hasPaid ? (
                    <p className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Pagado
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-lg uppercase tracking-wider">
                      Pendiente
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {players.length === 0 && (
            <p className="text-center text-slate-500 py-4">No hay jugadores registrados para mostrar cuotas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
