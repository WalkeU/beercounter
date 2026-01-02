require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mysql = require("mysql2/promise")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Initialize database
async function initDatabase() {
  try {
    const connection = await pool.getConnection()

    // Create todos table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    connection.release()
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
    process.exit(1)
  }
}

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

// Get all todos
app.get("/api/todos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM todos ORDER BY created_at DESC")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching todos:", error)
    res.status(500).json({ error: "Failed to fetch todos" })
  }
})

// Create a new todo
app.post("/api/todos", async (req, res) => {
  const { title } = req.body

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" })
  }

  try {
    const [result] = await pool.query("INSERT INTO todos (title) VALUES (?)", [title.trim()])

    const [newTodo] = await pool.query("SELECT * FROM todos WHERE id = ?", [result.insertId])

    res.status(201).json(newTodo[0])
  } catch (error) {
    console.error("Error creating todo:", error)
    res.status(500).json({ error: "Failed to create todo" })
  }
})

// Update todo (toggle completed)
app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params
  const { completed } = req.body

  try {
    await pool.query("UPDATE todos SET completed = ? WHERE id = ?", [completed, id])

    const [updatedTodo] = await pool.query("SELECT * FROM todos WHERE id = ?", [id])

    res.json(updatedTodo[0])
  } catch (error) {
    console.error("Error updating todo:", error)
    res.status(500).json({ error: "Failed to update todo" })
  }
})

// Delete todo
app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params

  try {
    await pool.query("DELETE FROM todos WHERE id = ?", [id])
    res.status(204).send()
  } catch (error) {
    console.error("Error deleting todo:", error)
    res.status(500).json({ error: "Failed to delete todo" })
  }
})

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
