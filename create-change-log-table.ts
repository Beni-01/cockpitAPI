import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3307,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'F360DB',
});

async function createChangeLogTable() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Connected to database');

        const sql = `
      CREATE TABLE IF NOT EXISTS budget_data_change_log (
          id INT PRIMARY KEY AUTO_INCREMENT,
          budget_data_id INT NOT NULL,
          config_id INT NOT NULL,
          field_name VARCHAR(100) NOT NULL,
          old_value TEXT,
          new_value TEXT,
          changed_by VARCHAR(100) DEFAULT 'sync',
          changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          sync_log_id INT,
          
          INDEX idx_budget_data_id (budget_data_id),
          INDEX idx_config_id (config_id),
          INDEX idx_changed_at (changed_at),
          INDEX idx_field_name (field_name),
          
          CONSTRAINT fk_change_log_budget_data 
              FOREIGN KEY (budget_data_id) 
              REFERENCES budget_data(id) 
              ON DELETE CASCADE,
          
          CONSTRAINT fk_change_log_config 
              FOREIGN KEY (config_id) 
              REFERENCES google_sheet_config(id) 
              ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

        await AppDataSource.query(sql);
        console.log('✅ Table budget_data_change_log created successfully!');

        await AppDataSource.destroy();
        console.log('✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createChangeLogTable();
