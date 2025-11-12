const express = require('express');
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
                            <th data-column="id" class="sortable"><span>ID</span></th>
                            <th data-column="entreprise_id" class="sortable"><span>Entreprise ID</span></th>
                            <th data-column="date_analyse" class="sortable"><span>Date Analyse</span></th>
                            <th data-column="periode" class="sortable"><span>Période</span></th>
                            <th data-column="roe" class="sortable"><span>ROE</span></th>
                            <th data-column="netmargin" class="sortable"><span>Marge Nette</span></th>
                            <th data-column="grossmargin" class="sortable"><span>Marge Brute</span></th>
                            <th data-column="recommandation" class="sortable"><span>Recommandation</span></th>
                            <th data-column="created_at" class="sortable"><span>Créé le</span></th>
                            <th data-column="sgamargin" class="sortable"><span>Marge SGA</span></th>
                            <th data-column="debttoequity" class="sortable"><span>Dette/Capitaux</span></th>
                            <th data-column="currentratio" class="sortable"><span>Ratio Courant</span></th>
                            <th data-column="interestcoverage" class="sortable"><span>Couverture Intérêts</span></th>
                            <th data-column="peratio" class="sortable"><span>P/E Ratio</span></th>
                            <th data-column="earningsyield" class="sortable"><span>Rendement</span></th>
                            <th data-column="pricetofcf" class="sortable"><span>Price/FCF</span></th>
                            <th data-column="pricetomm200" class="sortable"><span>Price/MM200</span></th>
                            <th data-column="dividendyield" class="sortable"><span>Dividend Yield</span></th>
                            <th data-column="pbratio" class="sortable"><span>P/B Ratio</span></th>
                            <th data-column="pegratio" class="sortable"><span>PEG Ratio</span></th>
                            <th data-column="roic" class="sortable"><span>ROIC</span></th>
                            <th data-column="freecashflow" class="sortable"><span>Free Cash Flow</span></th>
                            <th data-column="evtoebitda" class="sortable"><span>EV/EBITDA</span></th>
                            <th data-column="score_global" class="sortable"><span>Score Global</span></th>
                            <th data-column="points_forts" class="sortable"><span>Points Forts</span></th>
                            <th data-column="points_faibles" class="sortable"><span>Points Faibles</span></th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        <!-- Les données seront chargées ici depuis la BDD -->
                    </tbody>
                </table>
            </div>
            
            <div class="table-footer">
                <span id="rowCount">0</span> résultats affichés
                <span class="last-update" id="lastUpdate"></span>
            </div>
        </main>
    </div>

    <script>
        let currentData = [];
        let sortConfig = { key: null, direction: 'asc' };

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            loadDataFromDB();
            setupEventListeners();
        });

        async function loadDataFromDB() {
            showLoading(true);
            
            try {
                const response = await fetch('/api/financial-data');
                if (!response.ok) {
                    throw new Error(\`Erreur HTTP: \${response.status}\`);
                }
                
                const data = await response.json();
                currentData = data;
                displayData(currentData);
                showError(null);
                
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
                showError('Erreur de connexion à la base de données. Vérifiez que le serveur est correctement configuré.');
            } finally {
                showLoading(false);
            }
        }

        function setupEventListeners() {
            // Recherche globale
            document.getElementById('globalSearch').addEventListener('input', function(e) {
                filterData(e.target.value);
            });

            // Réinitialisation
            document.getElementById('resetFilters').addEventListener('click', function() {
                document.getElementById('globalSearch').value = '';
                displayData(currentData);
            });

            // Actualisation des données
            document.getElementById('refreshData').addEventListener('click', function() {
                loadDataFromDB();
            });

            // Tri des colonnes
            document.querySelectorAll('th.sortable').forEach(th => {
                th.addEventListener('click', function() {
                    const column = this.dataset.column;
                    sortData(column);
                });
            });
        }

        function displayData(data) {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = \`
                    <tr>
                        <td colspan="26" style="text-align: center; padding: 40px; color: #64748b;">
                            Aucune donnée trouvée
                        </td>
                    </tr>
                \`;
                updateRowCount(0);
                return;
            }

            data.forEach(item => {
                const row = document.createElement('tr');
                
                row.innerHTML = \`
                    <td>\${item.id}</td>
                    <td><strong>\${item.entreprise_id}</strong></td>
                    <td>\${formatDate(item.date_analyse)}</td>
                    <td>\${item.periode}</td>
                    <td class="positive">\${formatPercentage(item.roe)}</td>
                    <td class="positive">\${formatPercentage(item.netmargin)}</td>
                    <td class="positive">\${formatPercentage(item.grossmargin)}</td>
                    <td><span class="badge \${item.recommandation.toLowerCase()}">\${item.recommandation}</span></td>
                    <td>\${formatDateTime(item.created_at)}</td>
                    <td>\${formatPercentage(item.sgamargin)}</td>
                    <td>\${formatNumber(item.debttoequity)}</td>
                    <td class="positive">\${formatNumber(item.currentratio)}</td>
                    <td class="positive">\${formatNumber(item.interestcoverage)}</td>
                    <td>\${formatNumber(item.peratio)}</td>
                    <td>\${formatPercentage(item.earningsyield)}</td>
                    <td>\${formatNumber(item.pricetofcf)}</td>
                    <td>\${formatNumber(item.pricetomm200)}</td>
                    <td>\${formatPercentage(item.dividendyield)}</td>
                    <td>\${formatNumber(item.pbratio)}</td>
                    <td>\${formatNumber(item.pegratio)}</td>
                    <td class="positive">\${formatPercentage(item.roic)}</td>
                    <td class="positive">\${formatCurrency(item.freecashflow)}</td>
                    <td>\${formatNumber(item.evtoebitda)}</td>
                    <td><span class="\${getScoreClass(item.score_global)}">\${item.score_global}/100</span></td>
                    <td title="\${item.points_forts}">\${truncateText(item.points_forts, 40)}</td>
                    <td title="\${item.points_faibles}">\${truncateText(item.points_faibles, 40)}</td>
                \`;
                tbody.appendChild(row);
            });

            updateRowCount(data.length);
            updateLastUpdate();
        }

        function filterData(searchTerm) {
            if (!searchTerm) {
                displayData(currentData);
                return;
            }

            const term = searchTerm.toLowerCase();
            const filteredData = currentData.filter(item => 
                Object.values(item).some(value => 
                    value !== null && value.toString().toLowerCase().includes(term)
                )
            );
            displayData(filteredData);
        }

        function sortData(key) {
            if (sortConfig.key === key) {
                sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortConfig.key = key;
                sortConfig.direction = 'asc';
            }

            const sortedData = [...currentData].sort((a, b) => {
                let aValue = a[key];
                let bValue = b[key];

                // Gestion des valeurs null
                if (aValue === null) aValue = sortConfig.direction === 'asc' ? -Infinity : Infinity;
                if (bValue === null) bValue = sortConfig.direction === 'asc' ? -Infinity : Infinity;

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });

            displayData(sortedData);
        }

        function updateRowCount(count) {
            document.getElementById('rowCount').textContent = count;
        }

        function updateLastUpdate() {
            const now = new Date();
            document.getElementById('lastUpdate').textContent = \`Dernière mise à jour: \${now.toLocaleTimeString('fr-FR')}\`;
        }

        function showLoading(show) {
            const loading = document.getElementById('loading');
            if (show) {
                loading.classList.add('show');
            } else {
                loading.classList.remove('show');
            }
        }

        function showError(message) {
            const existingError = document.querySelector('.error');
            if (existingError) {
                existingError.remove();
            }

            if (message) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error';
                errorDiv.innerHTML = \`
                    ⚠️ \${message}
                \`;
                document.querySelector('.main-content').prepend(errorDiv);
            }
        }

        function getScoreClass(score) {
            if (score >= 80) return 'score-high';
            if (score >= 60) return 'score-medium';
            return 'score-low';
        }

        function formatDate(dateString) {
            if (!dateString) return '-';
            return new Date(dateString).toLocaleDateString('fr-FR');
        }

        function formatDateTime(dateTimeString) {
            if (!dateTimeString) return '-';
            return new Date(dateTimeString).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function formatPercentage(value) {
            if (value === null || value === undefined) return '-';
            return \`\${value}%\`;
        }

        function formatNumber(value) {
            if (value === null || value === undefined) return '-';
            return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        function formatCurrency(value) {
            if (value === null || value === undefined) return '-';
            if (value >= 1000000) {
                return \`€\${(value / 1000000).toFixed(1)}M\`;
            } else if (value >= 1000) {
                return \`€\${(value / 1000).toFixed(1)}K\`;
            }
            return \`€\${value.toLocaleString('fr-FR')}\`;
        }

        function truncateText(text, maxLength) {
            if (!text) return '-';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        }
    </script>
</body>
</html>
    \`);
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(\`🚀 Serveur démarré sur le port \${port}\`);
    console.log(\`📊 Tableau disponible sur: http://localhost:\${port}\`);
});
