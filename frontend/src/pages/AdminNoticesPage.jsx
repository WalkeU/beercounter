import React, { useEffect, useState } from "react"
import {
  adminGetAllNotices,
  adminGetNoticeAcks,
  adminCreateNotice,
  adminUpdateNotice,
  adminDeleteNotice,
} from "../api/notice"

const emptyForm = { notice_key: "", title: "", content: "", button_text: "Elfogadom" }

const AdminNoticesPage = () => {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Create / Edit form
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  // Acks panel
  const [acksNoticeId, setAcksNoticeId] = useState(null)
  const [acks, setAcks] = useState([])
  const [acksLoading, setAcksLoading] = useState(false)

  const fetchNotices = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await adminGetAllNotices()
      setNotices(data)
    } catch {
      setError("Nem sikerült betölteni az értesítéseket.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [])

  const handleEdit = (notice) => {
    setEditingId(notice.id)
    setForm({
      notice_key: notice.notice_key,
      title: notice.title,
      content: notice.content,
      button_text: notice.button_text || "Elfogadom",
    })
    setFormError("")
    setAcksNoticeId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError("")
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Biztosan törlöd ezt az értesítést?")) return
    try {
      await adminDeleteNotice(id)
      if (acksNoticeId === id) setAcksNoticeId(null)
      if (editingId === id) handleCancelEdit()
      await fetchNotices()
    } catch {
      setError("Törlés sikertelen.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")
    if (!form.notice_key.trim() || !form.title.trim() || !form.content.trim()) {
      setFormError("A kulcs, a cím és a tartalom kötelező!")
      return
    }
    setFormLoading(true)
    try {
      if (editingId) {
        await adminUpdateNotice(editingId, {
          title: form.title,
          content: form.content,
          button_text: form.button_text,
        })
      } else {
        await adminCreateNotice(form)
      }
      handleCancelEdit()
      await fetchNotices()
    } catch (err) {
      setFormError(err?.response?.data?.error || "Hiba történt.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleShowAcks = async (id) => {
    if (acksNoticeId === id) {
      setAcksNoticeId(null)
      return
    }
    setAcksNoticeId(id)
    setAcksLoading(true)
    try {
      const data = await adminGetNoticeAcks(id)
      setAcks(data)
    } catch {
      setAcks([])
    } finally {
      setAcksLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create / Edit form */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-lg font-bold text-accent mb-4">
          {editingId ? "Értesítés szerkesztése" : "Új értesítés létrehozása"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-secondary">Kulcs (notice_key)</label>
            <input
              type="text"
              className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary text-sm disabled:opacity-50"
              value={form.notice_key}
              onChange={(e) => setForm((f) => ({ ...f, notice_key: e.target.value }))}
              disabled={!!editingId}
              placeholder="pl. terms_v1"
            />
            {editingId && (
              <span className="text-xs text-text-muted">A kulcs szerkesztése nem lehetséges.</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-secondary">Cím</label>
            <input
              type="text"
              className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Értesítés címe"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-secondary">Tartalom</label>
            <textarea
              rows={5}
              className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary text-sm resize-y"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Értesítés szövege..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-secondary">Gomb szövege</label>
            <input
              type="text"
              className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
              value={form.button_text}
              onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))}
              placeholder="Elfogadom"
            />
          </div>
          {formError && <p className="text-error text-sm">{formError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 bg-accent text-bg font-semibold rounded-lg text-sm disabled:opacity-50"
            >
              {editingId ? "Mentés" : "Létrehozás"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-2 border border-border text-text-secondary rounded-lg text-sm hover:text-text-primary"
              >
                Mégse
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Notices list */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-lg font-bold text-accent mb-4">Értesítések</h2>
        {loading && <p className="text-text-muted text-sm">Betöltés...</p>}
        {error && <p className="text-error text-sm">{error}</p>}
        {!loading && notices.length === 0 && <p className="text-text-muted text-sm">Nincs még értesítés.</p>}
        <div className="space-y-3">
          {notices.map((n) => (
            <div key={n.id} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-start justify-between gap-3 px-4 py-3 bg-bg-secondary">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text-primary">{n.title}</span>
                    <span className="text-xs text-text-muted bg-bg px-2 py-0.5 rounded-full border border-border">
                      {n.notice_key} v{n.version}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(n.created_at).toLocaleString("hu-HU")} · Gomb: „{n.button_text}"
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleShowAcks(n.id)}
                    className={`text-xs px-3 py-1 rounded-lg border transition ${
                      acksNoticeId === n.id
                        ? "border-accent text-accent"
                        : "border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Megerősítők
                  </button>
                  <button
                    onClick={() => handleEdit(n)}
                    className="text-xs px-3 py-1 rounded-lg border border-border text-text-secondary hover:text-text-primary transition"
                  >
                    Szerkesztés
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-xs px-3 py-1 rounded-lg border border-error text-error hover:bg-error hover:text-bg transition"
                  >
                    Törlés
                  </button>
                </div>
              </div>

              {/* Acks panel */}
              {acksNoticeId === n.id && (
                <div className="px-4 py-3 border-t border-border">
                  <p className="text-xs font-semibold text-text-secondary mb-2">Akik már megerősítették:</p>
                  {acksLoading ? (
                    <p className="text-xs text-text-muted">Betöltés...</p>
                  ) : acks.length === 0 ? (
                    <p className="text-xs text-text-muted">Még senki sem erősítette meg.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {acks.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-1.5 bg-bg border border-border rounded-lg px-2 py-1"
                        >
                          <span className="text-xs text-text-primary font-medium">{a.username}</span>
                          <span className="text-xs text-text-muted">
                            {new Date(a.acknowledged_at).toLocaleString("hu-HU")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminNoticesPage
