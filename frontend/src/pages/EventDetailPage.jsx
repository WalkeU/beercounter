import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import CreateEntry from "../components/CreateEntry"
import EditEntry from "../components/EditEntry"
import DeleteEntry from "../components/DeleteEntry"
import RecentEntries from "../components/RecentEntries"
import { getCurrentUser } from "../api/user"
import {
  getEvent,
  joinEvent,
  leaveEvent,
  getEventEntries,
  getEventLeaderboard,
  getEventStats,
} from "../api/events"

const EventDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [event, setEvent] = useState(null)
  const [view, setView] = useState("global")
  const [globalEntries, setGlobalEntries] = useState([])
  const [myEntries, setMyEntries] = useState([])
  const [stats, setStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState({ userLeaderboard: [], entryLeaderboard: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [total, setTotal] = useState(0)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [editEntry, setEditEntry] = useState(null)
  const [deleteEntry, setDeleteEntry] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [lbTab, setLbTab] = useState("users")
  const [lbExpanded, setLbExpanded] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, view, page])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const isMine = view === "mine"
      const [userData, eventData, entriesData, lbData, statsData] = await Promise.all([
        getCurrentUser(),
        getEvent(id),
        getEventEntries(id, pageSize, (page - 1) * pageSize, isMine),
        getEventLeaderboard(id),
        getEventStats(id),
      ])
      setUser(userData)
      setEvent(eventData)
      setStats(statsData)
      setLeaderboard(lbData)
      setTotal(entriesData.total)
      if (isMine) setMyEntries(entriesData.entries)
      else setGlobalEntries(entriesData.entries)
    } catch (err) {
      setError("Hiba a betöltés során!")
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    setActionLoading(true)
    try {
      await joinEvent(id)
      await fetchAll()
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba a csatlakozáskor!")
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!window.confirm("Biztosan kilépsz az eseményből?")) return
    setActionLoading(true)
    try {
      await leaveEvent(id)
      await fetchAll()
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba a kilépéskor!")
    } finally {
      setActionLoading(false)
    }
  }

  const getCountdown = (targetStr) => {
    if (!targetStr) return null
    const diff = new Date(targetStr).getTime() - now
    if (diff <= 0) return null
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    const parts = []
    if (days > 0) parts.push(`${days} nap`)
    if (hours > 0) parts.push(`${hours} óra`)
    parts.push(`${mins} perc`)
    return parts.join(" ")
  }

  const pageCount = Math.ceil(total / pageSize)
  const currentEntries = view === "mine" ? myEntries : globalEntries

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

  if (!event) {
    return (
      <div className="app min-h-screen">
        <Navbar />
        <div className="container p-6">
          <p className="text-error">Esemény nem található.</p>
        </div>
      </div>
    )
  }

  const isJoined = event.is_joined > 0
  const myRow = leaderboard.userLeaderboard.find((u) => u.username === user?.username)
  const myTotal = myRow ? parseFloat(myRow.total_liters) : 0
  const myMoney = myRow ? parseFloat(myRow.total_money ?? 0) : 0
  const eventTotal = parseFloat(stats?.totalCount ?? 0)
  const eventMoney = parseFloat(stats?.totalMoney ?? 0)

  const endCountdown = getCountdown(event.end_date)
  const startCountdown = getCountdown(event.start_date)
  const countdownLabel = endCountdown
    ? `Hátralévő idő: ${endCountdown}`
    : startCountdown
      ? `Kezdésig: ${startCountdown}`
      : null

  const lbUsers = leaderboard.userLeaderboard
  const lbEntries = leaderboard.entryLeaderboard
  const lbData = lbTab === "users" ? lbUsers : lbEntries
  const lbVisible = lbExpanded ? lbData : lbData.slice(0, 5)

  return (
    <div className="app min-h-screen">
      <Navbar />

      {event.is_active && countdownLabel && (
        <div className="bg-accent text-bg text-center py-2 px-4 font-semibold text-sm">{countdownLabel}</div>
      )}

      <div className="container mx-auto p-6">
        {/* Event header */}
        <div className="flex flex-col mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold">{event.name}</h1>
            {event.is_active ? (
              <span className="text-xs bg-accent text-bg px-2 py-0.5 rounded">Aktív</span>
            ) : (
              <span className="text-xs border border-border text-text-secondary px-2 py-0.5 rounded">
                Lezárt
              </span>
            )}
            {isJoined && (
              <span className="text-xs border border-accent text-accent px-2 py-0.5 rounded">
                Csatlakozva
              </span>
            )}
          </div>
        </div>
        {event.is_active && (
          <div className="flex gap-2 flex-wrap mb-4">
            {isJoined && (
              <button
                onClick={() => setFormOpen(true)}
                className="px-4 py-2 rounded border border-border bg-surface hover:opacity-90"
              >
                Ittam sört
              </button>
            )}
            {isJoined ? (
              <button
                onClick={handleLeave}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded border border-border bg-bg-secondary text-sm hover:opacity-90 disabled:opacity-50"
              >
                {actionLoading ? "..." : "Kilépés az eseményből"}
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="px-4 py-2 rounded bg-accent text-bg hover:opacity-90 disabled:opacity-50"
              >
                {actionLoading ? "..." : "Csatlakozás"}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded border border-error text-error text-sm bg-surface">{error}</div>
        )}

        {/* Row 1: Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded border border-border bg-surface">
            <div className="text-sm text-text-secondary mb-1">Saját</div>
            <div className="text-lg md:text-2xl font-bold">{(myTotal * 2).toFixed(1)} Korsó</div>
            <div className="text-lg font-semibold">{myTotal.toFixed(1)} L</div>
            <div className="text-sm text-text-secondary mt-1">
              {myMoney > 0 ? `${Math.round(myMoney).toLocaleString("hu-HU")} Ft` : "–"}
            </div>
          </div>
          <div className="p-4 rounded border border-border bg-surface">
            <div className="text-sm text-text-secondary mb-1">Összes</div>
            <div className="text-lg md:text-2xl font-bold">{(eventTotal * 2).toFixed(1)} Korsó</div>
            <div className="text-lg font-semibold">{eventTotal.toFixed(1)} L</div>
            <div className="text-sm text-text-secondary mt-1">
              {eventMoney > 0 ? `${Math.round(eventMoney).toLocaleString("hu-HU")} Ft` : "–"}
            </div>
          </div>
        </div>

        {/* Row 2: Leaderboard */}
        <div className="mb-6 p-4 rounded border border-border bg-surface">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Toplista</h2>
            <div className="flex items-center gap-2">
              <div className="flex rounded overflow-hidden">
                <button
                  onClick={() => {
                    setLbTab("users")
                    setLbExpanded(false)
                  }}
                  className={`px-3 py-1 text-sm ${lbTab === "users" ? "bg-accent text-bg" : "bg-bg-secondary"}`}
                >
                  Emberek
                </button>
                <button
                  onClick={() => {
                    setLbTab("entries")
                    setLbExpanded(false)
                  }}
                  className={`px-3 py-1 text-sm ${lbTab === "entries" ? "bg-accent text-bg" : "bg-bg-secondary"}`}
                >
                  Sörök
                </button>
              </div>
            </div>
          </div>

          {lbData.length === 0 ? (
            <p className="text-text-secondary text-sm">Még nincs adat.</p>
          ) : lbTab === "users" ? (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-text-secondary border-b border-border">
                  <th className="text-left pb-2 w-6">#</th>
                  <th className="text-left pb-2">Felhasználó</th>
                  <th className="text-right pb-2">Liter</th>
                  <th className="text-right pb-2">Összeg</th>
                </tr>
              </thead>
              <tbody>
                {lbVisible.map((u, i) => (
                  <tr
                    key={u.username}
                    className={`border-b border-bg-secondary last:border-b-0 ${u.username === user?.username ? "text-accent" : ""}`}
                  >
                    <td className="py-2 text-text-secondary text-sm">{i + 1}.</td>
                    <td className="py-2 font-semibold">{u.username}</td>
                    <td className="py-2 text-right text-sm">{parseFloat(u.total_liters).toFixed(2)} L</td>
                    <td className="py-2 text-right text-sm text-text-secondary">
                      {u.total_money > 0 ? `${Math.round(u.total_money).toLocaleString("hu-HU")} Ft` : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-text-secondary border-b border-border">
                  <th className="text-left pb-2 w-6">#</th>
                  <th className="text-left pb-2">Sör / Felhasználó</th>
                  <th className="text-right pb-2">Liter</th>
                </tr>
              </thead>
              <tbody>
                {lbVisible.map((e, i) => (
                  <tr key={e.id} className="border-b border-bg-secondary last:border-b-0">
                    <td className="py-2 text-text-secondary text-sm">{i + 1}.</td>
                    <td className="py-2">
                      <div className="font-semibold">{e.beer_name}</div>
                      <div className="text-xs text-text-secondary">
                        {e.username}
                        {e.comment ? ` – ${e.comment}` : ""}
                      </div>
                    </td>
                    <td className="py-2 text-right text-sm">{parseFloat(e.total_liters).toFixed(2)} L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {lbData.length > 5 && (
            <button
              onClick={() => setLbExpanded((v) => !v)}
              className="w-full text-center py-3 text-text-secondary hover:text-text-primary transition-colors"
            >
              {lbExpanded ? "Kevesebb ▲" : `Összes megtekintése ▼`}
            </button>
          )}
        </div>

        {/* Row 3: Recent entries with Global/Mine toggle */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold">Legutóbbi bejegyzések</span>
          <div className="flex rounded overflow-hidden">
            <button
              onClick={() => {
                setView("global")
                setPage(1)
              }}
              className={`px-3 py-2 text-sm ${view === "global" ? "bg-accent text-bg" : "bg-surface"}`}
            >
              Globális
            </button>
            <button
              onClick={() => {
                setView("mine")
                setPage(1)
              }}
              className={`px-3 py-2 text-sm ${view === "mine" ? "bg-accent text-bg" : "bg-surface"}`}
            >
              Saját
            </button>
          </div>
        </div>
        <RecentEntries
          entries={currentEntries}
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

        <CreateEntry
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSuccess={fetchAll}
          eventId={parseInt(id)}
        />
        <EditEntry
          isOpen={!!editEntry}
          onClose={() => setEditEntry(null)}
          onSuccess={fetchAll}
          entry={editEntry}
        />
        <DeleteEntry
          isOpen={!!deleteEntry}
          onClose={() => setDeleteEntry(null)}
          onSuccess={fetchAll}
          entry={deleteEntry}
        />
      </div>
    </div>
  )
}

export default EventDetailPage
