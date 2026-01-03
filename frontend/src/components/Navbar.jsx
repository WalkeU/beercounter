import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { checkAuth, logout, getCurrentUser } from "../api/user"
import Logo from "./Logo"

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authenticated = await checkAuth()
        setIsAuthenticated(!!authenticated)
        if (authenticated) {
          const user = await getCurrentUser()
          setUsername(user?.username || "")
        }
      } catch (err) {
        setIsAuthenticated(false)
        console.error("Auth check error:", err)
      } finally {
        setLoading(false)
      }
    }
    verifyAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setIsAuthenticated(false)
      navigate("/login")
    } catch (error) {
      console.error("Kijelentkezési hiba:", error)
    }
  }

  if (loading) return null

  return (
    <nav className="w-full bg-bg text-white px-0 py-3 shadow-md border-b border-accent">
      <div className="px-10 mx-auto flex items-center justify-between">
        <Logo size={20} />

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-text-primary font-bold">{username}</span>
              <button
                onClick={handleLogout}
                className="bg-bg text-accent border border-accent font-bold px-4 py-2 rounded-md"
              >
                Kilépés
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Belépés
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
