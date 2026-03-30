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

module.exports = router
