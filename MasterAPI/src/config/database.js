const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'master_api_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Initialize database and create table
const initializeDatabase = async () => {
    try {
        const connection = await pool.getConnection();

        // Create table for master data (columns B to K from Google Sheet)
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS master_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                column_b VARCHAR(255),
                column_c VARCHAR(255),
                column_d VARCHAR(255),
                column_e VARCHAR(255),
                column_f VARCHAR(255),
                column_g VARCHAR(255),
                column_h VARCHAR(255),
                column_i VARCHAR(255),
                column_j VARCHAR(255),
                column_k VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_column_b (column_b),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.query(createTableQuery);
        console.log('✅ Database table initialized successfully');

        connection.release();
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
};

module.exports = {
    pool,
    testConnection,
    initializeDatabase
};
