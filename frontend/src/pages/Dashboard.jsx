import React, { useEffect, useState } from "react"
import { getCurrentUser } from "../api/user"
import Navbar from "../components/Navbar"

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("Hiba a felhasználó betöltése során:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <p>Betöltés...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Navbar />
      <div className="container">{user && <h1>Üdvözöllek, {user.username}!</h1>}</div>
    </div>
  )
}

export default Dashboard
