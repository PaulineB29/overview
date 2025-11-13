const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, require: true }
});

// Test de connexion
pool.query('SELECT NOW()')
  .then(() => console.log('[SUCCESS] Connecté à PostgreSQL'))
  .catch(err => console.log('[ERROR] Erreur connexion PostgreSQL:', err.message));

// Import des routes des positions
const positionRoutes = require('./api/positions');

// ========== ROUTES EXISTANTES (ANALYSE BUFFETT) - NE PAS MODIFIER ==========

// Route API pour les données financières (EXISTANT - Analyse Buffett)
app.get('/api/financial-data', async (req, res) => {
  try {
    console.log('[INFO] Récupération des données les plus récentes par entreprise...');
    
    // REQUÊTE EXISTANTE - Analyse Buffett
    const result = await pool.query(`
      SELECT DISTINCT ON (a.entreprise_id) 
        a.*,
        e.nom as entreprise_nom,
        e.symbole as entreprise_symbole
      FROM analyses_buffett a
      LEFT JOIN entreprises e ON a.entreprise_id = e.id
      ORDER BY a.entreprise_id, a.created_at DESC
    `);
    
    console.log('[SUCCESS] ' + result.rows.length + ' entreprises récupérées (Analyse Buffett)');
    res.json(result.rows);
    
  } catch (error) {
    console.error('[ERROR] Erreur détaillée:', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ========== NOUVELLES ROUTES (PORTEFEUILLE) ==========

// Routes pour les positions (NOUVEAU)
app.get('/api/positions', positionRoutes.getPositions);
app.post('/api/positions', positionRoutes.addPosition);
app.put('/api/positions/:id', positionRoutes.updatePosition);
app.delete('/api/positions/:id', positionRoutes.deletePosition);

// Route pour les entreprises de base (NOUVEAU - pour le portefeuille)
app.get('/api/entreprises', async (req, res) => {
  try {
    console.log('[INFO] Récupération des entreprises pour le portefeuille...');
    
    const result = await pool.query(`
      SELECT id, symbole, nom, secteur, industrie 
      FROM entreprises 
      ORDER BY nom ASC
    `);
    
    console.log('[SUCCESS] ' + result.rows.length + ' entreprises récupérées pour portefeuille');
    res.json(result.rows);
    
  } catch (error) {
    console.error('[ERROR] Erreur récupération entreprises:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== ROUTES COMMUNES ==========

// Route de santé
app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      services: {
        analyseBuffett: 'Actif',
        portefeuille: 'Actif',
        positions: 'Actif'
      }
    });
});


// Route racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// Route de fallback - DOIT ÊTRE LA DERNIÈRE
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
    console.log('[START] Serveur démarré sur le port ' + port);
    console.log('[INFO] Health check: http://localhost:' + port + '/health');
    console.log('[INFO] API Analyse Buffett: http://localhost:' + port + '/api/financial-data');
    console.log('[INFO] API Portefeuille - Positions: http://localhost:' + port + '/api/positions');
    console.log('[INFO] API Portefeuille - Entreprises: http://localhost:' + port + '/api/entreprises');
    console.log('[INFO] Application: http://localhost:' + port);
});
