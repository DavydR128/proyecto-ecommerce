const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'app_user',
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_NAME || 'ecommerce_hexagonal',
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

module.exports = pool;
