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
                <td colspan="26" style="text-align: center; padding: 40px; color: #64748b;">
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
            <td>${item.id}</td>
            <td><strong>${item.entreprise_id}</strong></td>
            <td>${formatDate(item.date_analyse)}</td>
            <td>${item.periode}</td>
            <td class="positive">${formatPercentage(item.roe)}</td>
            <td class="positive">${formatPercentage(item.netmargin)}</td>
            <td class="positive">${formatPercentage(item.grossmargin)}</td>
            <td><span class="badge ${item.recommandation.toLowerCase()}">${item.recommandation}</span></td>
            <td>${formatDateTime(item.created_at)}</td>
            <td>${formatPercentage(item.sgamargin)}</td>
            <td>${formatNumber(item.debttoequity)}</td>
            <td class="positive">${formatNumber(item.currentratio)}</td>
            <td class="positive">${formatNumber(item.interestcoverage)}</td>
            <td>${formatNumber(item.peratio)}</td>
            <td>${formatPercentage(item.earningsyield)}</td>
            <td>${formatNumber(item.pricetofcf)}</td>
            <td>${formatNumber(item.pricetomm200)}</td>
            <td>${formatPercentage(item.dividendyield)}</td>
            <td>${formatNumber(item.pbratio)}</td>
            <td>${formatNumber(item.pegratio)}</td>
            <td class="positive">${formatPercentage(item.roic)}</td>
            <td class="positive">${formatCurrency(item.freecashflow)}</td>
            <td>${formatNumber(item.evtoebitda)}</td>
            <td><span class="${getScoreClass(item.score_global)}">${item.score_global}/100</span></td>
            <td title="${item.points_forts}">${truncateText(item.points_forts, 40)}</td>
            <td title="${item.points_faibles}">${truncateText(item.points_faibles, 40)}</td>
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
    return `${value}%`;
}

function formatNumber(value) {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCurrency(value) {
    if (value === null || value === undefined) return '-';
    if (value >= 1000000) {
        return `€${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `€${(value / 1000).toFixed(1)}K`;
    }
    return `€${value.toLocaleString('fr-FR')}`;
}

function truncateText(text, maxLength) {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
