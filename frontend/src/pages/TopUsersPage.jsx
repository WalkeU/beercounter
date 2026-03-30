import React, { useEffect, useState } from "react"
import { getAllUsers } from "../api/beer"
import { getCurrentUser } from "../api/user"
import Navbar from "../components/Navbar"

const medalConfig = [
  {
    border: "2px solid #FFD700",
    boxShadow: "0 0 10px 2px rgba(255, 215, 0, 0.35)",
    animation: "shimmer-gold 2.8s ease-in-out infinite",
    icon: "🥇",
    rankColor: "#FFD700",
  },
  {
    border: "2px solid #C0C0C0",
    boxShadow: "0 0 10px 2px rgba(192, 192, 192, 0.3)",
    animation: "shimmer-silver 3.2s ease-in-out infinite",
    icon: "🥈",
    rankColor: "#C0C0C0",
  },
  {
    border: "2px solid #CD7F32",
    boxShadow: "0 0 10px 2px rgba(205, 127, 50, 0.3)",
    animation: "shimmer-bronze 3.6s ease-in-out infinite",
    icon: "🥉",
    rankColor: "#CD7F32",
  },
]

const TopUsersPage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [topUsers, setTopUsers] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)

        const allUsersData = await getAllUsers().catch(() => [])
        setTopUsers(allUsersData)
      } catch (error) {
        console.error("Hiba az adatok betöltése során:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="app min-h-screen">
        <Navbar />
        <div className="container p-6">
          <p>Betöltés...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app min-h-screen">
      <style>{`
        @keyframes shimmer-gold {
          0%, 100% { box-shadow: 0 0 8px 1px rgba(255, 215, 0, 0.25); }
          50% { box-shadow: 0 0 20px 5px rgba(255, 215, 0, 0.6); }
        }
        @keyframes shimmer-silver {
          0%, 100% { box-shadow: 0 0 8px 1px rgba(192, 192, 192, 0.2); }
          50% { box-shadow: 0 0 18px 4px rgba(192, 192, 192, 0.5); }
        }
        @keyframes shimmer-bronze {
          0%, 100% { box-shadow: 0 0 8px 1px rgba(205, 127, 50, 0.2); }
          50% { box-shadow: 0 0 18px 4px rgba(205, 127, 50, 0.5); }
        }
      `}</style>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Toplista</h1>

        <div className="bg-surface rounded border border-border p-6">
          {topUsers.length === 0 ? (
            <div className="text-center text-text-secondary py-8">Nincs még adat.</div>
          ) : (
            <div className="space-y-3">
              {topUsers.map((u, i) => {
                const medal = i < 3 ? medalConfig[i] : null
                return (
                  <div
                    key={u.username}
                    className="flex items-center justify-between p-4 rounded bg-bg-secondary hover:bg-bg transition-colors"
                    style={
                      medal
                        ? {
                            border: medal.border,
                            boxShadow: medal.boxShadow,
                            animation: medal.animation,
                          }
                        : { border: "1px solid var(--border)" }
                    }
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="text-2xl font-bold w-10 text-center"
                        style={medal ? { color: medal.rankColor } : {}}
                      >
                        {medal ? medal.icon : `#${i + 1}`}
                      </span>
                      <span className="text-lg font-medium">{u.username}</span>
                    </div>
                    <span className="text-lg font-semibold text-accent">{u.count?.toFixed(1) || 0} L</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopUsersPage
