import React, { useState } from "react"
import { createEntry, getBeers } from "../api/beer"

const CreateEntry = ({ isOpen, onClose, onSuccess }) => {
  const [count, setCount] = useState(1)
  const [beer, setBeer] = useState("")
  const [beerSuggestions, setBeerSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const capitalizeBeer = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleBeerChange = async (value) => {
    const capitalized = capitalizeBeer(value)
    setBeer(capitalized)
    setError("") // Clear error when user types

    if (value.length > 0) {
      try {
        console.log("Searching for beers with:", value)
        const suggestions = await getBeers(value, 3)
        console.log("Got beer suggestions:", suggestions)
        setBeerSuggestions(suggestions)
        setShowSuggestions(true)
      } catch (error) {
        console.error("Error fetching beers:", error)
      }
    } else {
      // Default suggestions when empty
      setBeerSuggestions([
        { id: "default-1", name: "Pilsner Urquell", beerName: "Pilsner Urquell" },
        { id: "default-2", name: "Dreher Gold", beerName: "Dreher Gold" },
        { id: "default-3", name: "Krušovice", beerName: "Krušovice" },
      ])
      setShowSuggestions(true)
    }
  }

  const selectBeer = (beerName) => {
    setBeer(beerName)
    setShowSuggestions(false)
    setBeerSuggestions([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!beer || count <= 0) return
    setSaving(true)
    setError("")
    try {
      await createEntry(count, beer.trim(), comment.trim(), 0.5)
      // Reset form
      setCount(1)
      setBeer("")
      setBeerSuggestions([])
      setShowSuggestions(false)
      setComment("")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Hiba rögzítés közben:", error)
      const errorMsg = error.response?.data?.error || "Hiba történt a rögzítés során!"
      setError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setCount(1)
    setBeer("")
    setBeerSuggestions([])
    setShowSuggestions(false)
    setComment("")
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
        className="bg-surface border border-border rounded-lg shadow-xl max-w-2xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Rögzítek egy sört</h2>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded bg-bg bg-opacity-10 border border-error text-error text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Mennyiség (db)</label>
              <input
                type="number"
                min={1}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-bg-secondary text-text-primary border border-border focus:outline-none focus:border-accent"
              />
            </div>

            <div className="relative">
              <label className="block text-sm text-text-secondary mb-2">Sör</label>
              <input
                value={beer}
                onChange={(e) => handleBeerChange(e.target.value)}
                onFocus={() => {
                  if (beer.length === 0) {
                    setBeerSuggestions([
                      { id: "default-1", name: "Dreher Gold", beerName: "Dreher Gold" },
                      { id: "default-2", name: "Pilsner Urquell", beerName: "Pilsner Urquell" },
                      { id: "default-3", name: "Krušovice", beerName: "Krušovice" },
                    ])
                  }
                  setShowSuggestions(true)
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Kezd el írni a sört..."
                className="w-full px-3 py-2 rounded bg-bg-secondary text-text-primary border border-border focus:outline-none focus:border-accent"
                required
              />
              {showSuggestions && beerSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded shadow-lg max-h-48 overflow-y-auto">
                  {beerSuggestions.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => selectBeer(b.beerName || b.name)}
                      className="px-3 py-2 hover:bg-bg-secondary cursor-pointer text-text-primary"
                    >
                      {b.beerName || b.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Komment (opcionális)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Pl. jó buli volt"
                rows={3}
                className="w-full px-3 py-2 rounded bg-bg-secondary text-text-primary border border-border focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 rounded border border-border bg-bg-secondary text-text-primary hover:opacity-90"
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded bg-accent text-bg hover:opacity-95 disabled:opacity-50"
            >
              {saving ? "Mentés..." : "Rögzítés"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEntry
