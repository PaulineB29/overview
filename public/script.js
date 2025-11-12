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
            <td class="positive">${formatPercentage(item.roe)}</td>
            <td class="positive">${formatPercentage(item.netMargin)}</td>
            <td class="positive">${formatPercentage(item.grossMargin)}</td>
            <td><span class="badge ${item.recommandation.toLowerCase()}">${item.recommandation}</span></td>
            <td>${formatPercentage(item.sgaMargin)}</td>
            <td>${formatNumber(item.debtToEquity)}</td>
            <td class="positive">${formatNumber(item.currentRatio)}</td>
            <td class="positive">${formatNumber(item.interestCoverage)}</td>
            <td>${formatNumber(item.peRatio)}</td>
            <td>${formatPercentage(item.earningsYield)}</td>
            <td>${formatNumber(item.priceToFCF)}</td>
            <td>${formatNumber(item.priceToMM200)}</td>
            <td>${formatPercentage(item.dividendYield)}</td>
            <td>${formatNumber(item.pbRatio)}</td>
            <td>${formatNumber(item.pegRatio)}</td>
            <td class="positive">${formatPercentage(item.roic)}</td>
            <td class="positive">${formatCurrency(item.freeCashFlow)}</td>
            <td>${formatNumber(item.evToEbitda)}</td>
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

function truncateText(text, maxLength) {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
