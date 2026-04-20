import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../api/user"
import { getRecentEntries, getUserEntries, getGlobalStats, getUserStats, getTopUsers } from "../api/beer"
import { getEvents } from "../api/events"
import Navbar from "../components/Navbar"
import CreateEntry from "../components/CreateEntry"
import EditEntry from "../components/EditEntry"
import DeleteEntry from "../components/DeleteEntry"
import StatsCard from "../components/StatsCard"
import BeerDistribution from "../components/BeerDistribution"
import TopList from "../components/TopList"
import RecentEntries from "../components/RecentEntries"

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [view, setView] = useState("global")
  const [globalEntries, setGlobalEntries] = useState([])
  const [myEntries, setMyEntries] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [total, setTotal] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [topUsers, setTopUsers] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [editEntry, setEditEntry] = useState(null)
  const [deleteEntry, setDeleteEntry] = useState(null)
  const [joinedEvents, setJoinedEvents] = useState([])

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
        const [s, topUsersData] = await Promise.all([
          getGlobalStats().catch(() => null),
          getTopUsers().catch(() => []),
        ])
        setStats(s)
        setTopUsers(topUsersData)
        const allEvents = await getEvents().catch(() => [])
        setJoinedEvents(allEvents.filter((ev) => ev.is_joined > 0 && ev.is_active))
      } catch (error) {
        console.error("Hiba a betöltés során:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, page])

  const refreshLists = () => {
    window.location.reload()
  }

  const sumEntries = (arr) => arr.reduce((s, it) => s + (it.count || 0) * (it.quantity || 0.5), 0)

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
        <div className="container p-6">
          <p>Betöltés...</p>
        </div>
      </div>
    )
  }

  const globalTotal = stats?.totalCount ?? sumEntries(globalEntries)
  const myTotal = userStats?.totalCount ?? sumEntries(myEntries)
  const beerDist = computeBeerDistribution(view === "global")
  const pageCount = Math.ceil(total / pageSize)

  return (
    <div className="app min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        {/* Joined active events banners */}
        {joinedEvents.length > 0 && (
          <div className="mb-6 space-y-2">
            {joinedEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => navigate(`/events/${ev.id}`)}
                className="w-full flex items-center justify-between px-5 py-3 rounded border border-accent bg-surface hover:bg-accent hover:text-bg transition-colors group"
              >
                <span className="font-semibold">{ev.name}</span>
                <span className="text-sm opacity-70 group-hover:opacity-100">Megnyitás →</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => setFormOpen((s) => !s)}
              className="px-4 py-2 rounded border border-border bg-surface hover:opacity-90"
            >
              Ittam sört
            </button>
          </div>
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

        <CreateEntry isOpen={formOpen} onClose={() => setFormOpen(false)} onSuccess={refreshLists} />
        <EditEntry
          isOpen={!!editEntry}
          onClose={() => setEditEntry(null)}
          onSuccess={refreshLists}
          entry={editEntry}
        />
        <DeleteEntry
          isOpen={!!deleteEntry}
          onClose={() => setDeleteEntry(null)}
          onSuccess={refreshLists}
          entry={deleteEntry}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <StatsCard
            globalTotal={globalTotal}
            myTotal={myTotal}
            totalMoney={stats?.totalMoney}
            myMoney={userStats?.totalMoney}
          />
          <BeerDistribution beerDist={beerDist} />
          <TopList topUsers={topUsers} />
          <RecentEntries
            entries={view === "global" ? globalEntries : myEntries}
            view={view}
            user={user}
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onEdit={setEditEntry}
            onDelete={setDeleteEntry}
          />
        </div>

        {/* Events button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => navigate("/events")}
            className="px-6 py-3 rounded border border-border bg-surface hover:border-accent hover:text-accent transition-colors font-semibold"
          >
            Események
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
