const pool = require("./pool")

async function initDatabase() {
  try {
    const connection = await pool.getConnection()

    // Create users table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    connection.release()
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
    process.exit(1)
  }
}

module.exports = initDatabase
