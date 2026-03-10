import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import db, { initDB } from './db.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/clients', async (req, res) => {
    try {
      const { rows } = await db.query('SELECT * FROM clients');
      res.json(rows);
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/clients', async (req, res) => {
    const { nom, prenom, email, ville, adresse } = req.body;
    try {
      const insertRes = await db.query(`
        INSERT INTO clients (nom, prenom, email, ville, adresse)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [nom, prenom, email, ville, adresse]);
      res.json({ id: insertRes.rows[0].id, success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/clients/:id', async (req, res) => {
    try {
      const clientRes = await db.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
      if (clientRes.rows.length === 0) return res.status(404).json({ error: 'Client not found' });
      
      const sujetsRes = await db.query('SELECT * FROM sujets WHERE client_id = $1', [req.params.id]);
      const entretiensRes = await db.query(`
        SELECT e.*, s.titre as sujet_titre 
        FROM entretiens e 
        JOIN sujets s ON e.sujet_id = s.id 
        WHERE s.client_id = $1
        ORDER BY e.date_debut DESC
      `, [req.params.id]);

      res.json({ ...(clientRes.rows[0] as any), sujets: sujetsRes.rows, entretiens: entretiensRes.rows });
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });

  app.get('/api/entretiens', async (req, res) => {
    try {
      const { rows } = await db.query(`
        SELECT e.*, s.titre as sujet_titre, c.nom as client_nom, c.prenom as client_prenom
        FROM entretiens e
        JOIN sujets s ON e.sujet_id = s.id
        JOIN clients c ON s.client_id = c.id
        ORDER BY e.date_debut DESC
      `);
      res.json(rows);
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });

  app.get('/api/entretiens/:id', async (req, res) => {
    try {
      const entretienRes = await db.query(`
        SELECT e.*, s.titre as sujet_titre, c.nom as client_nom, c.prenom as client_prenom, c.id as client_id
        FROM entretiens e
        JOIN sujets s ON e.sujet_id = s.id
        JOIN clients c ON s.client_id = c.id
        WHERE e.id = $1
      `, [req.params.id]);
      
      if (entretienRes.rows.length === 0) return res.status(404).json({ error: 'Entretien not found' });
      
      const debriefingRes = await db.query('SELECT * FROM debriefings WHERE entretien_id = $1', [req.params.id]);
      
      res.json({ ...(entretienRes.rows[0] as any), debriefing: debriefingRes.rows[0] });
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/debriefings', async (req, res) => {
    const { entretien_id, resume, points_cles, questions_followup } = req.body;
    
    try {
      const insertRes = await db.query(`
        INSERT INTO debriefings (entretien_id, resume, points_cles, questions_followup)
        VALUES ($1, $2, $3, $4) RETURNING id
      `, [
        entretien_id, 
        resume, 
        JSON.stringify(points_cles), 
        JSON.stringify(questions_followup)
      ]);
      
      // Update entretien status
      await db.query("UPDATE entretiens SET statut = 'cloture' WHERE id = $1", [entretien_id]);
      
      res.json({ id: insertRes.rows[0].id, success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start listening immediately to satisfy Cloud Run health checks
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Determine if we are in production (Cloud Run sets K_SERVICE)
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.K_SERVICE;

  // Vite middleware for development
  if (!isProduction) {
    try {
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          allowedHosts: true
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("Failed to start Vite server:", err);
    }
  } else {
    app.use(express.static('dist'));
  }

  // Initialize DB (non-blocking)
  initDB().catch(err => console.error("Failed to initialize DB:", err));
}

startServer().catch(err => {
  console.error("Fatal error during server startup:", err);
  process.exit(1);
});
