// Get all entries (for stats, not paginated)
router.get("/allentries", async (req, res) => {
  try {
    const [entries] = await pool.query(
      `SELECT e.*, b.name AS beer_name, u.username 
       FROM entries e 
       JOIN beers b ON e.beer_id = b.id 
       JOIN users u ON e.user_id = u.id 
       ORDER BY e.created_at DESC`
    )
    res.json({ entries })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!", details: err.message, stack: err.stack, full: err })
  }
})
const express = require("express")
const router = express.Router()
const pool = require("./pool")
const { verifyToken } = require("./users")

// Helper function to capitalize brand names
const capitalizeBeer = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim()
}

// Create entry
router.post("/entry", verifyToken, async (req, res) => {
  const { count, beer, comment = "" } = req.body
  const userId = req.user?.id
  if (!userId || !count || !beer) {
    return res.status(400).json({ error: "Hiányzó adat!" })
  }
  try {
    // Normalize beer name
    const normalizedBeer = capitalizeBeer(beer)

    // Find beer and its quantity
    let [beerRows] = await pool.query("SELECT id, quantity FROM beers WHERE name = ?", [normalizedBeer])
    if (beerRows.length === 0) {
      return res.status(400).json({ error: "Ez a sör nem található az adatbázisban!" })
    }
    const beerId = beerRows[0].id
    const quantity = beerRows[0].quantity ?? 0.5

    const [result] = await pool.query(
      "INSERT INTO entries (user_id, beer_id, count, quantity, comment, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [userId, beerId, count, quantity, comment]
    )
    const [entry] = await pool.query("SELECT * FROM entries WHERE id = ?", [result.insertId])
    res.json(entry[0])
  } catch (err) {
    res.status(500).json({
      error: "Szerver hiba!",
    })
  }
})

// Delete entry
router.delete("/entry/:entryId", verifyToken, async (req, res) => {
  const { entryId } = req.params
  try {
    await pool.query("DELETE FROM entries WHERE id = ?", [entryId])
    res.json({ status: "deleted" })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Get beers (autocomplete)
router.get("/beers", async (req, res) => {
  const { search = "", limit = 10 } = req.query
  try {
    let query
    let params
    if (search && search.length > 0) {
      // Case-insensitive search using LOWER()
      query =
        "SELECT id, name AS beerName, abv, price FROM beers WHERE LOWER(name) LIKE LOWER(?) ORDER BY name LIMIT ?"
      params = [`%${search}%`, Number(limit)]
    } else {
      // Return all beers when no search term
      query = "SELECT id, name AS beerName, abv, price FROM beers ORDER BY name LIMIT ?"
      params = [Number(limit)]
    }
    const [beers] = await pool.query(query, params)
    console.log("Beers search:", search, "Results:", beers.length)
    res.json(beers)
  } catch (err) {
    console.error("Beers endpoint error:", err)
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Get user's entries (paginated)
router.get("/getuserentries", async (req, res) => {
  const { username, limit = 20, offset = 0 } = req.query
  try {
    const [userRows] = await pool.query("SELECT id FROM users WHERE username = ?", [username])
    if (userRows.length === 0) return res.json({ entries: [], total: 0 })
    const userId = userRows[0].id
    const [entries] = await pool.query(
      `SELECT e.*, b.name AS beer_name, u.username 
       FROM entries e 
       JOIN beers b ON e.beer_id = b.id 
       JOIN users u ON e.user_id = u.id 
       WHERE e.user_id = ? 
       ORDER BY e.created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, Number(limit), Number(offset)]
    )
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM entries WHERE user_id = ?", [
      userId,
    ])
    res.json({ entries, total })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!", details: err.message, stack: err.stack, full: err })
  }
})

// Get recent entries (paginated)
router.get("/recent", async (req, res) => {
  const { limit = 20, offset = 0 } = req.query
  try {
    const [entries] = await pool.query(
      `SELECT e.*, b.name AS beer_name, u.username 
       FROM entries e 
       JOIN beers b ON e.beer_id = b.id 
       JOIN users u ON e.user_id = u.id 
       ORDER BY e.created_at DESC 
       LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    )
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM entries")
    res.json({ entries, total })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!", details: err.message, stack: err.stack, full: err })
  }
})

// Get global stats
router.get("/globalstats", async (req, res) => {
  try {
    const [[{ totalCount, totalMoney }]] = await pool.query(
      "SELECT SUM(count * quantity) AS totalCount, SUM(count * quantity * b.price) AS totalMoney FROM entries e JOIN brands b ON e.brand_id = b.id"
    )
    const [brandStats] = await pool.query(
      "SELECT b.name, SUM(e.count * e.quantity) AS total FROM entries e JOIN brands b ON e.brand_id = b.id GROUP BY b.id"
    )
    res.json({ totalCount, totalMoney, brandStats })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Get user stats
router.get("/userstats", async (req, res) => {
  const { username } = req.query
  try {
    const [userRows] = await pool.query("SELECT id FROM users WHERE username = ?", [username])
    if (userRows.length === 0) return res.json({})
    const userId = userRows[0].id
    const [[{ totalCount, totalMoney }]] = await pool.query(
      "SELECT SUM(count * quantity) AS totalCount, SUM(count * quantity * b.price) AS totalMoney FROM entries e JOIN brands b ON e.brand_id = b.id WHERE e.user_id = ?",
      [userId]
    )
    const [brandStats] = await pool.query(
      "SELECT b.name, SUM(e.count * e.quantity) AS total FROM entries e JOIN brands b ON e.brand_id = b.id WHERE e.user_id = ? GROUP BY b.id",
      [userId]
    )
    res.json({ totalCount, totalMoney, brandStats })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Get all users (paginated)
router.get("/alluser", async (req, res) => {
  const { limit = 20, offset = 0 } = req.query
  try {
    const [users] = await pool.query("SELECT id, username FROM users ORDER BY username LIMIT ? OFFSET ?", [
      Number(limit),
      Number(offset),
    ])
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM users")
    res.json({ users, total })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Get top users
router.get("/top", async (req, res) => {
  try {
    const [topUsers] = await pool.query(
      `SELECT u.username, SUM(e.count * e.quantity) AS count
			 FROM entries e JOIN users u ON e.user_id = u.id
			 GROUP BY u.id
			 ORDER BY count DESC
			 LIMIT 5`
    )
    res.json(topUsers)
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

module.exports = router
