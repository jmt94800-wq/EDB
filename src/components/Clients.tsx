import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, User, MapPin, Mail } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClients(data);
        } else {
          console.error('Failed to fetch clients:', data);
          setClients([]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const filtered = clients.filter(c => 
    (c.nom + ' ' + c.prenom).toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau Client
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filtered.map(client => (
            <Link key={client.id} to={`/clients/${client.id}`} className="block hover:bg-slate-50 transition-colors">
              <div className="p-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                    {client.prenom[0]}{client.nom[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">{client.prenom} {client.nom}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {client.email && (
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>
                      )}
                      {client.ville && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {client.ville}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              Aucun client trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
