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
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [total, setTotal] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [userStats, setUserStats] = useState(null)

  // Fetch entries for the current page and view
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)

        const username = userData?.username
        let globalData = { entries: [], total: 0 }
        let myData = { entries: [], total: 0 }
        let userStatsData = null
        if (username) {
          ;[globalData, myData, userStatsData] = await Promise.all([
            getRecentEntries(pageSize, (page - 1) * pageSize),
            getUserEntries(username, pageSize, (page - 1) * pageSize),
            getUserStats(username).catch(() => null),
          ])
        } else {
          globalData = await getRecentEntries(pageSize, (page - 1) * pageSize)
        }
        setGlobalEntries(globalData?.entries || [])
        setMyEntries(myData?.entries || [])
        setUserStats(userStatsData)
        setTotal(view === "global" ? globalData?.total || 0 : myData?.total || 0)
        const s = await getGlobalStats().catch(() => null)
        setStats(s)
      } catch (error) {
        console.error("Hiba a betöltés során:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, page])

  const refreshLists = async () => {
    try {
      setLoading(true)
      setPage(1)
      // Triggers useEffect
    } catch (error) {
      console.error(error)
    }
  }

  const sumEntries = (arr) => arr.reduce((s, it) => s + (it.count || 0) * (it.quantity || 0.5), 0)

  // Új: sörmegoszlás számítása
  const computeBeerDistribution = (isGlobal) => {
    if (isGlobal && stats?.beerStats) {
      const total = stats.beerStats.reduce((s, v) => s + (v.total || 0), 0) || 1
      return stats.beerStats
        .map((b) => ({
          beer: b.name || "Ismeretlen",
          count: b.total,
          percent: Math.round((b.total / total) * 100),
        }))
        .sort((a, b) => b.count - a.count)
    } else if (!isGlobal && userStats?.beerStats) {
      const total = userStats.beerStats.reduce((s, v) => s + (v.total || 0), 0) || 1
      return userStats.beerStats
        .map((b) => ({
          beer: b.name || "Ismeretlen",
          count: b.total,
          percent: Math.round((b.total / total) * 100),
        }))
        .sort((a, b) => b.count - a.count)
    } else {
      return []
    }
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

  // A globalTotal-t a stats.totalCount-ból vesszük, ha van
  const globalTotal = stats?.totalCount ?? sumEntries(globalEntries)
  const myTotal = userStats?.totalCount ?? sumEntries(myEntries)

  const beerDist = computeBeerDistribution(view === "global")

  // Pagination logic
  const pageCount = Math.ceil(total / pageSize)
  const canPrev = page > 1
  const canNext = page < pageCount

  const palette = ["bg-rank-1", "bg-rank-2", "bg-rank-3", "bg-rank-4", "bg-rank-5"]

  return (
    <div className="app min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => setFormOpen((s) => !s)}
              className="px-4 py-2 rounded border border-border bg-surface hover:opacity-90"
            >
              Ittam sört
            </button>
          </div>
          <div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="col-span-full lg:col-span-1 p-4 rounded border border-border bg-surface h-full">
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
          </div>
          <div className="col-span-full lg:col-span-1 p-4 rounded border border-border bg-surface h-full">
            <div>
              <h2>
                Sörmegoszlás <span className="text-text-secondary">Top {beerDist.length}</span>
              </h2>
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
          <div className="col-span-full lg:col-span-1 p-4 rounded border border-border bg-surface h-full"></div>
          <div className="col-span-full lg:col-span-3 h-full">
            <div className="mb-4 p-4 rounded border border-border bg-surface h-full flex flex-col relative pb-10 lg:pb-10">
              <h2 className="mb-2">Legutóbbi bejegyzések ({view === "global" ? "Globális" : "Saját"})</h2>
              <ul className="flex-1">
                {(view === "global" ? globalEntries : myEntries).map((it) => (
                  <li key={it.id} className="py-2 border-b border-bg-secondary last:border-b-0">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{it.beer_name || it.beer || "Ismeretlen"}</div>
                      </div>
                      <div className="text-sm text-text-secondary">
                        {it.count} × {it.quantity || 0.5}L • {it.user?.username || it.username}
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-2 text-xs mt-1">
                      <span className="text-text-secondary" suppressHydrationWarning>
                        {new Date(it.created_at).toLocaleString("hu-HU", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {it.comment && (
                        <span className=" text-text-secondary" title={it.comment}>
                          – {it.comment}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {/* Pager */}
              {pageCount > 1 && (
                <div
                  className="flex items-center bg-surface/80 p-2 absolute left-0 right-0 bottom-0 w-full rounded-none z-20 justify-between
                    lg:right-4 lg:bottom-4 lg:w-auto lg:rounded lg:justify-end"
                >
                  <button
                    className="px-2 py-1 rounded disabled:opacity-50"
                    onClick={() => setPage(1)}
                    disabled={!canPrev}
                    title="Első oldal"
                  >
                    ⏮️
                  </button>
                  <button
                    className="px-2 py-1 rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!canPrev}
                    title="Előző oldal"
                  >
                    ◀️
                  </button>
                  <span className="px-2 text-sm">
                    {page} / {pageCount}
                  </span>
                  <button
                    className="px-2 py-1 rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={!canNext}
                    title="Következő oldal"
                  >
                    ▶️
                  </button>
                  <button
                    className="px-2 py-1 rounded disabled:opacity-50"
                    onClick={() => setPage(pageCount)}
                    disabled={!canNext}
                    title="Utolsó oldal"
                  >
                    ⏭️
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
