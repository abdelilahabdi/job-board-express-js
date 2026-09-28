// config/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();


const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jobboard_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


db.getConnection()
    .then(() => console.log('✅ Connecté à la base de données MySQL via le Pool.'))
    .catch((err) => console.error('❌ Erreur de connexion à la base de données:', err));

export default db;