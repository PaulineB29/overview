// Données d'exemple complètes avec toutes les colonnes
const sampleData = [
    {
        id: 1,
        entreprise_id: "AAPL",
        date_analyse: "2024-01-15",
        periode: "T4 2023",
        roe: "15.2%",
        netMargin: "12.5%",
        grossMargin: "45.3%",
        recommandation: "Acheter",
        created_at: "2024-01-16 10:30:00",
        sgaMargin: "18.2%",
        debtToEquity: "0.45",
        currentRatio: "2.1",
        interestCoverage: "8.5",
        peRatio: "18.3",
        earningsYield: "5.5%",
        priceToFCF: "15.2",
        priceToMM200: "1.05",
        dividendYield: "2.8%",
        pbRatio: "2.1",
        pegRatio: "1.2",
        roic: "12.8%",
        freeCashFlow: "125M",
        evToEbitda: "10.5",
        score_global: "78/100",
        points_forts: "Croissance stable, Dividende fiable, Trésorerie solide",
        points_faibles: "Dette élevée, Concurrence forte dans le secteur tech"
    },
    {
        id: 2,
        entreprise_id: "MSFT",
        date_analyse: "2024-01-14",
        periode: "T4 2023",
        roe: "8.7%",
        netMargin: "8.1%",
        grossMargin: "32.1%",
        recommandation: "Conserver",
        created_at: "2024-01-15 14:20:00",
        sgaMargin: "22.5%",
        debtToEquity: "0.78",
        currentRatio: "1.4",
        interestCoverage: "4.2",
        peRatio: "22.1",
        earningsYield: "4.5%",
        priceToFCF: "18.7",
        priceToMM200: "0.95",
        dividendYield: "1.2%",
        pbRatio: "1.8",
        pegRatio: "1.8",
        roic: "9.2%",
        freeCashFlow: "89M",
        evToEbitda: "12.8",
        score_global: "65/100",
        points_forts: "Position marché forte, Innovation cloud, Diversification",
        points_faibles: "Marge en baisse, Pressions réglementaires croissantes"
    },
    {
        id: 3,
        entreprise_id: "TSLA",
        date_analyse: "2024-01-13",
        periode: "T4 2023",
        roe: "22.1%",
        netMargin: "15.8%",
        grossMargin: "28.4%",
        recommandation: "Acheter",
        created_at: "2024-01-14 09:15:00",
        sgaMargin: "15.3%",
        debtToEquity: "0.32",
        currentRatio: "3.2",
        interestCoverage: "12.5",
        peRatio: "45.2",
        earningsYield: "2.2%",
        priceToFCF: "28.4",
        priceToMM200: "1.25",
        dividendYield: "0.0%",
        pbRatio: "8.5",
        pegRatio: "2.1",
        roic: "18.7%",
        freeCashFlow: "156M",
        evToEbitda: "35.2",
        score_global: "82/100",
        points_forts: "Innovation technologique, Croissance rapide, Leadership EVs",
        points_faibles: "Volatilité élevée, Concurrence accrue dans les véhicules électriques"
    },
    {
        id: 4,
        entreprise_id: "GOOGL",
        date_analyse: "2024-01-12",
        periode: "T4 2023",
        roe: "18.5%",
        netMargin: "21.3%",
        grossMargin: "58.7%",
        recommandation: "Acheter",
        created_at: "2024-01-13 11:45:00",
        sgaMargin: "12.8%",
        debtToEquity: "0.25",
        currentRatio: "2.8",
        interestCoverage: "15.2",
        peRatio: "25.8",
        earningsYield: "3.9%",
        priceToFCF: "20.1",
        priceToMM200: "1.12",
        dividendYield: "0.0%",
        pbRatio: "5.2",
        pegRatio: "1.4",
        roic: "15.3%",
        freeCashFlow: "89M",
        evToEbitda: "18.4",
        score_global: "85/100",
        points_forts: "Dominance du marché publicitaire, Trésorerie solide, Données massives",
        points_faibles: "Régulation antitrust, Dépendance à la publicité, Concurrence cloud"
    }
];

