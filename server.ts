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

  app.post('/api/entretiens', async (req, res) => {
    const { sujet_id, date_debut, notes } = req.body;
    try {
      // Hardcode user_id to 1 for now since auth is not fully implemented
      const insertRes = await db.query(`
        INSERT INTO entretiens (sujet_id, user_id, date_debut, statut, notes)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [sujet_id, 1, date_debut, 'planifie', notes]);
      res.json({ id: insertRes.rows[0].id, success: true });
    } catch (error: any) {
      console.error("Erreur création entretien:", error);
      res.status(500).json({ error: error.message });
    }
  });
