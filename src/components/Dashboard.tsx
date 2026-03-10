import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, entretiens: 0 });
  const [recentEntretiens, setRecentEntretiens] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStats(s => ({ ...s, clients: data.length }));
        } else {
          console.error('Failed to fetch clients:', data);
        }
      })
      .catch(err => console.error(err));
      
    fetch('/api/entretiens')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStats(s => ({ ...s, entretiens: data.length }));
          setRecentEntretiens(data.slice(0, 5));
        } else {
          console.error('Failed to fetch entretiens:', data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Vue d'ensemble</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Clients</p>
              <p className="text-3xl font-semibold text-slate-900 mt-1">{stats.clients}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
              <Users className="text-indigo-600 h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Entretiens</p>
              <p className="text-3xl font-semibold text-slate-900 mt-1">{stats.entretiens}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <Calendar className="text-emerald-600 h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-slate-900">Entretiens récents</h2>
          <Link to="/entretiens" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Voir tout</Link>
        </div>
        <div className="divide-y divide-slate-200">
          {recentEntretiens.map((ent) => (
            <Link key={ent.id} to={`/entretiens/${ent.id}`} className="block hover:bg-slate-50 transition-colors">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-4 ${ent.statut === 'cloture' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{ent.client_nom} {ent.client_prenom}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ent.sujet_titre}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {new Date(ent.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </Link>
          ))}
          {recentEntretiens.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-500 text-sm">
              Aucun entretien récent.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
