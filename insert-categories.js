const mysql = require('mysql2/promise');
require('dotenv').config();

async function insertCategoriesAndUpdateDepartments() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'F360DB'
        });
        console.log('✅ Connected to database!');

        // Add categoryId column to department table if it doesn't exist
        console.log('\n🔧 Checking and adding categoryId column to department table...');
        try {
            await connection.execute(`
                ALTER TABLE department 
                ADD COLUMN categoryId INT NULL
            `);
            console.log('✅ Added categoryId column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️  categoryId column already exists');
            } else {
                console.error('❌ Error adding column:', err.message);
            }
        }

        // Add foreign key constraint
        try {
            await connection.execute(`
                ALTER TABLE department 
                ADD CONSTRAINT fk_department_category 
                FOREIGN KEY (categoryId) REFERENCES category(id) 
                ON DELETE SET NULL ON UPDATE CASCADE
            `);
            console.log('✅ Added foreign key constraint');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('⚠️  Foreign key constraint already exists');
            } else {
                console.error('❌ Error adding foreign key:', err.message);
            }
        }

        // Insert Categories
        console.log('\n📁 Inserting Categories...');
        const categories = ['Operation', 'Fonctionnement', 'COMMUNICATION', 'Capex'];
        
        for (const category of categories) {
            try {
                await connection.execute(
                    'INSERT INTO category (name) VALUES (?)',
                    [category]
                );
                console.log(`✅ Inserted category: ${category}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`⚠️  Category already exists: ${category}`);
                } else {
                    console.error(`❌ Error inserting ${category}:`, err.message);
                }
            }
        }

        // Update Departments with Category IDs
        console.log('\n🏢 Updating Departments with Category IDs...');

        // Operation Category
        const operationDepts = [
            'ETUDES', 'MEDIATION', 'ACCES A LA JUSTICE', 'REPARATION', 
            'SECURITE', 'GENOCOST', 'PLAIDOYER INTERNATIONAL'
        ];
        await updateDepartmentsCategory(connection, 'Operation', operationDepts);

        // Fonctionnement Category
        const fonctionnementDepts = [
            'DIRECTION GENERALE', 'CONSEIL D\'ADMINISTRATION', 'DIRECTION FINANCIERE', 
            'AUDIT INTERNE', 'RESSOURCES HUMAINES', 'JURIDIQUE', 
            'SERVICES GENERAUX & ADM', 'PASSATION DE MARCHE'
        ];
        await updateDepartmentsCategory(connection, 'Fonctionnement', fonctionnementDepts);

        // COMMUNICATION Category
        await updateDepartmentsCategory(connection, 'COMMUNICATION', ['COMMUNICATION']);

        // Capex Category
        await updateDepartmentsCategory(connection, 'Capex', ['Capex']);

        // Verify the updates
        console.log('\n📊 Verification - Departments with Categories:');
        const [results] = await connection.execute(`
            SELECT 
                d.id,
                d.name as department_name,
                d.categoryId,
                c.name as category_name
            FROM department d
            LEFT JOIN category c ON d.categoryId = c.id
            ORDER BY c.name, d.name
        `);

        console.table(results);

        await connection.end();
        console.log('\n✅ Process completed successfully!');
    } catch (e) {
        console.error('❌ Error:', e.message);
        process.exit(1);
    }
}

async function updateDepartmentsCategory(connection, categoryName, departments) {
    // Get category ID
    const [categoryRows] = await connection.execute(
        'SELECT id FROM category WHERE name = ?',
        [categoryName]
    );

    if (categoryRows.length === 0) {
        console.error(`❌ Category not found: ${categoryName}`);
        return;
    }

    const categoryId = categoryRows[0].id;

    for (const deptName of departments) {
        try {
            const [result] = await connection.execute(
                'UPDATE department SET categoryId = ? WHERE name = ?',
                [categoryId, deptName]
            );
            if (result.affectedRows > 0) {
                console.log(`✅ Updated ${deptName} -> ${categoryName}`);
            } else {
                console.log(`⚠️  Department not found: ${deptName}`);
            }
        } catch (err) {
            console.error(`❌ Error updating ${deptName}:`, err.message);
        }
    }
}

insertCategoriesAndUpdateDepartments();
