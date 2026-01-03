import React, { useEffect, useState } from "react"
import { getCurrentUser } from "../api/user"
import { getRecentEntries, getUserEntries, getGlobalStats, getUserStats } from "../api/beer"
import Navbar from "../components/Navbar"
import CreateEntry from "../components/CreateEntry"

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [view, setView] = useState("global") // "global" or "mine"
  const [globalEntries, setGlobalEntries] = useState([])
  const [myEntries, setMyEntries] = useState([])

  const [formOpen, setFormOpen] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)

        const username = userData?.username
        const [globalData, myData] = await Promise.all([
          getRecentEntries(10),
          username ? getUserEntries(username, 10) : Promise.resolve({ entries: [], total: 0 }),
        ])
        const s = await getGlobalStats().catch(() => null)
        setStats(s)
        setGlobalEntries(globalData?.entries || [])
        setMyEntries(myData?.entries || [])
      } catch (error) {
        console.error("Hiba a betöltés során:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const refreshLists = async () => {
    try {
      const username = user?.username
      const [globalData, myData] = await Promise.all([
        getRecentEntries(30),
        username ? getUserEntries(username, 30) : Promise.resolve({ entries: [], total: 0 }),
      ])
      const s = await getGlobalStats().catch(() => null)
      setStats(s)
      setGlobalEntries(globalData?.entries || [])
      setMyEntries(myData?.entries || [])
    } catch (error) {
      console.error(error)
    }
  }

  const sumEntries = (arr) => arr.reduce((s, it) => s + (it.count || 0) * (it.quantity || 0.5), 0)

  const computeBeerDistribution = (arr) => {
    const map = {}
    arr.forEach((it) => {
      const b = it.beer_name || it.beer || "Ismeretlen"
      const qty = (it.count || 0) * (it.quantity || 0.5)
      map[b] = (map[b] || 0) + qty
    })
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1
    return Object.entries(map)
      .map(([beer, cnt]) => ({ beer, count: cnt, percent: Math.round((cnt / total) * 100) }))
      .sort((a, b) => b.count - a.count)
  }

  if (loading) {
    return (
      <div className="app">
        <div className="container p-6">
          <p>Betöltés...</p>
        </div>
      </div>
    )
  }

  const globalTotal = sumEntries(globalEntries)
  const myTotal = sumEntries(myEntries)

  const beerDist = computeBeerDistribution(view === "mine" ? myEntries : globalEntries)

  const palette = ["beer-1, beer-2, beer-3, beer-4, beer-5"]

  return (
    <div className="app min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFormOpen((s) => !s)}
              className="px-4 py-2 rounded border border-border bg-surface hover:opacity-90"
            >
              Rögzítek egy sort
            </button>
            <div className="flex rounded overflow-hidden">
              <button
                onClick={() => setView("global")}
                className={`px-3 py-2 ${view === "global" ? "bg-accent text-bg" : "bg-surface"}`}
              >
                Globális
              </button>
              <button
                onClick={() => setView("mine")}
                className={`px-3 py-2 ${view === "mine" ? "bg-accent text-bg" : "bg-surface"}`}
              >
                Saját
              </button>
            </div>
          </div>
        </div>

        <CreateEntry isOpen={formOpen} onClose={() => setFormOpen(false)} onSuccess={refreshLists} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 p-4 rounded border border-border bg-surface">
            <h2 className="mb-2">Statisztikák</h2>
            <div className="mb-3">
              <div className="text-sm text-text-secondary">Összes (globális)</div>
              <div className="text-xl font-semibold">
                {globalTotal.toFixed(1) * 2} Korsó / {globalTotal.toFixed(1)} L
              </div>
              <div className="text-sm text-text-secondary">
                Érték: {stats?.totalMoney ? `${Math.round(stats.totalMoney)} Ft` : "-"}
              </div>
            </div>
            <div className="mb-3">
              <div className="text-sm text-text-secondary">Saját</div>
              <div className="text-xl font-semibold">
                {myTotal.toFixed(1) * 2} Korsó / {myTotal.toFixed(1)} L
              </div>
            </div>

            <div>
              <h3 className="text-sm mb-2">Sörmegoszlás ({beerDist.length})</h3>
              <div className="space-y-2">
                {beerDist.slice(0, 5).map((b, i) => (
                  <div key={b.beer}>
                    <div className="flex justify-between text-sm mb-1">
                      <div>{b.beer}</div>
                      <div className="text-text-secondary">
                        {b.count} ({b.percent}%)
                      </div>
                    </div>
                    <div className="w-full h-3 rounded bg-bg-secondary overflow-hidden">
                      <div
                        className={`h-3 ${palette[i % palette.length]}`}
                        style={{ width: `${b.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
                {beerDist.length === 0 && <div className="text-sm text-text-secondary">Nincs még adat.</div>}
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <div className="mb-4 p-4 rounded border border-border bg-surface">
              <h2 className="mb-2">Legutóbbi bejegyzések ({view === "global" ? "Globális" : "Saját"})</h2>
              <ul>
                {(view === "global" ? globalEntries : myEntries).map((it) => (
                  <li key={it.id} className="py-2 border-b border-bg-secondary last:border-b-0">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{it.beer_name || it.beer || "Ismeretlen"}</div>
                        <div className="text-sm text-text-secondary">{it.comment}</div>
                      </div>
                      <div className="text-sm text-text-secondary">
                        {it.count} × {it.quantity || 0.5}L • {it.user?.username || it.username}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