// État global
let currentData = [...sampleData];
let sortConfig = { key: null, direction: 'asc' };
let currentView = 'table';
let columnFilters = {};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    displayData(currentData);
    setupEventListeners();
    updateStats();
}

function setupEventListeners() {
    // Recherche globale
    document.getElementById('globalSearch').addEventListener('input', function(e) {
        filterGlobalData(e.target.value);
    });

    // Filtres par colonne
    document.querySelectorAll('.column-filter').forEach(filter => {
        filter.addEventListener('input', function(e) {
            const columnName = this.dataset.column;
            if (e.target.value) {
                columnFilters[columnName] = e.target.value.toLowerCase();
            } else {
                delete columnFilters[columnName];
            }
            applyFilters();
        });
    });

    // Réinitialisation
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('globalSearch').value = '';
        document.querySelectorAll('.column-filter').forEach(filter => {
            filter.value = '';
        });
        currentData = [...sampleData];
        columnFilters = {};
        displayData(currentData);
        updateStats();
    });

    // Changement de vue
    document.querySelectorAll('.view-option').forEach(btn => {
        btn.addEventListener('click', function() {
            switchView(this.dataset.view);
        });
    });

    // Tri des colonnes
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', function() {
            sortData(this.dataset.column);
        });
    });

    // Modal
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('detailModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

function switchView(view) {
    currentView = view;
    
    // Mettre à jour les boutons de vue
    document.querySelectorAll('.view-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Afficher/masquer les vues
    document.getElementById('tableView').classList.toggle('hidden', view !== 'table');
    document.getElementById('cardsView').classList.toggle('hidden', view !== 'cards');
    
    // Régénérer l'affichage
    displayData(currentData);
}

function displayData(data) {
    if (currentView === 'table') {
        displayTableView(data);
    } else {
        displayCardsView(data);
    }
    updateRowCount(data.length);
}

function displayTableView(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        const score = parseInt(item.score_global);
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td><strong>${item.entreprise_id}</strong></td>
            <td>${formatDate(item.date_analyse)}</td>
            <td>${item.periode}</td>
            <td class="text-positive">${item.roe}</td>
            <td class="text-positive">${item.netMargin}</td>
            <td class="text-positive">${item.grossMargin}</td>
            <td><span class="badge ${item.recommandation.toLowerCase()}">${item.recommandation}</span></td>
            <td>${formatDateTime(item.created_at)}</td>
            <td>${item.sgaMargin}</td>
            <td>${item.debtToEquity}</td>
            <td class="text-positive">${item.currentRatio}</td>
            <td class="text-positive">${item.interestCoverage}</td>
            <td>${item.peRatio}</td>
            <td>${item.earningsYield}</td>
            <td>${item.priceToFCF}</td>
            <td>${item.priceToMM200}</td>
            <td>${item.dividendYield}</td>
            <td>${item.pbRatio}</td>
            <td>${item.pegRatio}</td>
            <td class="text-positive">${item.roic}</td>
            <td class="text-positive">${item.freeCashFlow}</td>
            <td>${item.evToEbitda}</td>
            <td><span class="score ${getScoreClass(score)}">${item.score_global}</span></td>
            <td class="text-neutral">${truncateText(item.points_forts, 30)}</td>
            <td class="text-neutral">${truncateText(item.points_faibles, 30)}</td>
            <td>
                <button class="btn-icon secondary" onclick="showDetails(${item.id})" title="Voir les détails">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function displayCardsView(data) {
    const cardsBody = document.getElementById('cardsBody');
    cardsBody.innerHTML = '';

    data.forEach(item => {
        const score = parseInt(item.score_global);
        const card = document.createElement('div');
        card.className = 'company-card';
        
        card.innerHTML = `
            <div class="card-header">
                <div class="company-info">
                    <h3>${item.entreprise_id}</h3>
                    <div class="company-meta">${item.periode} • ${formatDate(item.date_analyse)}</div>
                </div>
                <div class="card-badges">
                    <span class="badge ${item.recommandation.toLowerCase()}">${item.recommandation}</span>
                </div>
            </div>
            
            <div class="card-score">
                <span class="score ${getScoreClass(score)}">Score: ${item.score_global}</span>
            </div>
            
            <div class="card-stats">
                <div class="stat">
                    <span class="stat-value text-positive">${item.roe}</span>
                    <span class="stat-label">ROE</span>
                </div>
                <div class="stat">
                    <span class="stat-value text-positive">${item.netMargin}</span>
                    <span class="stat-label">Marge Nette</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${item.peRatio}</span>
                    <span class="stat-label">P/E Ratio</span>
                </div>
                <div class="stat">
                    <span class="stat-value text-positive">${item.freeCashFlow}</span>
                    <span class="stat-label">Free Cash Flow</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${item.debtToEquity}</span>
                    <span class="stat-label">Dette/Capitaux</span>
                </div>
                <div class="stat">
                    <span class="stat-value text-positive">${item.roic}</span>
                    <span class="stat-label">ROIC</span>
                </div>
            </div>
            
            <div class="card-summary">
                <div style="font-size: 0.875rem; color: #64748b;">
                    <strong>Points forts:</strong> ${truncateText(item.points_forts, 80)}
                </div>
            </div>
            
            <div class="card-actions">
                <button class="btn-icon" onclick="showDetails(${item.id})">
                    <i class="fas fa-chart-bar"></i>
                    Voir détails complets
                </button>
            </div>
        `;
        cardsBody.appendChild(card);
    });
}

function filterGlobalData(searchTerm) {
    if (!searchTerm) {
        currentData = [...sampleData];
    } else {
        const term = searchTerm.toLowerCase();
        currentData = sampleData.filter(item => 
            Object.values(item).some(value => 
                value.toString().toLowerCase().includes(term)
            )
        );
    }
    applyFilters();
}

function applyFilters() {
    let filteredData = [...sampleData];

    // Appliquer la recherche globale
    const globalSearch = document.getElementById('globalSearch').value.toLowerCase();
    if (globalSearch) {
        filteredData = filteredData.filter(item => 
            Object.values(item).some(value => 
                value.toString().toLowerCase().includes(globalSearch)
            )
        );
    }

    // Appliquer les filtres par colonne
    Object.keys(columnFilters).forEach(columnName => {
        const filterValue = columnFilters[columnName];
        if (filterValue) {
            filteredData = filteredData.filter(item => {
                const cellValue = item[columnName]?.toString().toLowerCase() || '';
                return cellValue.includes(filterValue);
            });
        }
    });

    currentData = filteredData;
    displayData(currentData);
    updateStats();
}

function sortData(key) {
    if (sortConfig.key === key) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.key = key;
        sortConfig.direction = 'asc';
    }

    currentData.sort((a, b) => {
        let aValue = a[key];
        let bValue = b[key];

        // Conversion pour le tri numérique
        if (['roe', 'netMargin', 'grossMargin', 'sgaMargin', 'earningsYield', 'dividendYield', 'roic'].includes(key)) {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
        } else if (key === 'score_global') {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
        } else if (['debtToEquity', 'currentRatio', 'interestCoverage', 'peRatio', 'priceToFCF', 'priceToMM200', 'pbRatio', 'pegRatio', 'evToEbitda'].includes(key)) {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    displayData(currentData);
}

function showDetails(id) {
    const item = sampleData.find(d => d.id === id);
    if (!item) return;

    document.getElementById('modalTitle').textContent = `Analyse détaillée - ${item.entreprise_id}`;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div style="display: grid; gap: 2rem;">
            <!-- En-tête -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; background: #f8fafc; padding: 1.5rem; border-radius: 0.5rem;">
                <div class="stat">
                    <span class="stat-label">Score Global</span>
                    <span class="stat-value" style="font-size: 1.5rem;">${item.score_global}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Recommandation</span>
                    <span class="badge ${item.recommandation.toLowerCase()}" style="font-size: 1rem;">${item.recommandation}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Période</span>
                    <span class="stat-value">${item.periode}</span>
                </div>
            </div>

            <!-- Rentabilité -->
            <div>
                <h4 style="margin-bottom: 1rem; font-size: 1rem; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">RENTABILITÉ</h4>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                    <div class="stat">
                        <span class="stat-label">ROE</span>
                        <span class="stat-value text-positive">${item.roe}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Marge Nette</span>
                        <span class="stat-value text-positive">${item.netMargin}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Marge Brute</span>
                        <span class="stat-value text-positive">${item.grossMargin}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">ROIC</span>
                        <span class="stat-value text-positive">${item.roic}</span>
                    </div>
                </div>
            </div>

            <!-- Valorisation -->
            <div>
                <h4 style="margin-bottom: 1rem; font-size: 1rem; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">VALORISATION</h4>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                    <div class="stat">
                        <span class="stat-label">P/E Ratio</span>
                        <span class="stat-value">${item.peRatio}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">P/B Ratio</span>
                        <span class="stat-value">${item.pbRatio}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">PEG Ratio</span>
                        <span class="stat-value">${item.pegRatio}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">EV/EBITDA</span>
                        <span class="stat-value">${item.evToEbitda}</span>
                    </div>
                </div>
            </div>

            <!-- Santé financière -->
            <div>
                <h4 style="margin-bottom: 1rem; font-size: 1rem; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">SANTÉ FINANCIÈRE</h4>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                    <div class="stat">
                        <span class="stat-label">Dette/Capitaux</span>
                        <span class="stat-value">${item.debtToEquity}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Ratio Courant</span>
                        <span class="stat-value text-positive">${item.currentRatio}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Couverture Intérêts</span>
                        <span class="stat-value text-positive">${item.interestCoverage}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Free Cash Flow</span>
                        <span class="stat-value text-positive">${item.freeCashFlow}</span>
                    </div>
                </div>
            </div>

            <!-- Points forts et faibles -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div>
                    <h4 style="margin-bottom: 0.75rem; font-size: 0.875rem; color: #64748b;">POINTS FORTS</h4>
                    <div style="background: #f0f9ff; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #0ea5e9;">
                        <div style="font-size: 0.875rem; color: #0369a1;">${item.points_forts}</div>
                    </div>
                </div>
                <div>
                    <h4 style="margin-bottom: 0.75rem; font-size: 0.875rem; color: #64748b;">POINTS FAIBLES</h4>
                    <div style="background: #fef2f2; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #ef4444;">
                        <div style="font-size: 0.875rem; color: #dc2626;">${item.points_faibles}</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('detailModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

function updateStats() {
    const total = currentData.length;
    const buy = currentData.filter(d => d.recommandation === 'Acheter').length;
    const hold = currentData.filter(d => d.recommandation === 'Conserver').length;
    const avgScore = currentData.length > 0 
        ? (currentData.reduce((sum, d) => sum + parseInt(d.score_global), 0) / currentData.length).toFixed(1)
        : '0.0';

    document.getElementById('totalCompanies').textContent = total;
    document.getElementById('buyRecommendations').textContent = buy;
    document.getElementById('holdRecommendations').textContent = hold;
    document.getElementById('avgScore').textContent = avgScore;
}

function updateRowCount(count) {
    document.getElementById('rowCount').textContent = `${count} résultat${count !== 1 ? 's' : ''}`;
}

function getScoreClass(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
}

function formatDateTime(dateTimeString) {
    return new Date(dateTimeString).toLocaleString('fr-FR');
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Export pour la console
window.addFinancialData = function(newData) {
    sampleData.push(newData);
    currentData.push(newData);
    displayData(currentData);
    updateStats();
    return `Nouvelle donnée ajoutée. Total: ${sampleData.length} enregistrements`;
};

window.getFinancialData = function() {
    return currentData;
};
