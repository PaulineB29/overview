const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 10000;

// Configuration de la base de données avec variables d'environnement
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BA2xWJemNa6k@ep-red-resonance-ag335bym-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Le reste de votre code reste identique...
app.get('/api/financial-data', async (req, res) => {
  try {
    const query = `
      SELECT * FROM analyses_financières ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

// Votre frontend intégré ici...
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html>
  <head>
    <title>Tableau Financier</title>
    <style>/* Votre CSS ici */</style>
  </head>
  <body>
    <div class="container">
      <!-- Votre HTML ici -->
    </div>
    <script>// Votre JavaScript ici</script>
  </body>
  </html>`);
});

app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur le port ${port}`);
});
