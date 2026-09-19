import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Prueba de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error de conexión a PostgreSQL:', err.message);
  } else {
    console.log('Conexión a PostgreSQL establecida con éxito.');
  }
});