import React, { useState, useEffect } from "react"
import { getEvents, createEvent, updateEvent, deleteEvent } from "../api/events"

const emptyForm = { name: "", description: "", start_date: "", end_date: "", is_active: 1 }

const AdminEventsPage = ({ isEmbedded = false }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

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

  const openCreate = () => {
    setEditingEvent(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (ev) => {
    setEditingEvent(ev)
    setForm({
      name: ev.name || "",
      description: ev.description || "",
      start_date: ev.start_date ? ev.start_date.slice(0, 16) : "",
      end_date: ev.end_date ? ev.end_date.slice(0, 16) : "",
      is_active: ev.is_active,
    })
    setFormOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError("")
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        is_active: form.is_active,
      }
      if (editingEvent) {
        await updateEvent(editingEvent.id, payload)
      } else {
        await createEvent(payload)
      }
      setFormOpen(false)
      await fetchEvents()
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba a mentéskor!")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ev) => {
    if (
      !window.confirm(
        `Biztosan törlöd a(z) "${ev.name}" eseményt? A bejegyzések megtartódnak, de leválnak az eseményről.`,
      )
    )
      return
    try {
      setError("")
      await deleteEvent(ev.id)
      await fetchEvents()
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba a törléskor!")
    }
  }

  const handleToggleActive = async (ev) => {
    const newStatus = ev.is_active ? 0 : 1
    const action = ev.is_active ? "Lezárni" : "Aktiválni"
    const confirmMsg = `Biztosan szeretnéd a(z) "${ev.name}" eseményt ${action.toLowerCase()}?`
    
    if (!window.confirm(confirmMsg)) return

    try {
      setError("")
      await updateEvent(ev.id, {
        name: ev.name,
        description: ev.description,
        start_date: ev.start_date,
        end_date: ev.end_date,
        is_active: newStatus,
      })
      await fetchEvents()
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba a státusz módosításakor!")
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "–"
    return new Date(dateStr).toLocaleString("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) return <p>Betöltés...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Események kezelése</h2>
        <button onClick={openCreate} className="px-4 py-2 rounded bg-accent text-bg hover:opacity-90 text-sm">
          + Új esemény
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded border border-error text-error text-sm bg-surface">{error}</div>
      )}

      {events.length === 0 && (
        <div className="p-8 text-center text-text-secondary border border-border rounded bg-surface">
          Nincs esemény. Hozz létre egyet!
        </div>
      )}

      <div className="space-y-2">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="p-4 rounded border border-border bg-surface flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold truncate">{ev.name}</span>
                {ev.is_active ? (
                  <span className="shrink-0 text-xs bg-accent text-bg px-2 py-0.5 rounded">Aktív</span>
                ) : (
                  <span className="shrink-0 text-xs border border-border text-text-secondary px-2 py-0.5 rounded">
                    Lezárt
                  </span>
                )}
              </div>
              {ev.description && <p className="text-sm text-text-secondary truncate">{ev.description}</p>}
              <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                <span>{ev.participant_count ?? 0} résztvevő</span>
                <span>Kezdés: {formatDate(ev.start_date)}</span>
                <span>Vége: {formatDate(ev.end_date)}</span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => handleToggleActive(ev)}
                className="px-3 py-1.5 rounded border border-border bg-bg-secondary text-sm hover:opacity-90"
              >
                {ev.is_active ? "Lezárás" : "Aktiválás"}
              </button>
              <button
                onClick={() => openEdit(ev)}
                className="px-3 py-1.5 rounded border border-border bg-bg-secondary text-sm hover:opacity-90"
              >
                Szerkesztés
              </button>
              <button
                onClick={() => handleDelete(ev)}
                className="px-3 py-1.5 rounded border border-error text-error text-sm hover:opacity-90"
              >
                Törlés
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit modal */}
      {formOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setFormOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-lg shadow-xl max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {editingEvent ? "Esemény szerkesztése" : "Új esemény létrehozása"}
              </h2>
              <button
                onClick={() => setFormOpen(false)}
                className="text-text-secondary hover:text-text-primary text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="p-3 rounded border border-error text-error text-sm">{error}</div>}
              <div>
                <label className="block text-sm text-text-secondary mb-1">Név *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded bg-bg border border-border focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Leírás</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded bg-bg border border-border focus:outline-none focus:border-accent resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Kezdés</label>
                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-bg border border-border focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Vége</label>
                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-bg border border-border focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={!!form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked ? 1 : 0 }))}
                  className="accent-accent"
                />
                <label htmlFor="is_active" className="text-sm">
                  Aktív esemény
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="flex-1 px-4 py-2 rounded border border-border bg-bg-secondary hover:opacity-90"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded bg-accent text-bg hover:opacity-95 disabled:opacity-50"
                >
                  {saving ? "Mentés..." : editingEvent ? "Mentés" : "Létrehozás"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEventsPage
