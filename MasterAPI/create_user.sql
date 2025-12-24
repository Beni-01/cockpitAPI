-- Run this SQL in phpMyAdmin to create user and grant privileges

-- Drop user if exists (to start fresh)
DROP USER IF EXISTS 'apiuser'@'localhost';

-- Create new user
CREATE USER 'apiuser'@'localhost' IDENTIFIED BY 'api123456';

-- Grant all privileges on master_api_db
GRANT ALL PRIVILEGES ON master_api_db.* TO 'apiuser'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Verify user was created
SELECT User, Host FROM mysql.user WHERE User = 'apiuser';
