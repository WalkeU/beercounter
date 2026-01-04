const pool = require("./pool")

async function initDatabase() {
  try {
    const connection = await pool.getConnection()

    // Create users table if not exists with admin
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_admin TINYINT(1) DEFAULT 0
      )
    `)

    // Create beers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS beers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        abv FLOAT,
        price INT,
        quantity FLOAT
      )
    `)

    // Create entries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        beer_id INT,
        count INT,
        quantity FLOAT,
        comment TEXT,
        created_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (beer_id) REFERENCES beers(id)
      )
    `)

    // Add indexes for faster queries (after tables are created)
    await connection.query(`
      ALTER TABLE entries
        ADD INDEX IF NOT EXISTS idx_user_id (user_id),
        ADD INDEX IF NOT EXISTS idx_beer_id (beer_id),
        ADD INDEX IF NOT EXISTS idx_created_at (created_at)
    `)

    connection.release()
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
    process.exit(1)
  }
}

module.exports = initDatabase
