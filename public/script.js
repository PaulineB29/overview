let currentData = [];
let sortConfig = { key: null, direction: 'asc' };

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromDB();
    setupEventListeners();
    setupNavigation();
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
            <td class="${getColorClass(item.roe, 'high')}">${formatPercentage(item.roe)}</td>
            <td class="${getColorClass(item.netmargin, 'high')}">${formatPercentage(item.netmargin)}</td>
            <td class="${getColorClass(item.grossmargin, 'high')}">${formatPercentage(item.grossmargin)}</td>
            <td><span class="badge ${item.recommandation ? item.recommandation.toLowerCase() : ''}">${item.recommandation || '-'}</span></td>
            <td class="${getColorClass(item.sgamargin, 'low')}">${formatPercentage(item.sgamargin)}</td>
            <td class="${getColorClass(item.debtequity, 'low')}">${formatNumber(item.debtequity)}</td>
            <td class="${getColorClass(item.currentratio, 'high')}">${formatNumber(item.currentratio)}</td>
            <td class="${getColorClass(item.interestcoverage, 'high')}">${formatNumber(item.interestcoverage)}</td>
            <td class="${getColorClass(item.peratio, 'low')}">${formatNumber(item.peratio)}</td>
            <td class="${getColorClass(item.earningsyield, 'high')}">${formatPercentage(item.earningsyield)}</td>
            <td class="${getColorClass(item.pricetofcf, 'low')}">${formatNumber(item.pricetofcf)}</td>
            <td class="${getColorClass(item.pricetomm200, 'low')}">${formatNumber(item.pricetomm200)}</td>
            <td class="${getColorClass(item.dividendyield, 'high')}">${formatPercentage(item.dividendyield)}</td>
            <td class="${getColorClass(item.pbratio, 'low')}">${formatNumber(item.pbratio)}</td>
            <td class="${getColorClass(item.pegratio, 'low')}">${formatNumber(item.pegratio)}</td>
            <td class="${getColorClass(item.roic, 'high')}">${formatPercentage(item.roic)}</td>
            <td class="${getColorClass(item.freecashflow, 'high')}">${formatCurrency(item.freecashflow)}</td>
            <td class="${getColorClass(item.evtoebitda, 'low')}">${formatNumber(item.evtoebitda)}</td>
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
