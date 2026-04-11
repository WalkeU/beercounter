import React, { useEffect, useState } from "react"
import { getGlobalStats, getUserStats } from "../api/beer"
import { getCurrentUser } from "../api/user"
import Navbar from "../components/Navbar"

const BeerDistributionPage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("global")
  const [stats, setStats] = useState(null)
  const [userStats, setUserStats] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)

        const [globalStatsData, userStatsData] = await Promise.all([
          getGlobalStats().catch(() => null),
          userData?.username ? getUserStats(userData.username).catch(() => null) : null,
        ])

        setStats(globalStatsData)
        setUserStats(userStatsData)
      } catch (error) {
        console.error("Hiba az adatok betöltése során:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const computeBeerDistribution = (isGlobal) => {
    const source = isGlobal ? stats?.beerStats : userStats?.beerStats
    if (!source) return []
    const tot = source.reduce((s, v) => s + (v.total || 0), 0) || 1
    return source
      .map((b) => ({
        beer: b.name || "Ismeretlen",
        count: b.total,
        percent: Math.round((b.total / tot) * 100),
      }))
      .sort((a, b) => b.count - a.count)
  }

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

  const beerDist = computeBeerDistribution(view === "global")
  const palette = ["bg-rank-1", "bg-rank-2", "bg-rank-3", "bg-rank-4", "bg-rank-5"]
  const maxCount = Math.max(...beerDist.map((b) => b.count), 1)

  return (
    <div className="app min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Sörosztás</h1>
          <div className="flex rounded overflow-hidden">
            <button
              onClick={() => setView("global")}
              className={`px-3 py-2 ${view === "global" ? "bg-accent text-bg" : "bg-surface"}`}
            >
              Globális
            </button>
            {user && (
              <button
                onClick={() => setView("mine")}
                className={`px-3 py-2 ${view === "mine" ? "bg-accent text-bg" : "bg-surface"}`}
              >
                Saját
              </button>
            )}
          </div>
        </div>

        <div className="bg-surface rounded border border-border p-6">
          {beerDist.length === 0 ? (
            <div className="text-center text-text-secondary py-8">Nincs még adat.</div>
          ) : (
            <div className="space-y-6">
              {beerDist.map((b, i) => (
                <div key={b.beer}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-lg font-medium">{b.beer}</div>
                    <div className="text-text-secondary">
                      {b.count.toFixed(2)} Liter ({b.percent}%)
                    </div>
                  </div>
                  <div className="w-full h-4 rounded bg-bg-secondary overflow-hidden">
                    <div
                      className={`h-4 ${palette[i % palette.length]} transition-all`}
                      style={{ width: `${Math.pow(b.count / maxCount, 1) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BeerDistributionPage
