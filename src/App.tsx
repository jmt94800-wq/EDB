import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Settings } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import ClientDetail from './components/ClientDetail';
import Entretiens from './components/Entretiens';
import EntretienDetail from './components/EntretienDetail';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/clients', icon: Users, label: 'Clients' },
    { path: '/entretiens', icon: CalendarDays, label: 'Entretiens' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="font-semibold text-slate-800 text-lg tracking-tight">CRM Debrief</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-700' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <Link to="/settings" className="flex items-center px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Settings className="mr-3 h-5 w-5 text-slate-400" />
            Paramètres
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Nouvelles pages
function SettingsPage() {
  const [dbTestResult, setDbTestResult] = useState<any>(null);
  const [testingDb, setTestingDb] = useState(false);

  const handleTestDb = async () => {
    setTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await fetch('/api/test-db');
      const data = await res.json();
      setDbTestResult(data);
    } catch (err: any) {
      setDbTestResult({ success: false, error: err.message });
    } finally {
      setTestingDb(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900">Paramètres</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-900">Profil Utilisateur</h2>
          <p className="text-sm text-slate-500 mt-1">Gérez vos informations personnelles et vos préférences.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom d'utilisateur</label>
              <input type="text" disabled value="admin" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" disabled value="admin@crm.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-900">Préférences de l'application</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900">Notifications par email</h3>
              <p className="text-sm text-slate-500">Recevoir un email lors de la création d'un entretien.</p>
            </div>
            <button className="bg-indigo-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-sm font-medium text-slate-900">Mode sombre</h3>
              <p className="text-sm text-slate-500">Activer le thème sombre pour l'interface.</p>
            </div>
            <button className="bg-slate-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2">
              <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-900">Base de données</h2>
          <p className="text-sm text-slate-500 mt-1">Testez la connexion et les droits d'écriture de votre base de données PostgreSQL.</p>
        </div>
        <div className="p-6 space-y-4">
          <button 
            onClick={handleTestDb} 
            disabled={testingDb}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {testingDb ? 'Test en cours...' : 'Lancer le test de connexion'}
          </button>

          {dbTestResult && (
            <div className={`mt-4 p-4 rounded-xl border ${dbTestResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <h3 className="font-semibold mb-2">
                {dbTestResult.success ? '✅ Test réussi !' : '❌ Échec du test'}
              </h3>
              {dbTestResult.success ? (
                <pre className="text-xs overflow-auto">{JSON.stringify(dbTestResult.details, null, 2)}</pre>
              ) : (
                <div className="text-sm space-y-1">
                  <p><strong>Erreur :</strong> {dbTestResult.error}</p>
                  {dbTestResult.detail && <p><strong>Détail :</strong> {dbTestResult.detail}</p>}
                  <p className="mt-2 text-xs opacity-80">
                    Note : Si vous voyez "connect ECONNREFUSED 127.0.0.1:5432", cela signifie qu'aucune base de données PostgreSQL n'est accessible. Vous devez configurer les variables d'environnement (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) dans les paramètres de votre hébergeur.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';

function NewClientPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', ville: '', adresse: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        navigate('/clients');
      } else {
        alert('Erreur lors de la création du client');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création du client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900">Nouveau Client</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
            <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
            <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={formData.ville} onChange={e => setFormData({...formData, ville: e.target.value})} />
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/clients')} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50">Annuler</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Création...' : 'Créer le client'}
          </button>
        </div>
      </form>
    </div>
  );
}

function NewEntretienPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [sujets, setSujets] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    client_id: '',
    sujet_id: '',
    date_debut: new Date().toISOString().slice(0, 16),
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClients(data);
      });
      
    fetch('/api/sujets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSujets(data);
      });
  }, []);

  const filteredSujets = sujets.filter(s => s.client_id.toString() === formData.client_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sujet_id) {
      alert("Veuillez sélectionner un sujet.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/entretiens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sujet_id: formData.sujet_id,
          date_debut: new Date(formData.date_debut).toISOString(),
          notes: formData.notes
        })
      });
      if (res.ok) {
        navigate('/entretiens');
      } else {
        alert('Erreur lors de la planification');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la planification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900">Planifier un entretien</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
          <select 
            required 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            value={formData.client_id}
            onChange={e => setFormData({...formData, client_id: e.target.value, sujet_id: ''})}
          >
            <option value="">-- Sélectionner un client --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
            ))}
          </select>
        </div>

        {formData.client_id && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sujet / Projet</label>
            {filteredSujets.length > 0 ? (
              <select 
                required 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                value={formData.sujet_id}
                onChange={e => setFormData({...formData, sujet_id: e.target.value})}
              >
                <option value="">-- Sélectionner un sujet --</option>
                {filteredSujets.map(s => (
                  <option key={s.id} value={s.id}>{s.titre}</option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                Ce client n'a aucun sujet actif. Veuillez d'abord créer un sujet pour ce client.
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date et heure</label>
          <input 
            required 
            type="datetime-local" 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.date_debut}
            onChange={e => setFormData({...formData, date_debut: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes préparatoires</label>
          <textarea 
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Objectifs de l'entretien, questions à poser..."
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/entretiens')} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50">Annuler</button>
          <button 
            type="submit" 
            disabled={loading || !formData.sujet_id} 
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Planification...' : 'Planifier'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/new" element={<NewClientPage />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/entretiens" element={<Entretiens />} />
          <Route path="/entretiens/new" element={<NewEntretienPage />} />
          <Route path="/entretiens/:id" element={<EntretienDetail />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}