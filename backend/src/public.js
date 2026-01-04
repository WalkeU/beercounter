const express = require("express")
const router = express.Router()
const pool = require("./pool")

// Get global stats (public)
router.get("/globalstats", async (req, res) => {
  try {
    const [[{ totalCount, totalMoney }]] = await pool.query(
      "SELECT SUM(e.count * e.quantity) AS totalCount, SUM(e.count * b.price) AS totalMoney FROM entries e JOIN beers b ON e.beer_id = b.id"
    )
    const [beerStats] = await pool.query(
      "SELECT b.name, SUM(e.count * e.quantity) AS total FROM entries e JOIN beers b ON e.beer_id = b.id GROUP BY b.id"
    )
    res.json({ totalCount, totalMoney, beerStats })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!", details: err.message, stack: err.stack, full: err })
  }
})

// Get last entry (public)
router.get("/lastentry", async (req, res) => {
  try {
    const [entries] = await pool.query(
      `SELECT e.*, b.name AS beer_name, u.username
       FROM entries e
       JOIN beers b ON e.beer_id = b.id
       JOIN users u ON e.user_id = u.id
       ORDER BY e.created_at DESC
       LIMIT 1`
    )
    if (entries.length === 0) {
      return res.json({ entry: null })
    }
    res.json({ entry: entries[0] })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!", details: err.message, stack: err.stack, full: err })
  }
})

module.exports = router
