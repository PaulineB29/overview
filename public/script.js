let currentData = [];
let sortConfig = { key: null, direction: 'asc' };

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromDB();
    loadPositions();
    setupEventListeners();
    setupNavigation();
    setupPortfolioTabs();
    setupPositionModal(); 
});

// Gestion de la navigation entre écrans
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

// Gestion des tabs du portefeuille
function setupPortfolioTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Désactive tous les boutons et contenus
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Active le bouton et le contenu sélectionné
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Initialiser le tri des tableaux
    setupPositionsTableSorting();
}

// Gestion de la popup d'ajout de position
function setupPositionModal() {
    const modal = document.getElementById('addPositionModal');
    const addBtn = document.getElementById('addPositionBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('addPositionForm');
    
    // Ouvrir la popup
    addBtn.addEventListener('click', function() {
        modal.classList.add('show');
        document.getElementById('purchaseDate').valueAsDate = new Date(); // Date du jour par défaut
    });
    
    // Fermer la popup
    function closeModal() {
        modal.classList.remove('show');
        form.reset();
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Fermer en cliquant en dehors
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            companyName: document.getElementById('companyName').value,
            stockSymbol: document.getElementById('stockSymbol').value.toUpperCase(),
            purchasePrice: parseFloat(document.getElementById('purchasePrice').value),
            quantity: parseInt(document.getElementById('quantity').value),
            purchaseDate: document.getElementById('purchaseDate').value
        };
        
        // Ici vous pouvez ajouter la logique pour sauvegarder la position
        addNewPosition(formData);
        closeModal();
        
        // Message de confirmation
        showNotification(`Position ${formData.stockSymbol} ajoutée avec succès!`);
    });
    
    // Auto-remplir le symbole si on saisit un nom connu
    document.getElementById('companyName').addEventListener('blur', function() {
        const companyName = this.value.toLowerCase();
        const symbolField = document.getElementById('stockSymbol');
        
        // Quelques exemples de correspondances
        const companies = {
            'apple': 'AAPL',
            'microsoft': 'MSFT',
            'tesla': 'TSLA',
            'google': 'GOOGL',
            'amazon': 'AMZN',
            'nvidia': 'NVDA',
            'meta': 'META'
        };
        
        for (const [key, value] of Object.entries(companies)) {
            if (companyName.includes(key)) {
                symbolField.value = value;
                break;
            }
        }
    });
}

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
    if (!tbody) return; // Protection si l'élément n'existe pas
    
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
    document.getElementById('lastUpdate').textContent = `Dernière mise à jour: ${now.toLocaleTimeString('fr-FR')}`;
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
        errorDiv.innerHTML = `
            ⚠️ ${message}
        `;
        document.querySelector('.main-content').prepend(errorDiv);
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

// FONCTIONS POUR LES POSITIONS (NOUVELLES FONCTIONNALITÉS)
function loadPositions() {
    const positions = getLocalPositions();
    currentPositions = positions;
    displayPositions(currentPositions);
}

function addNewPosition(positionData) {
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
    
    // Recharger et afficher les positions
    loadPositions();
}

function displayPositions(positions) {
    const openPositionsTable = document.querySelector('#open-positions tbody');
    const closedPositionsTable = document.querySelector('#closed-positions tbody');
    
    if (!openPositionsTable || !closedPositionsTable) return;
    
    // Vider les tableaux
    openPositionsTable.innerHTML = '';
    closedPositionsTable.innerHTML = '';
    
    const openPositions = positions.filter(p => p.statut === 'ouvert');
    const closedPositions = positions.filter(p => p.statut === 'ferme');
    
    // Positions ouvertes
    openPositions.forEach(position => {
        const currentPrice = getCurrentPrice(position.entreprise_symbole);
        const totalValue = currentPrice * position.quantite;
        const totalCost = position.prix_achat * position.quantite;
        const gainLoss = totalValue - totalCost;
        const gainLossPercent = (gainLoss / totalCost) * 100;
        
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
            <td>${position.quantite}</td>
            <td>€${totalValue.toFixed(2)}</td>
            <td>€${position.prix_achat.toFixed(2)}</td>
            <td class="${gainLoss >= 0 ? 'positive' : 'negative'}">
                ${gainLoss >= 0 ? '+' : ''}€${gainLoss.toFixed(2)} (${gainLoss >= 0 ? '+' : ''}${gainLossPercent.toFixed(1)}%)
            </td>
        `;
        openPositionsTable.appendChild(row);
    });
    
    // Positions fermées
    closedPositions.forEach(position => {
        const totalCost = position.prix_achat * position.quantite;
        const totalValue = position.prix_vente * position.quantite;
        const gainLoss = totalValue - totalCost;
        const gainLossPercent = (gainLoss / totalCost) * 100;
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
    });
}

function getLocalPositions() {
    return JSON.parse(localStorage.getItem('portfolioPositions')) || [];
}

function getCurrentPrice(symbol) {
    // Prix fictifs pour la démo
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

// Tri des colonnes du tableau des positions
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
    
    // Reset other headers
    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('asc', 'desc');
    });
    
    // Set current header
    header.classList.add(isAscending ? 'asc' : 'desc');
    
    rows.sort((a, b) => {
        let aValue = a.querySelector(`td:nth-child(${getColumnIndex(header)})`).textContent;
        let bValue = b.querySelector(`td:nth-child(${getColumnIndex(header)})`).textContent;
        
        if (isNumeric) {
            // Extraire les nombres des chaînes (pour les gains/pertes)
            aValue = extractNumber(aValue);
            bValue = extractNumber(bValue);
        }
        
        if (aValue < bValue) return isAscending ? -1 : 1;
        if (aValue > bValue) return isAscending ? 1 : -1;
        return 0;
    });
    
    // Réorganiser les rows
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
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span>✅</span>
            ${message}
        </div>
    `;
    
    // Styles pour la notification
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
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Ajouter ces keyframes pour l'animation de notification
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
