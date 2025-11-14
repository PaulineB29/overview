// =============================================================================
// VARIABLES GLOBALES
// =============================================================================
let currentData = [];
let currentPositions = [];
let sortConfig = { key: null, direction: 'asc' };

// =============================================================================
// INITIALISATION PRINCIPALE
// =============================================================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Analyse financière
    loadDataFromDB();
    setupEventListeners();
    
    // Navigation et UI
    setupNavigation();
    
    // Portefeuille
    loadPositions();
    setupPortfolioTabs();
    setupPositionModal();
    
    console.log('✅ Application initialisée avec succès');
}

// =============================================================================
// MODULE NAVIGATION
// =============================================================================
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-link-black');
    const screens = document.querySelectorAll('.screen');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetScreen = this.dataset.screen;
            
            // Désactive tous les boutons et écrans
            navButtons.forEach(btn => btn.classList.remove('active'));
            screens.forEach(screen => screen.classList.remove('active'));
            
            // Active le bouton et l'écran sélectionné
            this.classList.add('active');
            document.getElementById(targetScreen).classList.add('active');
        });
    });
}

// =============================================================================
// MODULE ANALYSE FINANCIÈRE
// =============================================================================
async function loadDataFromDB() {
    showLoading(true);
    
    try {
        const response = await fetch('https://overview-analyse.onrender.com/api/financial-data');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
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
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', function(e) {
            filterData(e.target.value);
        });
    }

    // Réinitialisation
    const resetFilters = document.getElementById('resetFilters');
    if (resetFilters) {
        resetFilters.addEventListener('click', function() {
            if (globalSearch) globalSearch.value = '';
            displayData(currentData);
        });
    }

    // Actualisation des données
    const refreshData = document.getElementById('refreshData');
    if (refreshData) {
        refreshData.addEventListener('click', function() {
            loadDataFromDB();
        });
    }

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
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="22" style="text-align: center; padding: 40px; color: #64748b;">
                    Aucune donnée trouvée
                </td>
            </tr>
        `;
        updateRowCount(0);
        return;
    }

    data.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><strong>${item.entreprise_nom || '-'}</strong></td>
            <td>${item.entreprise_symbole || '-'}</td>
            <td>${formatDate(item.date_analyse)}</td>
            <td>${item.periode}</td>
            <td class="${getColorClass(item.roe, 'high')}">${formatPercentage(item.roe)}</td>
            <td class="${getColorClass(item.netMargin, 'high')}">${formatPercentage(item.netMargin)}</td>
            <td class="${getColorClass(item.grossMargin, 'high')}">${formatPercentage(item.grossMargin)}</td>
            <td><span class="badge ${item.recommandation ? item.recommandation.toLowerCase() : ''}">${item.recommandation || '-'}</span></td>
            <td class="${getColorClass(item.sgaMargin, 'low')}">${formatPercentage(item.sgaMargin)}</td>
            <td class="${getColorClass(item.debtToEquity, 'low')}">${formatNumber(item.debtToEquity)}</td>
            <td class="${getColorClass(item.currentRatio, 'high')}">${formatNumber(item.currentRatio)}</td>
            <td class="${getColorClass(item.interestCoverage, 'high')}">${formatNumber(item.interestCoverage)}</td>
            <td class="${getColorClass(item.peRatio, 'low')}">${formatNumber(item.peRatio)}</td>
            <td class="${getColorClass(item.earningsYield, 'high')}">${formatPercentage(item.earningsYield)}</td>
            <td class="${getColorClass(item.priceToFCF, 'low')}">${formatNumber(item.priceToFCF)}</td>
            <td class="${getColorClass(item.priceToMM200, 'low')}">${formatNumber(item.priceToMM200)}</td>
            <td class="${getColorClass(item.dividendYield, 'high')}">${formatPercentage(item.dividendYield)}</td>
            <td class="${getColorClass(item.pbRatio, 'low')}">${formatNumber(item.pbRatio)}</td>
            <td class="${getColorClass(item.pegRatio, 'low')}">${formatNumber(item.pegRatio)}</td>
            <td class="${getColorClass(item.roic, 'high')}">${formatPercentage(item.roic)}</td>
            <td class="${getColorClass(item.freeCashFlow, 'high')}">${formatCurrency(item.freeCashFlow)}</td>
            <td class="${getColorClass(item.evToEbitda, 'low')}">${formatNumber(item.evToEbitda)}</td>
        `;
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

