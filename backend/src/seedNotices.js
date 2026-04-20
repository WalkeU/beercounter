const pool = require("./pool")

async function seedNotices() {
  try {
    const connection = await pool.getConnection()

    connection.release()
    console.log("Notices seeded successfully")
  } catch (error) {
    console.error("Notices seed error:", error)
    process.exit(1)
  }
}

module.exports = seedNotices
