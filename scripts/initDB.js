require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'postgres', // Conectar a BD por defecto
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Crear base de datos si no existe
    await client.query('CREATE DATABASE auth_system');
    console.log('✅ Base de datos creada');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('ℹ️  La base de datos ya existe');
    } else {
      throw error;
    }
  } finally {
    client.release();
  }

  // Conectar a la nueva base de datos
  const dbPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'auth_system',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  const dbClient = await dbPool.connect();
  
  try {
    await dbClient.query('BEGIN');

    // Ejecutar script SQL completo
    const initSQL = `
      ${require('fs').readFileSync('./scripts/database.sql', 'utf8')}
    `;
    
    await dbClient.query(initSQL);
    await dbClient.query('COMMIT');
    
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    await dbClient.query('ROLLBACK');
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  } finally {
    dbClient.release();
    await dbPool.end();
    await pool.end();
  }
}

initializeDatabase().catch(console.error);