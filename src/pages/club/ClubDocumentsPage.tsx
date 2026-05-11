import { useState, useEffect } from 'react';
import { FileCheck, FileText, CheckCircle, Eye, X, Loader2 } from 'lucide-react';
import { getClubPendingDocuments, updateDocumentStatus, type PlayerDocument } from '../../lib/storageService';
import { getPlayersByClub } from '../../lib/userService';
import { useAuthStore, type UserProfile } from '../../store/authStore';

export function ClubDocumentsPage() {
  const profile = useAuthStore((state) => state.profile);
  const [pendingDocs, setPendingDocs] = useState<PlayerDocument[]>([]);
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const [docsData, playersData] = await Promise.all([
        getClubPendingDocuments(profile.uid),
        getPlayersByClub(profile.uid)
      ]);
      setPendingDocs(docsData);
      setPlayers(playersData);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [profile?.uid]);

  const handleDocumentAction = async (docId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDocumentStatus(docId, status, status === 'rejected' ? 'Documento no válido, por favor súbelo de nuevo de forma clara.' : '');
      await loadData();
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Error al actualizar el documento.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
            <FileCheck className="w-7 h-7" />
          </div>
          Verificador de Documentos
        </h1>
        <p className="text-slate-500 mt-2 text-base">Revisa los documentos subidos por los jugadores para aprobar su ficha.</p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          </div>
        ) : pendingDocs.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Todo al día</h3>
            <p className="text-slate-500">No hay documentos pendientes de revisión.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Pendientes de Revisión</h2>
              <span className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-lg border border-amber-200">
                {pendingDocs.length} documento{pendingDocs.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDocs.map(doc => {
                const player = players.find(p => p.uid === doc.userId);
                return (
                  <div key={doc.id} className="border border-slate-200 rounded-2xl p-5 hover:border-brand-300 hover:shadow-md transition-all bg-slate-50/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 uppercase tracking-wide text-xs mb-1">
                            {doc.type === 'dni' ? 'DNI / Pasaporte' : doc.type === 'medical' ? 'Reconocimiento Médico' : 'Autorización Paterna'}
                          </p>
                          <p className="text-sm font-medium text-slate-600">{player?.name || 'Jugador desconocido'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex justify-center items-center gap-2 py-2 px-3 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Ver
                      </a>
                      <button
                        onClick={() => handleDocumentAction(doc.id!, 'rejected')}
                        className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm"
                        title="Rechazar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDocumentAction(doc.id!, 'approved')}
                        className="flex-1 bg-emerald-600 text-white border border-transparent rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm"
                      >
                        Aprobar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
