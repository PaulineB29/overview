onst express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 10000;

// Configuration de la base de données avec variables d'environnement
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BA2xWJemNa6k@ep-red-resonance-ag335bym-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Route pour récupérer les données financières
app.get('/api/financial-data', async (req, res) => {
    try {
        console.log('📥 Requête pour les données financières reçue');
        
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
        console.log(`✅ ${result.rows.length} enregistrements récupérés`);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des données:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données',
            details: error.message 
        });
    }
});

// Servir le frontend
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tableau d'Analyses Financières</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; background: #f8fafc; color: #334155; line-height: 1.6; }
        .container { max-width: 100%; margin: 0 auto; padding: 20px; }
        
        .header { 
            display: flex; justify-content: space-between; align-items: center; 
            margin-bottom: 30px; padding: 20px; background: white; 
            border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); 
        }
        .header h1 { color: #1e293b; font-size: 24px; font-weight: 600; }
        
        .search-container { display: flex; align-items: center; gap: 15px; }
        .search-box { position: relative; min-width: 300px; }
        .search-box::before { 
            content: "🔍"; position: absolute; left: 12px; top: 50%; 
            transform: translateY(-50%); color: #64748b; 
        }
        .search-box input { 
            width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #e2e8f0; 
            border-radius: 8px; font-size: 14px; background: #f8fafc; 
            transition: all 0.3s ease; 
        }
        .search-box input:focus { 
            outline: none; border-color: #6366f1; background: white; 
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); 
        }
        
        .btn-reset, .btn-refresh { 
            padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; 
            font-size: 14px; font-weight: 500; display: flex; align-items: center; 
            gap: 8px; transition: all 0.3s ease; 
        }
        .btn-reset { background: #64748b; color: white; }
        .btn-reset:hover { background: #475569; transform: translateY(-1px); }
        .btn-refresh { background: #10b981; color: white; }
        .btn-refresh:hover { background: #059669; transform: translateY(-1px); }
        
        .loading { 
            display: none; text-align: center; padding: 20px; background: #f1f5f9; 
            border-radius: 8px; margin-bottom: 20px; color: #64748b; font-size: 16px; 
        }
        .loading.show { display: block; }
        
        .table-container { 
            background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); 
            overflow: hidden; margin-bottom: 20px; 
        }
        table { width: 100%; border-collapse: collapse; min-width: 2500px; }
        
        th { 
            background: #f1f5f9; padding: 16px 12px; text-align: left; font-size: 12px; 
            font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; 
            border-bottom: 2px solid #e2e8f0; position: sticky; top: 0; cursor: pointer; 
            user-select: none; transition: background-color 0.2s ease; 
        }
        th:hover { background: #e2e8f0; }
        th.sortable::after { content: "↕"; color: #94a3b8; font-size: 12px; }
        th.sortable:hover::after { color: #475569; }
        
        td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #475569; }
        tbody tr { transition: background-color 0.2s ease; }
        tbody tr:hover { background: #f8fafc; }
        
        .badge { 
            padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; 
            text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; 
        }
        .badge.acheter { background: #dcfce7; color: #166534; }
        .badge.conserver { background: #fef3c7; color: #92400e; }
        .badge.vendre { background: #fee2e2; color: #991b1b; }
        
        .score-high { color: #16a34a; font-weight: 600; }
        .score-medium { color: #d97706; font-weight: 600; }
        .score-low { color: #dc2626; font-weight: 600; }
        
        .positive { color: #16a34a; font-weight: 500; }
        .negative { color: #dc2626; font-weight: 500; }
        
        .table-footer { 
            display: flex; justify-content: space-between; align-items: center; 
            padding: 15px; color: #64748b; font-size: 14px; background: white; 
            border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
        }
        .last-update { font-size: 12px; color: #94a3b8; }
        
        .error { 
            background: #fef2f2; color: #dc2626; padding: 20px; border-radius: 8px; 
            text-align: center; margin-bottom: 20px; border-left: 4px solid #dc2626; 
        }
        
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .header { flex-direction: column; gap: 15px; text-align: center; }
            .search-container { width: 100%; justify-content: center; flex-wrap: wrap; }
            .search-box { min-width: 200px; }
            .table-footer { flex-direction: column; gap: 10px; text-align: center; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>📊 Analyses Financières</h1>
            <div class="search-container">
                <div class="search-box">
                    <input type="text" id="globalSearch" placeholder="Rechercher...">
                </div>
                <button id="resetFilters" class="btn-reset">🔄 Réinitialiser</button>
                <button id="refreshData" class="btn-refresh">🔃 Actualiser</button>
            </div>
        </header>

        <div class="loading" id="loading">Chargement des données...</div>

        <main class="main-content">
            <div class="table-container">
                <table id="financialTable">
                    <thead>
                        <tr>
                            <th data-column="id" class="sortable"><span>ID</span></th
