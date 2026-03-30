const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { generateToken, setTokenCookie } = require("./tokenHelpers")

// Use the same pool as in server.js
const pool = require("./pool")

// Register route
router.post("/register", async (req, res) => {
  const { email, username, password, password2 } = req.body
  if (!email || !username || !password || !password2) {
    return res.status(400).json({ error: "Minden mező kötelező!" })
  }
  if (password !== password2) {
    return res.status(400).json({ error: "A jelszavak nem egyeznek!" })
  }
  try {
    const [users] = await pool.query("SELECT id FROM users WHERE email = ? OR username = ?", [
      email,
      username,
    ])
    if (users.length > 0) {
      return res.status(400).json({ error: "Ez az email vagy felhasználónév már foglalt!" })
    }
    const hashed = await bcrypt.hash(password, 10)
    const [insertResult] = await pool.query(
      "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
      [email, username, hashed]
    )
    const newUserId = insertResult.insertId

    // Auto-acknowledge all current notices (user accepted ÁSZF during registration)
    const [notices] = await pool.query("SELECT id FROM notices")
    for (const notice of notices) {
      await pool.query(
        "INSERT IGNORE INTO user_notice_acks (user_id, notice_id) VALUES (?, ?)",
        [newUserId, notice.id]
      )
    }

    res.status(201).json({ message: "Sikeres regisztráció!" })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: "Minden mező kötelező!" })
  }
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [username])
    if (users.length === 0) {
      return res.status(400).json({ error: "Hibás felhasználónév vagy jelszó!" })
    }
    const user = users[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(400).json({ error: "Hibás felhasználónév vagy jelszó!" })
    }
    const token = generateToken(user.id, user.username)
    setTokenCookie(res, token)
    res.json({ message: "Sikeres bejelentkezés!", must_change_password: !!user.must_change_password })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Middleware to verify JWT token and refresh it
const verifyToken = (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ error: "Nincs jogosultságod!" })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded

    // Generate new token with extended expiration
    const newToken = generateToken(decoded.id, decoded.username)
    setTokenCookie(res, newToken)

    next()
  } catch (err) {
    return res.status(401).json({ error: "Érvénytelen token!" })
  }
}

// Check authentication status
router.get("/check-auth", (req, res) => {
  const token = req.cookies.token
  if (!token) {
    return res.json({ isAuthenticated: false })
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET)
    res.json({ isAuthenticated: true })
  } catch (err) {
    res.json({ isAuthenticated: false })
  }
})

// Get current user info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, email, username, is_admin FROM users WHERE id = ?", [
      req.user.id,
    ])
    if (users.length === 0) {
      return res.status(404).json({ error: "Felhasználó nem található!" })
    }
    res.json(users[0])
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Change password (must_change_password flow)
router.post("/change-password", verifyToken, async (req, res) => {
  const { newPassword } = req.body
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "A jelszónak legalább 6 karakter hosszúnak kell lennie!" })
  }
  try {
    const hashed = await bcrypt.hash(newPassword, 10)
    await pool.query("UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?", [
      hashed,
      req.user.id,
    ])
    res.json({ message: "Jelszó sikeresen megváltoztatva!" })
  } catch (err) {
    res.status(500).json({ error: "Szerver hiba!" })
  }
})

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
  res.json({ message: "Sikeres kijelentkezés!" })
})

module.exports = router
module.exports.verifyToken = verifyToken
