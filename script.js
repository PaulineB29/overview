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
        points_forts: "Croissance stable, Dividende fiable",
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
        points_forts: "Position marché forte, Innovation",
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
        points_forts: "Innovation, Croissance rapide",
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
        points_forts: "Dominance marché, Trésorerie solide",
        points_faibles: "Régulation, Dépendance publicité"
    }
];

// Variables globales
let currentData = [...sampleData];
let activeFilters = {};

// Fonction pour afficher les données dans le tableau
function displayData(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        
        // Déterminer la classe CSS pour la recommandation
        let recommandationClass = '';
        if (item.recommandation.toLowerCase().includes('acheter')) {
            recommandationClass = 'status-buy';
        } else if (item.recommandation.toLowerCase().includes('conserver')) {
            recommandationClass = 'status-hold';
        } else if (item.recommandation.toLowerCase().includes('vendre')) {
            recommandationClass = 'status-sell';
        }
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td><strong>${item.entreprise_id}</strong></td>
            <td>${item.date_analyse}</td>
            <td>${item.periode}</td>
            <td class="positive">${item.roe}</td>
            <td class="positive">${item.netMargin}</td>
            <td class="positive">${item.grossMargin}</td>
            <td><span class="${recommandationClass}">${item.recommandation}</span></td>
            <td>${item.created_at}</td>
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
            <td><strong>${item.score_global}</strong></td>
            <td>${item.points_forts}</td>
            <td>${item.points_faibles}</td>
        `;
        
        tableBody.appendChild(row);
    });

    // Mettre à jour le compteur
    updateRowCount(data.length);
}

// Fonction pour mettre à jour le compteur de résultats
function updateRowCount(count) {
    document.getElementById('rowCount').textContent = count;
}

// Fonction de filtrage par colonne
function setupColumnFilters() {
    const filterInputs = document.querySelectorAll('.filter-input');
    
    filterInputs.forEach(input => {
        input.addEventListener('input', function() {
            const columnIndex = parseInt(this.getAttribute('data-column'));
            const filterValue = this.value.toLowerCase();
            
            // Stocker le filtre
            if (filterValue) {
                activeFilters[columnIndex] = filterValue;
            } else {
                delete activeFilters[columnIndex];
            }
            
            applyFilters();
        });
    });
}

// Fonction de recherche globale
function setupGlobalSearch() {
    const globalSearch = document.getElementById('globalSearch');
    
    globalSearch.addEventListener('input', function() {
        const searchValue = this.value.toLowerCase();
        
        if (searchValue) {
            activeFilters.global = searchValue;
        } else {
            delete activeFilters.global;
        }
        
        applyFilters();
    });
}

// Fonction pour appliquer tous les filtres
function applyFilters() {
    let filteredData = [...sampleData];
    
    // Appliquer les filtres par colonne
    Object.keys(activeFilters).forEach(key => {
        if (key !== 'global') {
            const columnIndex = parseInt(key);
            const filterValue = activeFilters[key];
            
            filteredData = filteredData.filter(item => {
                const values = Object.values(item);
                if (values[columnIndex]) {
                    return values[columnIndex].toString().toLowerCase().includes(filterValue);
                }
                return false;
            });
        }
    });
    
    // Appliquer la recherche globale
    if (activeFilters.global) {
        const globalFilterValue = activeFilters.global;
        filteredData = filteredData.filter(item => {
            return Object.values(item).some(value => 
                value.toString().toLowerCase().includes(globalFilterValue)
            );
        });
    }
    
    currentData = filteredData;
    displayData(filteredData);
}

// Fonction pour réinitialiser les filtres
function setupResetButton() {
    document.getElementById('resetFilters').addEventListener('click', function() {
        // Réinitialiser les champs de filtre
        document.querySelectorAll('.filter-input').forEach(input => {
            input.value = '';
        });
        document.getElementById('globalSearch').value = '';
        
        // Réinitialiser les filtres actifs
        activeFilters = {};
        
        // Afficher toutes les données
        currentData = [...sampleData];
        displayData(currentData);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    displayData(sampleData);
    setupColumnFilters();
    setupGlobalSearch();
    setupResetButton();
    
    console.log('Tableau financier initialisé avec succès!');
    console.log(`${sampleData.length} enregistrements chargés`);
});

// Fonction pour ajouter de nouvelles données (exportée pour utilisation externe)
window.addFinancialData = function(newData) {
    sampleData.push(newData);
    currentData.push(newData);
    displayData(currentData);
    return `Nouvelle donnée ajoutée. Total: ${sampleData.length} enregistrements`;
};

// Fonction pour récupérer les données actuelles
window.getFinancialData = function() {
    return currentData;
};
