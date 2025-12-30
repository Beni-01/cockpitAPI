const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'fonarev_cost_center_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection
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

// Initialize database tables
const initializeTables = async () => {
    try {
        const connection = await pool.getConnection();

        // Create cost_center table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS cost_center (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mapping_cashflow VARCHAR(255),
        departement_direction VARCHAR(255),
        activites VARCHAR(255),
        sous_activites VARCHAR(255),
        taches VARCHAR(500),
        code_departement VARCHAR(50),
        code_activite VARCHAR(50),
        code_sous_activite VARCHAR(50),
        code_tache VARCHAR(50),
        cost_code VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_dept_code (code_departement),
        INDEX idx_activity_code (code_activite),
        INDEX idx_sub_activity_code (code_sous_activite),
        INDEX idx_task_code (code_tache),
        INDEX idx_cost_code (cost_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        // Create budget_details table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS budget_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cost_center_code VARCHAR(100) NOT NULL,
        task_name VARCHAR(500),
        budget_year INT DEFAULT 2026,
        province_ville VARCHAR(255),
        coordinations_provinciales VARCHAR(255),
        local_etranger VARCHAR(100),
        categories_grades VARCHAR(255),
        nature_depenses VARCHAR(255),
        texte_libelle TEXT,
        unites_mesure VARCHAR(100),
        total_unite_mesure DECIMAL(15,2),
        total_budget_usd DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cost_center (cost_center_code),
        FOREIGN KEY (cost_center_code) REFERENCES cost_center(cost_code) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        console.log('✅ Database tables initialized successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Table initialization failed:', error.message);
        return false;
    }
};

module.exports = {
    pool,
    testConnection,
    initializeTables
};
