import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Folder, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, entretiens: 0, sujets: 0, byStatus: [], byMonth: [] });
  const [recentEntretiens, setRecentEntretiens] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.clients === 'number') {
          setStats(data);
        }
      })
      .catch(err => console.error(err));
      
    fetch('/api/entretiens')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecentEntretiens(data.slice(0, 5));
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Format data for chart
  const chartData = stats.byMonth.map((item: any) => {
    const [year, month] = item.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return {
      name: date.toLocaleDateString('fr-FR', { month: 'short' }),
      entretiens: parseInt(item.count)
    };
  });

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
              <p className="text-sm font-medium text-slate-500">Sujets / Projets</p>
              <p className="text-3xl font-semibold text-slate-900 mt-1">{stats.sujets}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
              <Folder className="text-amber-600 h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Entretiens</p>
              <p className="text-3xl font-semibold text-slate-900 mt-1">{stats.entretiens}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <Calendar className="text-emerald-600 h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-6">Activité des entretiens (6 derniers mois)</h2>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="entretiens" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Pas assez de données pour afficher le graphique.
              </div>
            )}
          </div>
        </div>

        {/* Recent Entretiens */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-slate-900">Entretiens récents</h2>
            <Link to="/entretiens" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Voir tout</Link>
          </div>
          <div className="divide-y divide-slate-200 flex-1 overflow-y-auto">
            {recentEntretiens.map((ent) => (
              <Link key={ent.id} to={`/entretiens/${ent.id}`} className="block hover:bg-slate-50 transition-colors">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-4 ${ent.statut === 'cloture' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{ent.client_nom} {ent.client_prenom}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{ent.sujet_titre || 'Entretien initial / Découverte'}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {new Date(ent.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
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
    </div>
  );
}
