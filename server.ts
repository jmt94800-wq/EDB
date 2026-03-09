import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import db from './db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/clients', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients').all();
    res.json(clients);
  });

  app.get('/api/clients/:id', (req, res) => {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    
    const sujets = db.prepare('SELECT * FROM sujets WHERE client_id = ?').all(req.params.id);
    const entretiens = db.prepare(`
      SELECT e.*, s.titre as sujet_titre 
      FROM entretiens e 
      JOIN sujets s ON e.sujet_id = s.id 
      WHERE s.client_id = ?
      ORDER BY e.date_debut DESC
    `).all(req.params.id);

    res.json({ ...(client as any), sujets, entretiens });
  });

  app.get('/api/entretiens', (req, res) => {
    const entretiens = db.prepare(`
      SELECT e.*, s.titre as sujet_titre, c.nom as client_nom, c.prenom as client_prenom
      FROM entretiens e
      JOIN sujets s ON e.sujet_id = s.id
      JOIN clients c ON s.client_id = c.id
      ORDER BY e.date_debut DESC
    `).all();
    res.json(entretiens);
  });

  app.get('/api/entretiens/:id', (req, res) => {
    const entretien = db.prepare(`
      SELECT e.*, s.titre as sujet_titre, c.nom as client_nom, c.prenom as client_prenom, c.id as client_id
      FROM entretiens e
      JOIN sujets s ON e.sujet_id = s.id
      JOIN clients c ON s.client_id = c.id
      WHERE e.id = ?
    `).get(req.params.id);
    
    if (!entretien) return res.status(404).json({ error: 'Entretien not found' });
    
    const debriefing = db.prepare('SELECT * FROM debriefings WHERE entretien_id = ?').get(req.params.id);
    
    res.json({ ...(entretien as any), debriefing });
  });

  app.post('/api/debriefings', (req, res) => {
    const { entretien_id, resume, points_cles, questions_followup } = req.body;
    
    try {
      const stmt = db.prepare(`
        INSERT INTO debriefings (entretien_id, resume, points_cles, questions_followup)
        VALUES (?, ?, ?, ?)
      `);
      
      const info = stmt.run(
        entretien_id, 
        resume, 
        JSON.stringify(points_cles), 
        JSON.stringify(questions_followup)
      );
      
      // Update entretien status
      db.prepare("UPDATE entretiens SET statut = 'cloture' WHERE id = ?").run(entretien_id);
      
      res.json({ id: info.lastInsertRowid, success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
