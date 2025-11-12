const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BA2xWJemNa6k@ep-red-resonance-ag335bym-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
});

// Test de connexion à la base de données
pool.on('connect', () => {
  console.log('[SUCCESS] Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[ERROR] Erreur de connexion PostgreSQL:', err);
});

// Route API
app.get('/api/financial-data', async (req, res) => {
    try {
        console.log('[INFO] Requête pour les données financières reçue');
        
        const query = `
              SELECT 
                id,
                entreprise_id,
                date_analyse,
                periode,
                roe,
                netMargin,
                grossMargin,
                recommandation,
                created_at,
                sgaMargin,
                debtToEquity,
                currentRatio,
                interestCoverage,
                peRatio,
                earningsYield,
                priceToFCF,
                priceToMM200,
                dividendYield,
                pbRatio,
                pegRatio,
                roic,
                freeCashFlow,
                evToEbitda,
                score_global,
                points_forts,
                points_faibles
            FROM analyses_buffett ORDER BY created_at DESC`;
  

        const result = await pool.query(query);
        console.log('[SUCCESS] ' + result.rows.length + ' enregistrements récupérés');
        res.json(result.rows);
        
    } catch (error) {
            console.error('[ERROR] Erreur détaillée:', error);
            res.status(500).json({ 
                error: 'Erreur base de données',
                message: error.message,
                detail: error.detail
            });
        }
});

// Route pour servir le frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route de santé
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log('[START] Serveur démarré sur le port ' + port);
    console.log('[INFO] Health check: http://localhost:' + port + '/health');
    console.log('[INFO] API: http://localhost:' + port + '/api/financial-data');
});
