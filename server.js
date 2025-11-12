const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, require: true }
});

// Test de connexion corrigé
pool.query('SELECT NOW()')
  .then(() => console.log('[SUCCESS] Connecté à PostgreSQL'))
  .catch(err => console.log('[ERROR] Erreur connexion PostgreSQL:', err.message));

// **ROUTE RACINE AJOUTÉE** - sert le fichier index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route API
app.get('/api/financial-data', async (req, res) => {
  try {
    console.log('[INFO] Récupération des données...');
    
    const result = await pool.query('SELECT * FROM analyses_buffett ORDER BY created_at DESC LIMIT 100');
    
    console.log('[SUCCESS] ' + result.rows.length + ' enregistrements récupérés');
    res.json(result.rows);
    
  } catch (error) {
    console.error('[ERROR] Erreur détaillée:', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route de santé
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// **ROUTE DE FALLBACK** - pour toutes les autres routes, sert index.html (utile pour le routing côté client)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
    console.log('[START] Serveur démarré sur le port ' + port);
    console.log('[INFO] Health check: http://localhost:' + port + '/health');
    console.log('[INFO] API: http://localhost:' + port + '/api/financial-data');
    console.log('[INFO] Application: http://localhost:' + port);
});
