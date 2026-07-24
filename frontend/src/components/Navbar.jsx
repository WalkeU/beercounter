import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { checkAuth, logout, getCurrentUser } from "../api/user"
import Logo from "./Logo"

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authenticated = await checkAuth()
        setIsAuthenticated(!!authenticated)
        if (authenticated) {
          const user = await getCurrentUser()
          setUsername(user?.username || "")
          setIsAdmin(user?.is_admin || false)
        }
      } catch (err) {
        // Ha 404-es hiba (felhasználó nem található), automatikus logout
        if (err.response?.status === 404) {
          console.log("Felhasználó nem található, automatikus kijelentkezés")
          await logout()
        }
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
        <Logo
          size={20}
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
          className="cursor-pointer"
        />

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="bg-bg text-accent border border-accent font-bold px-4 py-2 rounded-md flex items-center gap-2"
              >
                {username || "Menü"}
                <span className={`text-xs transition-transform ${menuOpen ? "rotate-180" : ""}`}>▼</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-surface border border-border rounded-md shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      navigate("/dashboard")
                      setMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-bg transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate("/stats")
                      setMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-bg transition-colors"
                  >
                    Statisztikák
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        navigate("/admin")
                        setMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-bg transition-colors"
                    >
                      Admin
                    </button>
                  )}
                  <div className="border-t border-border" />
                  <button
                    onClick={() => {
                      handleLogout()
                      setMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error hover:text-bg transition-colors"
                  >
                    Kilépés
                  </button>
                </div>
              )}
            </div>
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
