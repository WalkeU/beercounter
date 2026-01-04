import React, { useState } from "react"
import { deleteEntry } from "../api/beer"

const DeleteEntry = ({ isOpen, onClose, onSuccess, entry }) => {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setDeleting(true)
    setError("")
    try {
      await deleteEntry(entry.id)
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Hiba törlés közben:", error)
      const errorMsg = error.response?.data?.error || "Hiba történt a törlés során!"
      setError(errorMsg)
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={handleClose}
    >
      <div
        className="bg-surface border border-border rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Bejegyzés törlése</h2>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded bg-bg bg-opacity-10 border border-error text-error text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-text-primary">Biztosan törölni szeretnéd ezt a bejegyzést?</p>
            <div className="mt-2 p-3 bg-bg-secondary rounded text-sm">
              <div className="font-semibold">{entry?.beer_name || entry?.beer || "Ismeretlen"}</div>
              <div className="text-text-secondary mt-1">
                {entry?.count} × {entry?.quantity || 0.5}L{entry?.comment && <span> • {entry.comment}</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 rounded border border-border bg-bg-secondary text-text-primary hover:opacity-90"
            >
              Mégse
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 px-4 py-2 rounded bg-error text-bg hover:opacity-95 disabled:opacity-50"
            >
              {deleting ? "Törlés..." : "Törlés"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteEntry
