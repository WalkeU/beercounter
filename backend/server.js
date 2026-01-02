require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mysql = require("mysql2/promise")
const cookieParser = require("cookie-parser")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

// Database connection pool (moved to pool.js)
const pool = require("./src/pool")
// App routes
const routes = require("./src/routes")
app.use("/api", routes)

// Database initialization moved to src/initDb.js
const initDatabase = require("./src/initDb")

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
