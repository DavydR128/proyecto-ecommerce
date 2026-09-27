const { Pool } = require('pg');

const pool = new Pool({
  user: 'app_user',
  host: '127.0.0.1',
  database: 'ecommerce_hexagonal',
  password: 'Password123!',
  port: 5432,
});

module.exports = pool;
