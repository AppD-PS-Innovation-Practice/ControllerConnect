var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

// Configure PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'controller_connect',
  password: 'example',
  port: 5432,
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ConCon' });
});

// Route for the search functionality
router.get('/search', async (req, res) => {
  const searchQuery = req.query.query;
  if (!searchQuery) {
    return res.status(400).send('Search query is required');
  }

  try {
    const result = await pool.query(
        'SELECT * FROM applications WHERE app_name ILIKE $1 ORDER BY controller_name, app_name',
        [`%${searchQuery}%`]
    );
    res.render('search_results', {
      title: 'Search Results',
      results: result.rows,
      query: searchQuery,
    });
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
