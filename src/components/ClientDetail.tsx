import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MapPin, Mail, Calendar, Folder, ArrowLeft } from 'lucide-react';

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(res => res.json())
      .then(data => {
        setClient(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  if (!client || client.error) return <div className="p-8 text-center text-red-500">Client introuvable</div>;

  return (
    <div className="space-y-6">
      <Link to="/clients" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux clients
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl shrink-0">
            {client.prenom[0]}{client.nom[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{client.prenom} {client.nom}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
              {client.email && (
                <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {client.email}</div>
              )}
              {client.ville && (
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {client.ville}, {client.adresse}</div>
              )}
            </div>
          </div>
          <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors">
            Éditer le profil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sujets */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2">
              <Folder className="w-5 h-5 text-indigo-500" /> Sujets & Besoins
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {client.sujets?.map((sujet: any) => (
              <div key={sujet.id} className="p-6">
                <h3 className="text-base font-medium text-slate-900">{sujet.titre}</h3>
                <p className="text-sm text-slate-500 mt-1">{sujet.description}</p>
              </div>
            ))}
            {(!client.sujets || client.sujets.length === 0) && (
              <div className="p-6 text-center text-sm text-slate-500">Aucun sujet actif.</div>
            )}
          </div>
        </div>

        {/* Historique Entretiens */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" /> Historique Entretiens
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {client.entretiens?.map((ent: any) => (
              <Link key={ent.id} to={`/entretiens/${ent.id}`} className="block hover:bg-slate-50 transition-colors">
                <div className="p-6 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${ent.statut === 'cloture' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <h3 className="text-sm font-medium text-slate-900">{ent.sujet_titre}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {new Date(ent.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {(!client.entretiens || client.entretiens.length === 0) && (
              <div className="p-6 text-center text-sm text-slate-500">Aucun entretien enregistré.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
