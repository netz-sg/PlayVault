-- Initialize the database with required tables
-- This will be executed when MariaDB container starts for the first time

CREATE DATABASE IF NOT EXISTS game_library;
USE game_library;

-- The actual schema creation will be handled by Prisma migrations
-- This file is mainly to ensure the database exists and has proper encoding

-- Set character set and collation
ALTER DATABASE game_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ensure the user has proper permissions
CREATE USER IF NOT EXISTS 'playvault'@'%' IDENTIFIED BY 'playvault';
GRANT ALL PRIVILEGES ON game_library.* TO 'playvault'@'%';
GRANT ALL PRIVILEGES ON game_library.* TO 'root'@'%';
FLUSH PRIVILEGES; 