// =============================================================================
// MODULE PORTEFEUILLE - POSITIONS
// =============================================================================
function setupPortfolioTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    setupPositionsTableSorting();
}

function setupPositionModal() {
    const modal = document.getElementById('addPositionModal');
    const addBtn = document.getElementById('addPositionBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('addPositionForm');
    
    if (!modal || !addBtn) return;
    
    addBtn.addEventListener('click', function() {
        modal.classList.add('active');
        document.getElementById('purchaseDate').valueAsDate = new Date();
    });
    
    function closeModal() {
        modal.classList.remove('active');
        form.reset();
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            companyName: document.getElementById('companyName').value,
            stockSymbol: document.getElementById('stockSymbol').value.toUpperCase(),
            purchasePrice: parseFloat(document.getElementById('purchasePrice').value),
            quantity: parseInt(document.getElementById('quantity').value),
            purchaseDate: document.getElementById('purchaseDate').value
        };
        
        addNewPosition(formData);
        closeModal();
        showNotification(`Position ${formData.stockSymbol} ajoutée avec succès!`);
    });
    
    document.getElementById('companyName').addEventListener('blur', function() {
        const companyName = this.value.toLowerCase();
        const symbolField = document.getElementById('stockSymbol');
        
        const companies = {
            'apple': 'AAPL', 'microsoft': 'MSFT', 'tesla': 'TSLA',
            'google': 'GOOGL', 'amazon': 'AMZN', 'nvidia': 'NVDA', 'meta': 'META'
        };
        
        for (const [key, value] of Object.entries(companies)) {
            if (companyName.includes(key)) {
                symbolField.value = value;
                break;
            }
        }
    });
}

async function loadPositions() {
    try {
        console.log('🔄 Chargement des positions depuis API...');
        const response = await fetch('https://overview-analyse.onrender.com/api/positions');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Données reçues de l\'API:', data);

        console.log('🔍 Avant displayPositions');
        currentPositions = data;
        (currentPositions);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des positions:', error);
        console.log('🔍 Chargement des positions locales');
        console.error('Erreur lors du chargement des positions:', error);
        displayPositions(getLocalPositions());
    }
}

