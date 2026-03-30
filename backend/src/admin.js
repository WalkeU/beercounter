const express = require("express")
const router = express.Router()
const pool = require("./pool")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const { verifyToken } = require("./users")

// Helper function to capitalize beer names
const capitalizeBeer = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim()
}

// Create new beer (admin only)
router.post("/createbeer", verifyToken, async (req, res) => {
  const { name, abv, price, quantity } = req.body
  const userId = req.user?.id
  if (!userId || !name) {
    return res.status(400).json({ error: "Hiányzó adat!" })
  }
  try {
    // Check if user is admin
    const [userRows] = await pool.query("SELECT is_admin FROM users WHERE id = ?", [userId])
    if (userRows.length === 0 || !userRows[0].is_admin) {
      return res.status(403).json({ error: "Nincs jogosultságod ehhez a művelethez!" })
    }
    // Insert new beer
    const normalizedBeer = capitalizeBeer(name)
    const [result] = await pool.query("INSERT INTO beers (name, abv, price, quantity) VALUES (?, ?, ?, ?)", [
      normalizedBeer,
      abv,
      price,
      quantity,
    ])
    const [newBeer] = await pool.query("SELECT * FROM beers WHERE id = ?", [result.insertId])
    res.json(newBeer[0])
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Edit beer details (admin only)
router.put("/editbeer/:beerId", verifyToken, async (req, res) => {
  const { beerId } = req.params
  const { name, abv, price, quantity } = req.body
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ error: "Nincs jogosultságod ehhez a művelethez!" })
  }
  try {
    // Check if user is admin
    const [userRows] = await pool.query("SELECT is_admin FROM users WHERE id = ?", [userId])
    if (userRows.length === 0 || !userRows[0].is_admin) {
      return res.status(403).json({ error: "Nincs jogosultságod ehhez a művelethez!" })
    }

    // Check if beer exists
    const [beerRows] = await pool.query("SELECT id FROM beers WHERE id = ?", [beerId])
    if (beerRows.length === 0) {
      return res.status(404).json({ error: "Sör nem található!" })
    }

    // Normalize beer name if provided
    const normalizedName = name ? capitalizeBeer(name) : undefined

    // Update beer details
    await pool.query("UPDATE beers SET name = ?, abv = ?, price = ?, quantity = ? WHERE id = ?", [
      normalizedName,
      abv,
      price,
      quantity,
      beerId,
    ])
    const [updatedBeer] = await pool.query("SELECT * FROM beers WHERE id = ?", [beerId])
    res.json(updatedBeer[0])
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!", details: err.message, stack: err.stack, full: err })
  }
})

// Delete beer (admin only)
router.delete("/deletebeer/:beerId", verifyToken, async (req, res) => {
  const { beerId } = req.params
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ error: "Nincs jogosultságod ehhez a művelethez!" })
  }
  try {
    // Check if user is admin
    const [userRows] = await pool.query("SELECT is_admin FROM users WHERE id = ?", [userId])
    if (userRows.length === 0 || !userRows[0].is_admin) {
      return res.status(403).json({ error: "Nincs jogosultságod ehhez a művelethez!" })
    }

    // Check if beer exists
    const [beerRows] = await pool.query("SELECT id FROM beers WHERE id = ?", [beerId])
    if (beerRows.length === 0) {
      return res.status(404).json({ error: "Sör nem található!" })
    }

    // Check if beer is referenced in entries
    const [entryRows] = await pool.query("SELECT COUNT(*) as count FROM entries WHERE beer_id = ?", [beerId])
    if (entryRows[0].count > 0) {
      return res.status(400).json({ error: "Ez a sör nem törölhető, mert bejegyzések hivatkoznak rá!" })
    }

    // Delete beer
    await pool.query("DELETE FROM beers WHERE id = ?", [beerId])
    res.json({ message: "Sör sikeresen törölve." })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!", details: err.message, stack: err.stack, full: err })
  }
})

// Get all users (admin only)
router.get("/users", verifyToken, async (req, res) => {
  const userId = req.user?.id
  try {
    const [userRows] = await pool.query("SELECT is_admin FROM users WHERE id = ?", [userId])
    if (userRows.length === 0 || !userRows[0].is_admin) {
      return res.status(403).json({ error: "Nincs jogosultságod ehhez a művelethez!" })
    }
    const [users] = await pool.query(
      "SELECT id, username, email, is_admin, must_change_password FROM users ORDER BY username",
    )
    res.json(users)
  } catch (err) {
    console.error("[GET /admin/users] Error:", err.message, err.stack)
    res.status(500).json({ error: "Szerver hiba!", details: err.message })
  }
})

// Reset user password (admin only)
router.post("/reset-password/:targetUserId", verifyToken, async (req, res) => {
  const userId = req.user?.id
  const { targetUserId } = req.params
  try {
    const [userRows] = await pool.query("SELECT is_admin FROM users WHERE id = ?", [userId])
    if (userRows.length === 0 || !userRows[0].is_admin) {
      return res.status(403).json({ error: "Nincs jogosultságod ehhez a művelethez!" })
    }
    const [targetRows] = await pool.query("SELECT id, username FROM users WHERE id = ?", [targetUserId])
    if (targetRows.length === 0) {
      return res.status(404).json({ error: "Felhasználó nem található!" })
    }
    const tempPassword = "sokvoltasör123"
    const hashed = await bcrypt.hash(tempPassword, 10)
    await pool.query("UPDATE users SET password = ?, must_change_password = 1 WHERE id = ?", [
      hashed,
      targetUserId,
    ])
    res.json({ tempPassword, username: targetRows[0].username })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

module.exports = router
