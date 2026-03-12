import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MapPin, Mail, Calendar, Folder, ArrowLeft, Plus, X } from 'lucide-react';

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state for new Sujet
  const [showSujetModal, setShowSujetModal] = useState(false);
  const [newSujet, setNewSujet] = useState({ titre: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClient = () => {
    fetch(`/api/clients/${id}`)
      .then(res => res.json())
      .then(data => {
        setClient(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const handleCreateSujet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sujets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: id,
          titre: newSujet.titre,
          description: newSujet.description
        })
      });
      if (res.ok) {
        setShowSujetModal(false);
        setNewSujet({ titre: '', description: '' });
        fetchClient(); // Refresh data
      } else {
        alert('Erreur lors de la création du sujet');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création du sujet');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <button 
              onClick={() => setShowSujetModal(true)}
              className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              title="Nouveau Sujet"
            >
              <Plus className="w-5 h-5" />
            </button>
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
                      <h3 className="text-sm font-medium text-slate-900">{ent.sujet_titre || 'Entretien initial / Découverte'}</h3>
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

      {/* Modal Nouveau Sujet */}
      {showSujetModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Nouveau Sujet / Projet</h3>
              <button onClick={() => setShowSujetModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSujet} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre du sujet</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={newSujet.titre}
                  onChange={e => setNewSujet({...newSujet, titre: e.target.value})}
                  placeholder="Ex: Rénovation cuisine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  value={newSujet.description}
                  onChange={e => setNewSujet({...newSujet, description: e.target.value})}
                  placeholder="Détails du projet..."
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowSujetModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                  {isSubmitting ? 'Création...' : 'Créer le sujet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
