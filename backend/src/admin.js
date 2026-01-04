const express = require("express")
const router = express.Router()
const pool = require("./pool")
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

module.exports = router
