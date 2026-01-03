const pool = require("./pool")

async function initDatabase() {
  try {
    const connection = await pool.getConnection()

    // Add indexes for faster queries (after connection)
    await connection.query(`
      ALTER TABLE entries
        ADD INDEX IF NOT EXISTS idx_user_id (user_id),
        ADD INDEX IF NOT EXISTS idx_beer_id (beer_id),
        ADD INDEX IF NOT EXISTS idx_created_at (created_at)
    `)

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
    // Insert default beers if not exist
    const beers = [
      { name: "Pilsner Urquell", abv: 4.4, price: 500, quantity: 0.5 },
      { name: "Dreher Gold", abv: 5.2, price: 450, quantity: 0.5 },
      { name: "Krušovice", abv: 5.0, price: 450, quantity: 0.5 },
      { name: "Dreher", abv: 5.0, price: 340, quantity: 0.5 },
      { name: "Dreher Bak", abv: 7.3, price: 320, quantity: 0.5 },
      { name: "Soproni", abv: 4.5, price: 280, quantity: 0.5 },
      { name: "Soproni Óvatos Duhaj", abv: 7.5, price: 350, quantity: 0.5 },
      { name: "Borsodi", abv: 4.5, price: 270, quantity: 0.5 },
      { name: "Arany Ászok", abv: 4.3, price: 250, quantity: 0.5 },
      { name: "Kőbányai", abv: 4.3, price: 260, quantity: 0.5 },
      { name: "Heineken", abv: 5.0, price: 400, quantity: 0.5 },
      { name: "Stella Artois", abv: 5.0, price: 420, quantity: 0.5 },
      { name: "Corona Extra", abv: 4.6, price: 480, quantity: 0.355 },
      { name: "Guinness", abv: 4.2, price: 500, quantity: 0.44 },
      { name: "Budweiser", abv: 5.0, price: 380, quantity: 0.5 },
      { name: "Beck's", abv: 5.0, price: 390, quantity: 0.5 },
      { name: "Blanc 1664", abv: 5.0, price: 430, quantity: 0.5 },
      { name: "Hoegaarden", abv: 4.9, price: 450, quantity: 0.5 },
      { name: "Csíki Sör", abv: 4.5, price: 320, quantity: 0.5 },
      { name: "Szalon", abv: 4.5, price: 300, quantity: 0.5 },
      { name: "Arany Fácán", abv: 4.6, price: 310, quantity: 0.5 },
      { name: "Coors", abv: 4.0, price: 350, quantity: 0.5 },
    ]

    for (const beer of beers) {
      await connection.query("INSERT IGNORE INTO beers (name, abv, price, quantity) VALUES (?, ?, ?, ?)", [
        beer.name,
        beer.abv,
        beer.price * 2,
        beer.quantity,
      ])
    }

    connection.release()
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
    process.exit(1)
  }
}

module.exports = initDatabase
