import { Pool } from 'pg';

// Configuration de la connexion PostgreSQL
// Cloud Run injectera automatiquement les variables d'environnement
const pool = new Pool({
  host: process.env.INSTANCE_CONNECTION_NAME 
    ? `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}` 
    : (process.env.DB_HOST || 'localhost'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'postgres',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

export const initDB = async () => {
  try {
    // Création des tables (Syntaxe PostgreSQL)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
          id SERIAL PRIMARY KEY,
          nom TEXT NOT NULL,
          prenom TEXT NOT NULL,
          adresse TEXT,
          ville TEXT,
          photo_url TEXT,
          email TEXT UNIQUE
      );

      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email TEXT UNIQUE,
          role TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sujets (
          id SERIAL PRIMARY KEY,
          client_id INTEGER REFERENCES clients(id),
          titre TEXT,
          description TEXT
      );

      CREATE TABLE IF NOT EXISTS besoins (
          id SERIAL PRIMARY KEY,
          sujet_id INTEGER REFERENCES sujets(id),
          titre TEXT,
          description TEXT,
          categorie TEXT,
          tags TEXT,
          priorite TEXT,
          budget REAL,
          date_start TEXT,
          date_end TEXT,
          archived INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS entretiens (
          id SERIAL PRIMARY KEY,
          sujet_id INTEGER REFERENCES sujets(id),
          user_id INTEGER REFERENCES users(id),
          date_debut TEXT NOT NULL,
          date_fin TEXT,
          statut TEXT DEFAULT 'planifie',
          notes TEXT,
          audio_urls TEXT,
          video_urls TEXT,
          photo_urls TEXT
      );

      CREATE TABLE IF NOT EXISTS debriefings (
          id SERIAL PRIMARY KEY,
          entretien_id INTEGER REFERENCES entretiens(id),
          resume TEXT,
          points_cles TEXT,
          questions_followup TEXT,
          access_collabs TEXT
      );

      CREATE TABLE IF NOT EXISTS matches (
          id SERIAL PRIMARY KEY,
          besoin_id1 INTEGER REFERENCES besoins(id),
          besoin_id2 INTEGER REFERENCES besoins(id),
          statut TEXT,
          notification_sent INTEGER DEFAULT 0
      );
    `);

    // Insertion de données de test si la base est vide
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM clients');
    if (parseInt(rows[0].count) === 0) {
      const clientRes = await pool.query(
        'INSERT INTO clients (nom, prenom, adresse, ville, email) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        ['Dupont', 'Jean', '123 Rue de la Paix', 'Paris', 'jean.dupont@example.com']
      );
      const clientId = clientRes.rows[0].id;

      const sujetRes = await pool.query(
        'INSERT INTO sujets (client_id, titre, description) VALUES ($1, $2, $3) RETURNING id',
        [clientId, 'Projet de construction', "Construction d'une nouvelle maison"]
      );
      const sujetId = sujetRes.rows[0].id;

      await pool.query(
        'INSERT INTO besoins (sujet_id, titre, description, categorie, tags, priorite, budget, date_start) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [sujetId, 'Piscine', 'Piscine creusée 8x4m', 'Construction', JSON.stringify(['Piscine', 'Extérieur']), 'haute', 25000, new Date().toISOString()]
      );

      const userRes = await pool.query(
        'INSERT INTO users (username, password_hash, email, role) VALUES ($1, $2, $3, $4) RETURNING id',
        ['admin', 'hashed_pw', 'admin@crm.com', 'admin']
      );
      const userId = userRes.rows[0].id;

      await pool.query(
        'INSERT INTO entretiens (sujet_id, user_id, date_debut, statut, notes) VALUES ($1, $2, $3, $4, $5)',
        [sujetId, userId, new Date().toISOString(), 'cloture', 'Le client souhaite une piscine chauffée. Budget flexible mais max 30k.']
      );
      console.log('Données de test insérées avec succès.');
    }
  } catch (err) {
    console.error("Erreur lors de l'initialisation de la base de données:", err);
  }
};

export default pool;
