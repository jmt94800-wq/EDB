import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Clock, CheckCircle } from 'lucide-react';

export default function Entretiens() {
  const [entretiens, setEntretiens] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/entretiens')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEntretiens(data);
        } else {
          console.error('Failed to fetch entretiens:', data);
          setEntretiens([]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Entretiens</h1>
        <Link to="/entretiens/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Planifier
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-200">
          {entretiens.map(ent => (
            <Link key={ent.id} to={`/entretiens/${ent.id}`} className="block hover:bg-slate-50 transition-colors">
              <div className="p-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ent.statut === 'cloture' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {ent.statut === 'cloture' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">{ent.client_prenom} {ent.client_nom}</h3>
                    <p className="text-xs text-slate-500 mt-1">{ent.sujet_titre || 'Entretien initial / Découverte'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(ent.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${ent.statut === 'cloture' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {ent.statut === 'cloture' ? 'Clôturé' : 'Planifié'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {entretiens.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              Aucun entretien trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
