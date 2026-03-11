import db from './db.js';

async function testDB() {
  console.log('--- DÉBUT DU TEST DE LA BASE DE DONNÉES ---');
  try {
    // 1. Test de lecture (Read)
    console.log('\n1. Test de lecture (SELECT)...');
    const readResult = await db.query('SELECT COUNT(*) FROM clients');
    console.log(`✅ Lecture réussie. Nombre de clients actuels : ${readResult.rows[0].count}`);

    // 2. Test d'écriture (Write)
    console.log('\n2. Test d\'écriture (INSERT)...');
    const testEmail = `test-${Date.now()}@example.com`;
    const insertResult = await db.query(`
      INSERT INTO clients (nom, prenom, email, ville, adresse)
      VALUES ($1, $2, $3, $4, $5) RETURNING id, nom, email
    `, ['TestNom', 'TestPrenom', testEmail, 'Paris', '123 rue Test']);
    
    const newClient = insertResult.rows[0];
    console.log(`✅ Écriture réussie. Nouveau client créé avec l'ID : ${newClient.id} (Email: ${newClient.email})`);

    // 3. Test de suppression (Delete) pour nettoyer
    console.log('\n3. Nettoyage (DELETE)...');
    await db.query('DELETE FROM clients WHERE id = $1', [newClient.id]);
    console.log(`✅ Nettoyage réussi. Client ${newClient.id} supprimé.`);

    console.log('\n--- TOUS LES TESTS ONT RÉUSSI ---');
  } catch (error: any) {
    console.error('\n❌ ERREUR LORS DU TEST DE LA BASE DE DONNÉES :');
    console.error(error.message);
    if (error.detail) console.error('Détail:', error.detail);
    if (error.hint) console.error('Indice:', error.hint);
  } finally {
    // Fermer la connexion pour que le script se termine
    await db.end();
  }
}

testDB();
