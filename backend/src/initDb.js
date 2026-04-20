const pool = require("./pool")
const seedNotices = require("./seedNotices")

async function initDatabase() {
  try {
    const connection = await pool.getConnection()

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin TINYINT(1) DEFAULT 0,
        must_change_password TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await connection.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) DEFAULT 0
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
        FOREIGN KEY (beer_id) REFERENCES beers(id),
        INDEX idx_user_id (user_id),
        INDEX idx_beer_id (beer_id),
        INDEX idx_created_at (created_at)
      )
    `)

    // Create notices table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notice_key VARCHAR(100) NOT NULL,
        version INT NOT NULL DEFAULT 1,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        button_text VARCHAR(255) DEFAULT 'Elfogadom',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_notice_version (notice_key, version)
      )
    `)

    // Create user notice acknowledgements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_notice_acks (
        user_id INT NOT NULL,
        notice_id INT NOT NULL,
        acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, notice_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (notice_id) REFERENCES notices(id)
      )
    `)

    // Create events table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATETIME,
        end_date DATETIME,
        is_active TINYINT(1) DEFAULT 1,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    // Create event participants table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS event_participants (
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (event_id, user_id),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Add event_id column to entries
    await connection.query(`
      ALTER TABLE entries ADD COLUMN IF NOT EXISTS event_id INT DEFAULT NULL
    `)

    // Seed notices
    await seedNotices()

    connection.release()
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
    process.exit(1)
  }
}

module.exports = initDatabase
