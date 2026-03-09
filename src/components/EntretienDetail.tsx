import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { ArrowLeft, User, Calendar, FileText, MessageSquare, Loader2, Send, CheckCircle, Clock } from 'lucide-react';

export default function EntretienDetail() {
  const { id } = useParams();
  const [entretien, setEntretien] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // AI Debrief State
  const [transcription, setTranscription] = useState('');
  const [notes, setNotes] = useState('');
  const [language, setLanguage] = useState('Français');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    fetch(`/api/entretiens/${id}`)
      .then(res => res.json())
      .then(data => {
        setEntretien(data);
        if (data.notes) setNotes(data.notes);
        if (data.debriefing) setAiResult(data.debriefing.resume);
        setLoading(false);
      });
  }, [id]);

  const handleAnalyze = async () => {
    if (!transcription.trim() && !notes.trim()) {
      setAiError('Veuillez fournir au moins une transcription ou des notes.');
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiResult('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `Tu es un expert analyste de besoins clients pour une application de suivi d'entretiens commerciaux / networking (type CRM relationnel). Ton rôle est de débriefer les entretiens clients de manière professionnelle, précise et structurée.

Langue principale de réponse : français (sauf si l'utilisateur demande explicitement créole haïtien ou anglais). Réponds toujours de façon claire, concise, professionnelle et bien organisée (utilise des titres Markdown, listes à puces, numérotation).

Entrées que tu recevras :
- Transcription audio/vidéo de l'entretien (ou résumé brut si pas de transcription)
- Notes prises pendant l'entretien
- Contexte optionnel : nom/prénom du client, sujet principal, date de l'entretien

Tâches obligatoires dans chaque réponse (dans cet ordre exact) :

1. **Résumé global de l'entretien** (3-6 phrases max) : capture l'essence, le ton, les points saillants sans détails inutiles.

2. **Points clés des besoins exprimés** : liste à puces numérotée des besoins principaux du client (titre court + description 1-2 phrases). Priorise les besoins explicites ou implicites forts.

3. **Tags / Catégories** (3 à 5 maximum) : extrais ou infère des tags pertinents pour faciliter le matching (exemples de catégories prédéfinies : Construction, Piscine, Business development, Services, Emploi, Investissement, Partenariat, Autre). Choisis les plus précis possibles.

4. **Clarification & Ambiguïtés** :
   - Si un besoin est clair et bien défini → dis "Besoin clair, pas de questions supplémentaires".
   - Si ambigu, incomplet ou contradictoire → génère 3 à 5 questions follow-up précises et ouvertes à poser au client lors du prochain entretien. Numérote-les et explique brièvement pourquoi chaque question est utile.

5. **Suggestions de durée de vie du besoin** (optionnel mais recommandé) : propose une période réaliste (ex: 6 mois, 1 an) basée sur le contexte exprimé, ou "indéfinie" si pas clair.

6. **Potentiel de matching / mise en relation** : identifie brièvement si ce besoin pourrait matcher avec un profil "offre" (ex: "Ce besoin de piscine pourrait matcher avec des entrepreneurs en construction / rénovation").

Règles strictes :
- Sois objectif et factuel : base-toi uniquement sur le contenu fourni, n'invente rien.
- Respecte la confidentialité : ne mentionne pas de données sensibles hors contexte.
- Si l'entrée est en créole haïtien ou mixte → réponds en créole haïtien si demandé, sinon en français.
- Format de sortie : toujours Markdown propre (titres ##, ###, listes, gras pour emphase).
- Si l'audio/vidéo n'est pas transcrit → demande d'abord une transcription ou résume à partir des notes seulement.`;

      const prompt = `
Langue de réponse demandée : ${language}

Contexte de l'entretien :
- Nom/Prénom du client : ${entretien.client_nom} ${entretien.client_prenom}
- Sujet principal : ${entretien.sujet_titre}
- Date de l'entretien : ${entretien.date_debut}

Transcription de l'entretien :
${transcription || 'Aucune transcription fournie.'}

Notes de l'entretien :
${notes || 'Aucunes notes fournies.'}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        }
      });

      const resultText = response.text || 'Aucune réponse générée.';
      setAiResult(resultText);

      // Save debriefing to backend
      await fetch('/api/debriefings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entretien_id: id,
          resume: resultText,
          points_cles: [], // In a real app, parse the markdown to extract these
          questions_followup: []
        })
      });
      
      // Refresh entretien data to show updated status
      const updatedEntretien = await fetch(`/api/entretiens/${id}`).then(res => res.json());
      setEntretien(updatedEntretien);

    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Une erreur est survenue lors de l'analyse.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  if (!entretien || entretien.error) return <div className="p-8 text-center text-red-500">Entretien introuvable</div>;

  return (
    <div className="space-y-6">
      <Link to="/entretiens" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux entretiens
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${entretien.statut === 'cloture' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {entretien.statut === 'cloture' ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <Clock className="w-3.5 h-3.5 mr-1" />}
                {entretien.statut === 'cloture' ? 'Clôturé' : 'Planifié'}
              </span>
              <span className="text-sm font-medium text-slate-500 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(entretien.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{entretien.sujet_titre}</h1>
            <Link to={`/clients/${entretien.client_id}`} className="inline-flex items-center mt-2 text-indigo-600 hover:text-indigo-700 font-medium">
              <User className="w-4 h-4 mr-1.5" /> {entretien.client_prenom} {entretien.client_nom}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2 text-slate-800">
              <MessageSquare size={18} className="text-indigo-600" />
              Données de l'entretien
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transcription Audio/Vidéo</label>
                <textarea 
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="Collez la transcription ici..."
                  className="w-full h-40 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-y"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes Manuelles</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Vos notes prises pendant l'entretien..."
                  className="w-full h-32 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Langue du Débriefing</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow appearance-none bg-white text-slate-700"
                >
                  <option value="Français">Français</option>
                  <option value="Créole haïtien">Créole haïtien</option>
                  <option value="Anglais">Anglais</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={aiLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {aiLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Génération du débriefing...
              </>
            ) : (
              <>
                <Send size={18} />
                Générer le débrief IA
              </>
            )}
          </button>

          {aiError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              {aiError}
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[600px] h-full">
          {aiResult ? (
            <div className="markdown-body text-slate-700">
              <Markdown>{aiResult}</Markdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                <FileText size={32} className="text-slate-300" />
              </div>
              <p className="text-center max-w-sm text-sm">
                Remplissez les informations à gauche et cliquez sur "Générer le débrief IA" pour obtenir l'analyse structurée de cet entretien.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
