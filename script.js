// Données d'exemple
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
        points_faibles: "Dette élevée, Concurrence forte"
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
        points_forts: "Position marché forte, Innovation cloud",
        points_faibles: "Marge en baisse, Régulation"
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
        points_forts: "Innovation, Croissance rapide, Leadership EVs",
        points_faibles: "Volatilité, Concurrence EVs"
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
        points_forts: "Dominance marché, Trésorerie solide, Données",
        points_faibles: "Régulation, Dépendance publicité"
    }
];

let currentData = [...sampleData];
let sortConfig = { key: null, direction: 'asc' };

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    displayData(currentData);
    setupEventListeners();
});

function setupEventListeners() {
    // Recherche globale
    document.getElementById('globalSearch').addEventListener('input', function(e) {
        filterData(e.target.value);
    });

    // Réinitialisation
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('globalSearch').value = '';
        currentData = [...sampleData];
        displayData(currentData);
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

    data.forEach(item => {
        const row = document.createElement('tr');
        const score = parseInt(item.score_global);
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td><strong>${item.entreprise_id}</strong></td>
            <td>${formatDate(item.date_analyse)}</td>
            <td>${item.periode}</td>
            <td class="positive">${item.roe}</td>
            <td class="positive">${item.netMargin}</td>
            <td class="positive">${item.grossMargin}</td>
            <td><span class="badge ${item.recommandation.toLowerCase()}">${item.recommandation}</span></td>
            <td>${formatDateTime(item.created_at)}</td>
            <td>${item.sgaMargin}</td>
            <td>${item.debtToEquity}</td>
            <td class="positive">${item.currentRatio}</td>
            <td class="positive">${item.interestCoverage}</td>
            <td>${item.peRatio}</td>
            <td>${item.earningsYield}</td>
            <td>${item.priceToFCF}</td>
            <td>${item.priceToMM200}</td>
            <td>${item.dividendYield}</td>
            <td>${item.pbRatio}</td>
            <td>${item.pegRatio}</td>
            <td class="positive">${item.roic}</td>
            <td class="positive">${item.freeCashFlow}</td>
            <td>${item.evToEbitda}</td>
            <td><span class="${getScoreClass(score)}">${item.score_global}</span></td>
            <td title="${item.points_forts}">${truncateText(item.points_forts, 40)}</td>
            <td title="${item.points_faibles}">${truncateText(item.points_faibles, 40)}</td>
        `;
        tbody.appendChild(row);
    });

    updateRowCount(data.length);
}

function filterData(searchTerm) {
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
    displayData(currentData);
}

function sortData(key) {
    // Mettre à jour la configuration de tri
    if (sortConfig.key === key) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.key = key;
        sortConfig.direction = 'asc';
    }

    // Trier les données
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
        } else if (key === 'date_analyse' || key === 'created_at') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    displayData(currentData);
}

function updateRowCount(count) {
    document.getElementById('rowCount').textContent = count;
}

function getScoreClass(score) {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
}

function formatDateTime(dateTimeString) {
    return new Date(dateTimeString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Fonctions utilitaires pour l'ajout de données
window.addFinancialData = function(newData) {
    sampleData.push(newData);
    currentData.push(newData);
    displayData(currentData);
    return `Nouvelle donnée ajoutée. Total: ${sampleData.length} enregistrements`;
};

window.getFinancialData = function() {
    return currentData;
};