async function addNewPosition(positionData) {
    try {
        const response = await fetch('https://overview-analyse.onrender.com/api/positions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                entreprise_nom: positionData.companyName,
                entreprise_symbole: positionData.stockSymbol,
                prix_achat: positionData.purchasePrice,
                quantite: positionData.quantity,
                date_achat: positionData.purchaseDate
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();

        // FORCER le rechargement des positions
        await loadPositions();
        
        if (result.message && result.message.includes('non disponible')) {
            savePositionLocally(positionData);
            showNotification(`Position ${positionData.stockSymbol} ajoutée (mode local)`);
        } else {
            showNotification(`Position ${positionData.stockSymbol} ajoutée avec succès!`);
        }
        
        loadPositions();
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la position:', error);
        savePositionLocally(positionData);
        showNotification(`Position ${positionData.stockSymbol} ajoutée (mode hors ligne)`);
        loadPositions();
    }
}

function displayPositions(positions) {
    console.log('🔍 === DIAGNOSTIC AFFICHAGE POSITIONS ===');
    console.log('📊 Données reçues:', positions);
    
    // Vérifier si on est sur le bon écran
    const portfolioScreen = document.getElementById('portfolio-tracker');
    console.log('🎯 Écran portefeuille actif:', portfolioScreen.classList.contains('active'));
    
    // Vérifier les tables
    const openPositionsTable = document.querySelector('#open-positions tbody');
    const closedPositionsTable = document.querySelector('#closed-positions tbody');
    
    console.log('📋 Table ouverte trouvée:', !!openPositionsTable);
    console.log('📋 Table fermée trouvée:', !!closedPositionsTable);
    console.log('📍 Sélecteur utilisé: #open-positions tbody');
    
    if (!openPositionsTable || !closedPositionsTable) {
        console.error('❌ TABLES NON TROUVÉES - Vérifiez la structure HTML');
        
        // Lister toutes les tables disponibles pour debug
        const allTables = document.querySelectorAll('table');
        console.log('📋 Toutes les tables trouvées:', allTables.length);
        allTables.forEach((table, index) => {
            console.log(`Table ${index}:`, table.id || table.className);
        });
        
        return;
    }
    
    openPositionsTable.innerHTML = '';
    closedPositionsTable.innerHTML = '';
    
    const openPositions = positions.filter(p => p.statut === 'ouvert');
    const closedPositions = positions.filter(p => p.statut === 'ferme');

    console.log('🔵 Positions ouvertes:', openPositions);
    console.log('🔴 Positions fermées:', closedPositions);

    // Si pas de données, afficher message
    if (openPositions.length === 0 && closedPositions.length === 0) {
        const messageRow = document.createElement('tr');
        messageRow.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                Aucune position trouvée
            </td>
        `;
        openPositionsTable.appendChild(messageRow);
        console.log('ℹ️ Aucune position à afficher');
        return;
    }
    
    // Positions ouvertes
    openPositions.forEach(position => {
        console.log(`🔄 Traitement position ouverte ${index + 1}:`, position);

     try {
        const currentPrice = getCurrentPrice(position.entreprise_symbole);
        const prixAchat = parseFloat(position.prix_achat); 
        const quantite = parseInt(position.quantite); 
        
        const totalValue = currentPrice * quantite;
        const totalCost = prixAchat * quantite;
        const gainLoss = totalValue - totalCost;
        const gainLossPercent = totalCost !== 0 ? (gainLoss / totalCost) * 100 : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>
                    <div class="stock-info-compact">
                        <span class="stock-symbol">${position.entreprise_symbole}</span>
                        <span class="stock-name">${position.entreprise_nom}</span>
                    </div>
                </td>
                <td>${position.entreprise_symbole}</td>
                <td>€${currentPrice.toFixed(2)}</td>
                <td>${quantite}</td>
                <td>€${totalValue.toFixed(2)}</td>
                <td>€${prixAchat.toFixed(2)}</td>
                <td class="${gainLoss >= 0 ? 'positive' : 'negative'}">
                    ${gainLoss >= 0 ? '+' : ''}€${gainLoss.toFixed(2)} (${gainLoss >= 0 ? '+' : ''}${gainLossPercent.toFixed(1)}%)
                </td>
            `;
            openPositionsTable.appendChild(row);
            console.log(`✅ ${position.entreprise_symbole} ajoutée`);
            
        } catch (error) {
            console.error(`❌ Erreur sur ${position.entreprise_symbole}:`, error);
        }
    });
    
    // Positions fermées
    closedPositions.forEach((position, index) => {
        console.log(`🔄 Position fermée ${index + 1}:`, position);
        
        try {
        const prixAchat = parseFloat(position.prix_achat); 
        const prixVente = parseFloat(position.prix_vente); 
        const quantite = parseInt(position.quantite); 
        
        const totalCost = prixAchat * quantite;
        const totalValue = prixVente * quantite;
        const gainLoss = totalValue - totalCost;
        const gainLossPercent = totalCost !== 0 ? (gainLoss / totalCost) * 100 : 0;
        const duration = calculateDuration(position.date_achat, position.date_vente);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="stock-info-compact">
                    <span class="stock-symbol">${position.entreprise_symbole}</span>
                    <span class="stock-name">${position.entreprise_nom}</span>
                </div>
            </td>
            <td>${position.entreprise_symbole}</td>
            <td>€${position.prix_achat.toFixed(2)}</td>
            <td>€${position.prix_vente.toFixed(2)}</td>
            <td>${position.quantite}</td>
            <td>${duration}</td>
            <td class="${gainLoss >= 0 ? 'positive' : 'negative'}">
                ${gainLoss >= 0 ? '+' : ''}€${gainLoss.toFixed(2)} (${gainLoss >= 0 ? '+' : ''}${gainLossPercent.toFixed(1)}%)
            </td>
        `;
        closedPositionsTable.appendChild(row);
        console.log(`✅ ${position.entreprise_symbole} (fermée) ajoutée`);
                
            } catch (error) {
                console.error(`❌ Erreur sur position fermée ${position.entreprise_symbole}:`, error);
            }
        });
        console.log('🎉 AFFICHAGE TERMINÉ');
}

// =============================================================================
// MODULE UTILITAIRES
// =============================================================================
function getColorClass(value, type) {
    if (value === null || value === undefined) return '';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    if (type === 'high') {
        if (numValue > 0) return 'positive';
        if (numValue < 0) return 'negative';
    } else if (type === 'low') {
        if (numValue < 0) return 'positive';
        if (numValue > 0) return 'negative';
    }
    
    return '';
}

function updateRowCount(count) {
    const rowCountElement = document.getElementById('rowCount');
    if (rowCountElement) {
        rowCountElement.textContent = count;
    }
}

function updateLastUpdate() {
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `Dernière mise à jour: ${now.toLocaleTimeString('fr-FR')}`;
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        if (show) {
            loading.classList.add('show');
        } else {
            loading.classList.remove('show');
        }
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
        errorDiv.innerHTML = `⚠️ ${message}`;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.prepend(errorDiv);
        }
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
}

function formatPercentage(value) {
    if (value === null || value === undefined) return '-';
    try {
        const numberValue = parseFloat(value);
        if (isNaN(numberValue)) return '-';
        return `${numberValue.toFixed(2)}%`;
    } catch (error) {
        return '-';
    }
}

function formatNumber(value) {
    if (value === null || value === undefined) return '-';
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) return '-';
    return numberValue.toFixed(2);
}

function formatCurrency(value) {
    if (value === null || value === undefined) return '-';
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) return '-';
    
    if (numberValue >= 1000000) {
        return `€${(numberValue / 1000000).toFixed(1)}M`;
    } else if (numberValue >= 1000) {
        return `€${(numberValue / 1000).toFixed(1)}K`;
    }
    return `€${numberValue.toFixed(0)}`;
}

// =============================================================================
// UTILITAIRES PORTEFEUILLE
// =============================================================================
function getLocalPositions() {
    return JSON.parse(localStorage.getItem('portfolioPositions')) || [];
}

function savePositionLocally(positionData) {
    const positions = getLocalPositions();
    const newPosition = {
        id: Date.now(),
        entreprise_nom: positionData.companyName,
        entreprise_symbole: positionData.stockSymbol,
        prix_achat: positionData.purchasePrice,
        quantite: positionData.quantity,
        date_achat: positionData.purchaseDate,
        statut: 'ouvert',
        date_ajout: new Date().toISOString()
    };
    positions.push(newPosition);
    localStorage.setItem('portfolioPositions', JSON.stringify(positions));
}

function getCurrentPrice(symbol) {
    const mockPrices = {
        'AAPL': 171.80, 'MSFT': 321.80, 'TSLA': 199.10,
        'GOOGL': 142.50, 'NVDA': 555.00, 'AMZN': 146.50, 'META': 298.25
    };
    return mockPrices[symbol] || 100.00;
}

function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return `${months} mois`;
}

function setupPositionsTableSorting() {
    document.querySelectorAll('.positions-table th.sortable').forEach(th => {
        th.addEventListener('click', function() {
            const table = this.closest('table');
            const column = this.dataset.column;
            const isNumeric = ['prix', 'quantite', 'valeur', 'prixAchat', 'gains', 'prixVente'].includes(column);
            
            sortTable(table, column, isNumeric);
        });
    });
}

function sortTable(table, column, isNumeric) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const header = table.querySelector(`th[data-column="${column}"]`);
    const isAscending = !header.classList.contains('asc');
    
    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('asc', 'desc');
    });
    
    header.classList.add(isAscending ? 'asc' : 'desc');
    
    rows.sort((a, b) => {
        let aValue = a.querySelector(`td:nth-child(${getColumnIndex(header)})`).textContent;
        let bValue = b.querySelector(`td:nth-child(${getColumnIndex(header)})`).textContent;
        
        if (isNumeric) {
            aValue = extractNumber(aValue);
            bValue = extractNumber(bValue);
        }
        
        if (aValue < bValue) return isAscending ? -1 : 1;
        if (aValue > bValue) return isAscending ? 1 : -1;
        return 0;
    });
    
    rows.forEach(row => tbody.appendChild(row));
}

function getColumnIndex(header) {
    return Array.from(header.parentNode.children).indexOf(header) + 1;
}

function extractNumber(str) {
    const match = str.match(/[-+]?€?([0-9]*[.,]?[0-9]+)/);
    return match ? parseFloat(match[1].replace(',', '.')) : 0;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span>✅</span>
            ${message}
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Styles pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
