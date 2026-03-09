import Database from 'better-sqlite3';

const db = new Database('crm.db', { verbose: console.log });

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      adresse TEXT,
      ville TEXT,
      photo_url TEXT,
      email TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sujets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER REFERENCES clients(id),
      titre TEXT,
      description TEXT
  );

  CREATE TABLE IF NOT EXISTS besoins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entretien_id INTEGER REFERENCES entretiens(id),
      resume TEXT,
      points_cles TEXT,
      questions_followup TEXT,
      access_collabs TEXT
  );

  CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      besoin_id1 INTEGER REFERENCES besoins(id),
      besoin_id2 INTEGER REFERENCES besoins(id),
      statut TEXT,
      notification_sent INTEGER DEFAULT 0
  );
`);

// Insert some mock data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number };
if (count.count === 0) {
  const insertClient = db.prepare('INSERT INTO clients (nom, prenom, adresse, ville, email) VALUES (?, ?, ?, ?, ?)');
  const client1 = insertClient.run('Dupont', 'Jean', '123 Rue de la Paix', 'Paris', 'jean.dupont@example.com');
  const client2 = insertClient.run('Martin', 'Sophie', '456 Avenue des Champs', 'Lyon', 'sophie.martin@example.com');

  const insertSujet = db.prepare('INSERT INTO sujets (client_id, titre, description) VALUES (?, ?, ?)');
  const sujet1 = insertSujet.run(client1.lastInsertRowid, 'Projet de construction', "Construction d'une nouvelle maison");
  
  const insertBesoin = db.prepare('INSERT INTO besoins (sujet_id, titre, description, categorie, tags, priorite, budget, date_start) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertBesoin.run(sujet1.lastInsertRowid, 'Piscine', 'Piscine creusée 8x4m', 'Construction', JSON.stringify(['Piscine', 'Extérieur']), 'haute', 25000, new Date().toISOString());

  const insertUser = db.prepare('INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)');
  const user1 = insertUser.run('admin', 'hashed_pw', 'admin@crm.com', 'admin');

  const insertEntretien = db.prepare('INSERT INTO entretiens (sujet_id, user_id, date_debut, statut, notes) VALUES (?, ?, ?, ?, ?)');
  insertEntretien.run(sujet1.lastInsertRowid, user1.lastInsertRowid, new Date().toISOString(), 'cloture', 'Le client souhaite une piscine chauffée. Budget flexible mais max 30k.');
}

export default db;
