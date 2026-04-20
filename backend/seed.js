require("dotenv").config()
const mysql = require("mysql2/promise")
const bcryptjs = require("bcryptjs")

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "beers_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const BEERS = [
  { name: "Pilsner Urquell", abv: 4.4, price: 550, quantity: 0.5 },
  { name: "Peroni", abv: 5, price: 520, quantity: 0.5 },
  { name: "Soproni", abv: 4.5, price: 440, quantity: 0.5 },
  { name: "Krušovice", abv: 4.2, price: 500, quantity: 0.5 },
  { name: "Heineken", abv: 5, price: 510, quantity: 0.5 },
  { name: "Corona", abv: 4.5, price: 650, quantity: 0.355 },
  { name: "Stella Artois", abv: 5, price: 420, quantity: 0.5 },
  { name: "Budweiser", abv: 5, price: 520, quantity: 0.5 },
  { name: "Coors", abv: 4.3, price: 520, quantity: 0.5 },
  { name: "Dreher", abv: 5, price: 450, quantity: 0.5 },
]

const NOTES = [
  "Finom volt",
  "Nyami",
  "Szuper",
  "Kockás este",
  "Barátokkal",
  "Mozihoz",
  "Grillezéshez",
  "Vasárnapi pihenő",
  "Meló után",
  "Darts közben",
  "Filmhez",
  "Buliba",
  "Piknikre",
  "Pub",
  "",
]

async function seed() {
  try {
    const conn = await pool.getConnection()

    // Clear existing data
    await conn.query("DELETE FROM entries")
    await conn.query("DELETE FROM event_participants")
    await conn.query("DELETE FROM events")
    await conn.query("DELETE FROM beers")
    await conn.query("DELETE FROM users")

    // Insert test users FIRST (foreign key dependency)
    const hashedPassword = bcryptjs.hashSync("asd", 10)
    for (let i = 1; i <= 10; i++) {
      await conn.query("INSERT INTO users (email, username, password, is_admin) VALUES (?, ?, ?, ?)", [
        `test${i}@test.com`,
        `testuser${i}`,
        hashedPassword,
        i === 1 ? 1 : 0,
      ])
    }

    console.log("✅ 10 test users added (password: asd)")

    // Insert beers
    for (const beer of BEERS) {
      await conn.query("INSERT INTO beers (name, abv, price, quantity) VALUES (?, ?, ?, ?)", [
        beer.name,
        beer.abv,
        beer.price,
        beer.quantity,
      ])
    }

    console.log(`✅ ${BEERS.length} beer types added`)

    // Create events
    const pastEvent = await conn.query(
      "INSERT INTO events (name, description, start_date, end_date, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "2025 Év-végi borral",
        "A 2025-ös év végét megünnepeljük sörakóval",
        "2025-01-01 00:00:00",
        "2025-03-31 23:59:59",
        0,
        1,
      ],
    )
    const pastEventId = pastEvent[0].insertId

    const activeEvent = await conn.query(
      "INSERT INTO events (name, description, start_date, end_date, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "2026 Éves sörivás kihívás",
        "A 2026-os évben végig követjük a sörfogyasztás statisztikáit",
        "2026-01-01 00:00:00",
        "2026-12-31 23:59:59",
        1,
        1,
      ],
    )
    const activeEventId = activeEvent[0].insertId

    console.log(`✅ 2 events created (ID: ${pastEventId}, ${activeEventId})`)

    // Add participants to events
    for (let i = 1; i <= 8; i++) {
      await conn.query("INSERT INTO event_participants (event_id, user_id) VALUES (?, ?)", [pastEventId, i])
      await conn.query("INSERT INTO event_participants (event_id, user_id) VALUES (?, ?)", [activeEventId, i])
    }

    console.log("✅ Event participants added")

    // Insert ~100 regular entries
    const today = new Date()
    for (let i = 0; i < 100; i++) {
      const userId = Math.floor(Math.random() * 10) + 1
      const beerId = Math.floor(Math.random() * BEERS.length) + 1
      const quantity = Math.floor(Math.random() * 5) + 1
      const note = NOTES[Math.floor(Math.random() * NOTES.length)]
      const daysAgo = Math.floor(Math.random() * 60)
      const date = new Date(today)
      date.setDate(date.getDate() - daysAgo)
      const timestamp = date.toISOString().slice(0, 19).replace("T", " ")

      await conn.query(
        "INSERT INTO entries (user_id, beer_id, count, quantity, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, beerId, quantity, 0.5, note, timestamp],
      )
    }

    console.log("✅ 100 regular entries added")

    // Insert entries for past event (2025 dates)
    for (let i = 0; i < 50; i++) {
      const userId = Math.floor(Math.random() * 8) + 1
      const beerId = Math.floor(Math.random() * BEERS.length) + 1
      const quantity = Math.floor(Math.random() * 5) + 1
      const note = NOTES[Math.floor(Math.random() * NOTES.length)]
      const daysAgo = Math.floor(Math.random() * 90) + 365 * 1 // 2025-ben
      const date = new Date(2025, 0, 1) // 2025 január
      date.setDate(date.getDate() + Math.floor(Math.random() * 90))
      const timestamp = date.toISOString().slice(0, 19).replace("T", " ")

      await conn.query(
        "INSERT INTO entries (user_id, beer_id, count, quantity, comment, created_at, event_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userId, beerId, quantity, 0.5, note, timestamp, pastEventId],
      )
    }

    console.log("✅ 50 entries for past event added")

    // Insert entries for active event (2026 dates)
    for (let i = 0; i < 60; i++) {
      const userId = Math.floor(Math.random() * 8) + 1
      const beerId = Math.floor(Math.random() * BEERS.length) + 1
      const quantity = Math.floor(Math.random() * 5) + 1
      const note = NOTES[Math.floor(Math.random() * NOTES.length)]
      const daysAgo = Math.floor(Math.random() * 110) // 2026 január-április
      const date = new Date(2026, 0, 1)
      date.setDate(date.getDate() + daysAgo)
      const timestamp = date.toISOString().slice(0, 19).replace("T", " ")

      await conn.query(
        "INSERT INTO entries (user_id, beer_id, count, quantity, comment, created_at, event_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userId, beerId, quantity, 0.5, note, timestamp, activeEventId],
      )
    }

    console.log("✅ 60 entries for active event added")
    conn.release()
    process.exit(0)
  } catch (err) {
    console.error("❌ Seed error:", err)
    process.exit(1)
  }
}

seed()
