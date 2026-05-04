import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { getEvents, joinEvent, leaveEvent } from "../api/events"

const EventsPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      setError("Hiba az események betöltésekor!")
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e, eventId) => {
    e.stopPropagation()
    setActionLoading(eventId)
    try {
      await joinEvent(eventId)
      await fetchEvents()
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba a csatlakozáskor!")
    } finally {
      setActionLoading(null)
    }
  }

  const handleLeave = async (e, eventId) => {
    e.stopPropagation()
    if (!window.confirm("Biztosan kilépsz az eseményből?")) return
    setActionLoading(eventId)
    try {
      await leaveEvent(eventId)
      await fetchEvents()
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba a kilépéskor!")
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleString("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="app min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6">
          <p>Betöltés...</p>
        </div>
      </div>
    )
  }

  const activeEvents = events.filter((e) => e.is_active)
  const inactiveEvents = events.filter((e) => !e.is_active)

  return (
    <div className="app min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Események</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded border border-border bg-surface hover:opacity-90 text-sm"
          >
            ← Vissza
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded border border-error text-error text-sm bg-surface">{error}</div>
        )}

        {events.length === 0 && (
          <div className="p-8 text-center text-text-secondary border border-border rounded bg-surface">
            Jelenleg nincs esemény.
          </div>
        )}

        {activeEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-accent">Aktív események</h2>
            <div className="space-y-3">
              {activeEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onCardClick={() => navigate(`/events/${ev.id}`)}
                  onJoin={(e) => handleJoin(e, ev.id)}
                  actionLoading={actionLoading === ev.id}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}

        {inactiveEvents.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-text-secondary">Lezárt események</h2>
            <div className="space-y-3">
              {inactiveEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onCardClick={() => navigate(`/events/${ev.id}`)}
                  onJoin={null}
                  actionLoading={false}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const EventCard = ({ event, onCardClick, onJoin, actionLoading, formatDate }) => {
  return (
    <div
      onClick={onCardClick}
      className="p-4 rounded border border-border bg-surface hover:border-accent cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-text-primary truncate">{event.name}</span>
            {event.is_active ? (
              <span className="shrink-0 text-xs bg-accent text-bg px-2 py-0.5 rounded">Aktív</span>
            ) : (
              <span className="shrink-0 text-xs border border-border text-text-secondary px-2 py-0.5 rounded">
                Lezárt
              </span>
            )}
            {event.is_joined > 0 && (
              <span className="shrink-0 text-xs border border-accent text-accent px-2 py-0.5 rounded">
                Csatlakozva
              </span>
            )}
          </div>
          {event.description && <p className="text-sm text-text-secondary mb-2">{event.description}</p>}
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span>{event.participant_count} résztvevő</span>
            {event.start_date && <span>Kezdés: {formatDate(event.start_date)}</span>}
            {event.end_date && <span>Vége: {formatDate(event.end_date)}</span>}
          </div>
        </div>
        {onJoin && (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onJoin}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded bg-accent text-bg text-sm hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading ? "..." : "Csatlakozás"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage
