const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configuration de la base de données
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_BA2xWJemNa6k@ep-red-resonance-ag335bym-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: {
        rejectUnauthorized: false
    }
});

// Test de connexion à la base de données
pool.connect((err, client, release) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    } else {
        console.log('✅ Connecté à la base de données PostgreSQL');
        release();
    }
});

// Route pour récupérer les données financières
app.get('/api/financial-data', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                entreprise_id,
                date_analyse,
                periode,
                roe,
                netmargin,
                grossmargin,
                recommandation,
                created_at,
                sgamargin,
                debttoequity,
                currentratio,
                interestcoverage,
                peratio,
                earningsyield,
                pricetofcf,
                pricetomm200,
                dividendyield,
                pbratio,
                pegratio,
                roic,
                freecashflow,
                evtoebitda,
                score_global,
                points_forts,
                points_faibles
            FROM analyses_financières
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données',
            details: error.message 
        });
    }
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
    console.log(`📊 Accédez au tableau: http://localhost:${port}`);
});
