import express from 'express';
import 'dotenv/config';
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
      const finalEmail = email && email.trim() !== '' ? email.trim() : null;
      const insertRes = await db.query(`
        INSERT INTO clients (nom, prenom, email, ville, adresse)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [nom, prenom, finalEmail, ville, adresse]);
      res.json({ id: insertRes.rows[0].id, success: true });
    } catch (error: any) {
      console.error("Erreur création client:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/sujets', async (req, res) => {
    try {
      const { rows } = await db.query(`
        SELECT s.*, c.nom as client_nom, c.prenom as client_prenom
        FROM sujets s
        JOIN clients c ON s.client_id = c.id
        ORDER BY s.titre ASC
      `);
      res.json(rows);
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/sujets', async (req, res) => {
    const { client_id, titre, description } = req.body;
    try {
      const insertRes = await db.query(`
        INSERT INTO sujets (client_id, titre, description)
        VALUES ($1, $2, $3) RETURNING id
      `, [client_id, titre, description]);
      res.json({ id: insertRes.rows[0].id, success: true });
    } catch (error: any) {
      console.error("Erreur création sujet:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/stats', async (req, res) => {
    try {
      const clientsCount = await db.query('SELECT COUNT(*) FROM clients');
      const entretiensCount = await db.query('SELECT COUNT(*) FROM entretiens');
      const sujetsCount = await db.query('SELECT COUNT(*) FROM sujets');
      
      const entretiensByStatus = await db.query(`
        SELECT statut, COUNT(*) as count 
        FROM entretiens 
        GROUP BY statut
      `);

      // Get last 6 months of interviews for a chart
      const entretiensByMonth = await db.query(`
        SELECT 
          TO_CHAR(CAST(date_debut AS TIMESTAMP), 'YYYY-MM') as month,
          COUNT(*) as count
        FROM entretiens
        GROUP BY month
        ORDER BY month DESC
        LIMIT 6
      `);

      res.json({
        clients: parseInt(clientsCount.rows[0].count),
        entretiens: parseInt(entretiensCount.rows[0].count),
        sujets: parseInt(sujetsCount.rows[0].count),
        byStatus: entretiensByStatus.rows,
        byMonth: entretiensByMonth.rows.reverse()
      });
    } catch (e: any) { 
      console.error("Erreur stats:", e);
      res.status(500).json({error: e.message}); 
    }
  });

  app.post('/api/entretiens', async (req, res) => {
    const { client_id, sujet_id, date_debut, notes } = req.body;
    try {
      const finalSujetId = sujet_id ? sujet_id : null;
      const insertRes = await db.query(`
        INSERT INTO entretiens (client_id, sujet_id, user_id, date_debut, statut, notes)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [client_id, finalSujetId, 1, date_debut, 'planifie', notes]);
      res.json({ id: insertRes.rows[0].id, success: true });
    } catch (error: any) {
      console.error("Erreur création entretien:", error);
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
        LEFT JOIN sujets s ON e.sujet_id = s.id 
        WHERE e.client_id = $1
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
        LEFT JOIN sujets s ON e.sujet_id = s.id
        JOIN clients c ON e.client_id = c.id
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
        LEFT JOIN sujets s ON e.sujet_id = s.id
        JOIN clients c ON e.client_id = c.id
        WHERE e.id = $1
      `, [req.params.id]);
      
      if (entretienRes.rows.length === 0) return res.status(404).json({ error: 'Entretien not found' });
      
      const debriefingRes = await db.query('SELECT * FROM debriefings WHERE entretien_id = $1', [req.params.id]);
      
      res.json({ ...(entretienRes.rows[0] as any), debriefing: debriefingRes.rows[0] });
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });

  app.put('/api/entretiens/:id', async (req, res) => {
    const { date_debut, statut, sujet_id } = req.body;
    try {
      const updates = [];
      const values = [];
      let query = 'UPDATE entretiens SET ';
      
      if (date_debut) {
        updates.push(`date_debut = $${updates.length + 1}`);
        values.push(date_debut);
      }
      if (statut) {
        updates.push(`statut = $${updates.length + 1}`);
        values.push(statut);
      }
      if (sujet_id !== undefined) {
        updates.push(`sujet_id = $${updates.length + 1}`);
        values.push(sujet_id);
      }
      
      if (updates.length === 0) return res.json({ success: true });
      
      query += updates.join(', ') + ` WHERE id = $${updates.length + 1}`;
      values.push(req.params.id);
      
      await db.query(query, values);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Erreur update entretien:", error);
      res.status(500).json({ error: error.message });
    }
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

  app.get('/api/test-db', async (req, res) => {
    try {
      const readResult = await db.query('SELECT COUNT(*) FROM clients');
      
      const testEmail = `test-${Date.now()}@example.com`;
      const insertResult = await db.query(`
        INSERT INTO clients (nom, prenom, email, ville, adresse)
        VALUES ($1, $2, $3, $4, $5) RETURNING id, nom, email
      `, ['TestNom', 'TestPrenom', testEmail, 'Paris', '123 rue Test']);
      
      const newClient = insertResult.rows[0];
      
      await db.query('DELETE FROM clients WHERE id = $1', [newClient.id]);
      
      res.json({
        success: true,
        message: "Lecture et écriture réussies dans la base de données.",
        details: {
          clientsCount: readResult.rows[0].count,
          insertedClient: newClient,
          deleted: true
        }
      });
    } catch (error: any) {
      console.error("Erreur test DB:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        detail: error.detail,
        hint: error.hint
      });
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
        define: {
          'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
        }
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
