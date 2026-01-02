import { useState, useEffect } from "react"
import "./App.css"

const API_URL = ""

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch todos
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/api/todos`)
      if (!response.ok) throw new Error("Failed to fetch todos")
      const data = await response.json()
      setTodos(data)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching todos:", err)
    } finally {
      setLoading(false)
    }
  }

  // Add new todo
  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      setError(null)
      const response = await fetch(`${API_URL}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodo }),
      })

      if (!response.ok) throw new Error("Failed to add todo")

      const data = await response.json()
      setTodos([data, ...todos])
      setNewTodo("")
    } catch (err) {
      setError(err.message)
      console.error("Error adding todo:", err)
    }
  }

  // Toggle todo completed status
  const toggleTodo = async (id, completed) => {
    try {
      setError(null)
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      })

      if (!response.ok) throw new Error("Failed to update todo")

      const updatedTodo = await response.json()
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)))
    } catch (err) {
      setError(err.message)
      console.error("Error updating todo:", err)
    }
  }

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      setError(null)
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete todo")

      setTodos(todos.filter((todo) => todo.id !== id))
    } catch (err) {
      setError(err.message)
      console.error("Error deleting todo:", err)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>Mit akar Luca?</h1>

        {error && <div className="error">⚠️ {error}</div>}

        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="todo-input"
          />
          <button type="submit" className="btn btn-add">
            +
          </button>
        </form>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <ul className="todo-list">
            {todos.length === 0 ? (
              <li className="empty-state">No todos yet. Add one above! 👆</li>
            ) : (
              todos.map((todo) => (
                <li key={todo.id} className="todo-item">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                    className="todo-checkbox"
                  />
                  <span className={todo.completed ? "completed" : ""}>{todo.title}</span>
                  <button onClick={() => deleteTodo(todo.id)} className="btn btn-delete">
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        )}

        <div className="stats">
          Total: {todos.length} | Completed: {todos.filter((t) => t.completed).length}
        </div>
      </div>
    </div>
  )
}

export default App
