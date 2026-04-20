const express = require("express")
const router = express.Router()
const pool = require("./pool")
const { verifyToken } = require("./users")

async function isAdmin(userId) {
  const [rows] = await pool.query("SELECT is_admin FROM users WHERE id = ?", [userId])
  return rows.length > 0 && rows[0].is_admin
}

// GET / - List all events (active first)
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user?.id
  try {
    const [events] = await pool.query(
      `SELECT e.*,
        (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id) AS participant_count,
        (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id AND ep.user_id = ?) AS is_joined
       FROM events e
       ORDER BY e.is_active DESC, e.created_at DESC`,
      [userId]
    )
    res.json(events)
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// POST / - Create event (admin only)
router.post("/", verifyToken, async (req, res) => {
  const userId = req.user?.id
  const { name, description, start_date, end_date, is_active = 1 } = req.body
  if (!name) return res.status(400).json({ error: "Hiányzó adat!" })
  try {
    if (!await isAdmin(userId)) return res.status(403).json({ error: "Nincs jogosultságod!" })
    const [result] = await pool.query(
      "INSERT INTO events (name, description, start_date, end_date, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description || null, start_date || null, end_date || null, is_active, userId]
    )
    const [event] = await pool.query("SELECT * FROM events WHERE id = ?", [result.insertId])
    res.json(event[0])
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// PUT /:id - Edit event (admin only)
router.put("/:id", verifyToken, async (req, res) => {
  const userId = req.user?.id
  const { id } = req.params
  const { name, description, start_date, end_date, is_active } = req.body
  try {
    if (!await isAdmin(userId)) return res.status(403).json({ error: "Nincs jogosultságod!" })
    const [rows] = await pool.query("SELECT id FROM events WHERE id = ?", [id])
    if (rows.length === 0) return res.status(404).json({ error: "Esemény nem található!" })
    await pool.query(
      "UPDATE events SET name = ?, description = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?",
      [name, description || null, start_date || null, end_date || null, is_active, id]
    )
    const [event] = await pool.query("SELECT * FROM events WHERE id = ?", [id])
    res.json(event[0])
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// DELETE /:id - Delete event (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  const userId = req.user?.id
  const { id } = req.params
  try {
    if (!await isAdmin(userId)) return res.status(403).json({ error: "Nincs jogosultságod!" })
    const [rows] = await pool.query("SELECT id FROM events WHERE id = ?", [id])
    if (rows.length === 0) return res.status(404).json({ error: "Esemény nem található!" })
    await pool.query("UPDATE entries SET event_id = NULL WHERE event_id = ?", [id])
    await pool.query("DELETE FROM events WHERE id = ?", [id])
    res.json({ status: "deleted" })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// POST /:id/join - Join event
router.post("/:id/join", verifyToken, async (req, res) => {
  const userId = req.user?.id
  const { id } = req.params
  try {
    const [rows] = await pool.query("SELECT id, is_active FROM events WHERE id = ?", [id])
    if (rows.length === 0) return res.status(404).json({ error: "Esemény nem található!" })
    if (!rows[0].is_active) return res.status(400).json({ error: "Ez az esemény már nem aktív!" })
    const [existing] = await pool.query(
      "SELECT 1 FROM event_participants WHERE event_id = ? AND user_id = ?",
      [id, userId]
    )
    if (existing.length > 0) return res.status(400).json({ error: "Már csatlakoztál ehhez az eseményhez!" })
    await pool.query("INSERT INTO event_participants (event_id, user_id) VALUES (?, ?)", [id, userId])
    res.json({ status: "joined" })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// POST /:id/leave - Leave event
router.post("/:id/leave", verifyToken, async (req, res) => {
  const userId = req.user?.id
  const { id } = req.params
  try {
    await pool.query("DELETE FROM event_participants WHERE event_id = ? AND user_id = ?", [id, userId])
    res.json({ status: "left" })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// GET /:id - Get event details
router.get("/:id", verifyToken, async (req, res) => {
  const userId = req.user?.id
  const { id } = req.params
  try {
    const [rows] = await pool.query(
      `SELECT e.*,
        (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id) AS participant_count,
        (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id AND ep.user_id = ?) AS is_joined
       FROM events e WHERE e.id = ?`,
      [userId, id]
    )
    if (rows.length === 0) return res.status(404).json({ error: "Esemény nem található!" })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// GET /:id/entries - Paginated event entries (optional ?mine=true for current user only)
router.get("/:id/entries", verifyToken, async (req, res) => {
  const { id } = req.params
  const userId = req.user?.id
  const { limit = 20, offset = 0, mine = "false" } = req.query
  try {
    const conds = ["e.event_id = ?"]
    const params = [id]
    if (mine === "true") {
      conds.push("e.user_id = ?")
      params.push(userId)
    }
    const where = conds.join(" AND ")
    const [entries] = await pool.query(
      `SELECT e.*, b.name AS beer_name, u.username
       FROM entries e
       JOIN beers b ON e.beer_id = b.id
       JOIN users u ON e.user_id = u.id
       WHERE ${where}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    )
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM entries e WHERE ${where}`,
      params
    )
    res.json({ entries, total })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// GET /:id/leaderboard - Event leaderboard
router.get("/:id/leaderboard", verifyToken, async (req, res) => {
  const { id } = req.params
  try {
    const [userLeaderboard] = await pool.query(
      `SELECT u.username, SUM(e.count * e.quantity) AS total_liters, COUNT(e.id) AS entry_count,
         SUM(e.count * b.price) AS total_money
       FROM entries e
       JOIN users u ON e.user_id = u.id
       JOIN beers b ON e.beer_id = b.id
       WHERE e.event_id = ?
       GROUP BY u.id
       ORDER BY total_liters DESC`,
      [id]
    )
    const [entryLeaderboard] = await pool.query(
      `SELECT e.id, u.username, b.name AS beer_name, e.count, e.quantity, e.comment, e.created_at,
         (e.count * e.quantity) AS total_liters
       FROM entries e
       JOIN users u ON e.user_id = u.id
       JOIN beers b ON e.beer_id = b.id
       WHERE e.event_id = ?
       ORDER BY total_liters DESC`,
      [id]
    )
    res.json({ userLeaderboard, entryLeaderboard })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// GET /:id/stats - Event stats
router.get("/:id/stats", verifyToken, async (req, res) => {
  const { id } = req.params
  try {
    const [[{ totalCount, totalMoney }]] = await pool.query(
      `SELECT COALESCE(SUM(e.count * e.quantity), 0) AS totalCount, COALESCE(SUM(e.count * b.price), 0) AS totalMoney
       FROM entries e
       JOIN beers b ON e.beer_id = b.id
       WHERE e.event_id = ?`,
      [id]
    )
    const [beerStats] = await pool.query(
      `SELECT b.name, SUM(e.count * e.quantity) AS total
       FROM entries e
       JOIN beers b ON e.beer_id = b.id
       WHERE e.event_id = ?
       GROUP BY b.id
       ORDER BY total DESC`,
      [id]
    )
    res.json({ totalCount, totalMoney, beerStats })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

module.exports = router
