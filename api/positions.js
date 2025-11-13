const pool = require('../db');

// GET - Récupérer toutes les positions
async function getPositions(req, res) {
    try {
        const result = await pool.query(`
            SELECT * FROM positions 
            ORDER BY date_ajout DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des positions:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

// POST - Ajouter une nouvelle position
async function addPosition(req, res) {
    const { entreprise_nom, entreprise_symbole, prix_achat, quantite, date_achat } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO positions (entreprise_nom, entreprise_symbole, prix_achat, quantite, date_achat)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [entreprise_nom, entreprise_symbole, prix_achat, quantite, date_achat]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la position:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

// PUT - Mettre à jour une position (fermeture)
async function updatePosition(req, res) {
    const { id } = req.params;
    const { prix_vente, date_vente } = req.body;

    try {
        const result = await pool.query(`
            UPDATE positions 
            SET statut = 'ferme', prix_vente = $1, date_vente = $2
            WHERE id = $3
            RETURNING *
        `, [prix_vente, date_vente, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Position non trouvée' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la position:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

// DELETE - Supprimer une position
async function deletePosition(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM positions WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Position non trouvée' });
        }

        res.json({ message: 'Position supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la position:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

module.exports = {
    getPositions,
    addPosition,
    updatePosition,
    deletePosition
};
