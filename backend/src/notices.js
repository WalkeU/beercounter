const express = require("express")
const router = express.Router()
const pool = require("./pool")
const { verifyToken } = require("./users")

// Get pending (unacknowledged) notices for the current user
router.get("/pending", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.id, n.notice_key, n.version, n.title, n.content, n.button_text, n.created_at
       FROM notices n
       WHERE NOT EXISTS (
         SELECT 1 FROM user_notice_acks a
         WHERE a.notice_id = n.id AND a.user_id = ?
       )
       ORDER BY n.created_at ASC`,
      [req.user.id],
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Acknowledge a notice
router.post("/acknowledge/:id", verifyToken, async (req, res) => {
  const noticeId = parseInt(req.params.id)
  if (!noticeId) return res.status(400).json({ error: "Érvénytelen notice id!" })
  try {
    await pool.query("INSERT IGNORE INTO user_notice_acks (user_id, notice_id) VALUES (?, ?)", [
      req.user.id,
      noticeId,
    ])
    res.json({ message: "Elfogadva!" })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// --- Admin endpoints ---

const requireAdmin = async (req, res) => {
  const [rows] = await pool.query("SELECT is_admin FROM users WHERE id = ?", [req.user.id])
  if (!rows.length || !rows[0].is_admin) {
    res.status(403).json({ error: "Nincs jogosultságod ehhez a művelethez!" })
    return false
  }
  return true
}

// Get all notices (admin)
router.get("/admin/all", verifyToken, async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return
    const [rows] = await pool.query(
      "SELECT * FROM notices ORDER BY created_at DESC"
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Get acknowledgements for a notice (admin) - who has seen it
router.get("/admin/:id/acks", verifyToken, async (req, res) => {
  const noticeId = parseInt(req.params.id)
  if (!noticeId) return res.status(400).json({ error: "Érvénytelen id!" })
  try {
    if (!(await requireAdmin(req, res))) return
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, a.acknowledged_at
       FROM user_notice_acks a
       JOIN users u ON u.id = a.user_id
       WHERE a.notice_id = ?
       ORDER BY a.acknowledged_at ASC`,
      [noticeId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Create notice (admin)
router.post("/admin", verifyToken, async (req, res) => {
  const { notice_key, title, content, button_text } = req.body
  if (!notice_key || !title || !content) {
    return res.status(400).json({ error: "Hiányzó adat!" })
  }
  try {
    if (!(await requireAdmin(req, res))) return
    // Auto-increment version for this key
    const [vRows] = await pool.query(
      "SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM notices WHERE notice_key = ?",
      [notice_key]
    )
    const version = vRows[0].next_version
    const [result] = await pool.query(
      "INSERT INTO notices (notice_key, version, title, content, button_text) VALUES (?, ?, ?, ?, ?)",
      [notice_key, version, title, content, button_text || "Elfogadom"]
    )
    const [newNotice] = await pool.query("SELECT * FROM notices WHERE id = ?", [result.insertId])
    res.json(newNotice[0])
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Edit notice (admin)
router.put("/admin/:id", verifyToken, async (req, res) => {
  const noticeId = parseInt(req.params.id)
  if (!noticeId) return res.status(400).json({ error: "Érvénytelen id!" })
  const { title, content, button_text } = req.body
  if (!title || !content) return res.status(400).json({ error: "Hiányzó adat!" })
  try {
    if (!(await requireAdmin(req, res))) return
    await pool.query(
      "UPDATE notices SET title = ?, content = ?, button_text = ? WHERE id = ?",
      [title, content, button_text || "Elfogadom", noticeId]
    )
    const [updated] = await pool.query("SELECT * FROM notices WHERE id = ?", [noticeId])
    res.json(updated[0])
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Delete notice (admin)
router.delete("/admin/:id", verifyToken, async (req, res) => {
  const noticeId = parseInt(req.params.id)
  if (!noticeId) return res.status(400).json({ error: "Érvénytelen id!" })
  try {
    if (!(await requireAdmin(req, res))) return
    await pool.query("DELETE FROM user_notice_acks WHERE notice_id = ?", [noticeId])
    await pool.query("DELETE FROM notices WHERE id = ?", [noticeId])
    res.json({ message: "Törölve!" })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

module.exports = router
