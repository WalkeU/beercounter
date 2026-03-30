import React, { useState, useEffect } from "react"
import { getBeers, createBeer, editBeer, deleteBeer } from "../api/beer"
import Navbar from "../components/Navbar"

const EditBeers = ({ isEmbedded = false }) => {
  const [beers, setBeers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingBeer, setEditingBeer] = useState(null)
  const [newBeer, setNewBeer] = useState({ name: "", abv: "", price: "", quantity: 0.5 })

  useEffect(() => {
    fetchBeers()
  }, [])

  const fetchBeers = async () => {
    try {
      setLoading(true)
      const allBeers = await getBeers("", 1000) // Get all beers
      setBeers(allBeers)
    } catch (error) {
      console.error("Error fetching beers:", error)
      setError("Hiba történt a sörök betöltésekor")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBeer = async (e) => {
    e.preventDefault()
    try {
      setError("")
      await createBeer(newBeer.name, newBeer.abv, newBeer.price, newBeer.quantity)
      // Reset form
      setNewBeer({ name: "", abv: "", price: "", quantity: 0.5 })
      fetchBeers() // Refresh list
    } catch (error) {
      console.error("Error creating beer:", error)
      const errorMsg = error.response?.data?.error || "Hiba történt a sör létrehozásakor"
      setError(errorMsg)
    }
  }

  const handleEditBeer = async (e) => {
    e.preventDefault()
    try {
      setError("")
      await editBeer(
        editingBeer.id,
        editingBeer.beerName || editingBeer.name,
        editingBeer.abv,
        editingBeer.price,
        editingBeer.quantity,
      )
      setEditingBeer(null)
      fetchBeers() // Refresh list
    } catch (error) {
      console.error("Error editing beer:", error)
      const errorMsg = error.response?.data?.error || "Hiba történt a sör módosításakor"
      setError(errorMsg)
    }
  }

  const handleDeleteBeer = async (beerId) => {
    if (!window.confirm("Biztosan törlöd ezt a sört?")) return
    try {
      setError("")
      await deleteBeer(beerId)
      fetchBeers() // Refresh list
    } catch (error) {
      console.error("Error deleting beer:", error)
      const errorMsg = error.response?.data?.error || "Hiba történt a sör törlésekor"
      setError(errorMsg)
    }
  }

  if (loading) {
    return (
      <div className={isEmbedded ? "" : "app min-h-screen"}>
        {!isEmbedded && <Navbar />}
        <div className={isEmbedded ? "" : "container p-6"}>
          <p>Betöltés...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={isEmbedded ? "" : "app min-h-screen"}>
      {!isEmbedded && <Navbar />}
      <div className={isEmbedded ? "" : "container mx-auto p-6"}>
        {!isEmbedded && <h1 className="text-2xl font-bold mb-6">Sörök kezelése</h1>}

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700">{error}</div>
        )}

        {/* Create new beer form */}
        <div className="mb-8 p-4 rounded border border-border bg-surface">
          <h2 className="text-xl font-semibold mb-4">Új sör hozzáadása</h2>
          <form onSubmit={handleCreateBeer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Név</label>
                <input
                  type="text"
                  value={newBeer.name}
                  onChange={(e) => setNewBeer({ ...newBeer, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-bg-secondary text-text-primary border border-border focus:outline-none focus:border-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">ABV (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newBeer.abv}
                  onChange={(e) => setNewBeer({ ...newBeer, abv: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-bg-secondary text-text-primary border border-border focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Ár (Ft)</label>
                <input
                  type="number"
                  value={newBeer.price}
                  onChange={(e) => setNewBeer({ ...newBeer, price: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-bg-secondary text-text-primary border border-border focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Mennyiség (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newBeer.quantity}
                  onChange={(e) => setNewBeer({ ...newBeer, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-bg-secondary text-text-primary border border-border focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 rounded bg-accent text-bg hover:opacity-95">
              Hozzáadás
            </button>
          </form>
        </div>

        {/* Beers list */}
        <div className="p-4 rounded border border-border bg-surface">
          <h2 className="text-xl font-semibold mb-4">Meglévő sörök</h2>
          <div className="space-y-2">
            {beers.map((beer) => (
              <div
                key={beer.id}
                className="flex items-center justify-between p-3 border border-border rounded"
              >
                <div>
                  <span className="font-semibold">{beer.beerName || beer.name}</span>
                  {beer.abv && <span className="text-sm text-text-secondary ml-2">({beer.abv}% ABV)</span>}
                  {beer.price && <span className="text-sm text-text-secondary ml-2">{beer.price} Ft</span>}
                  {beer.quantity && (
                    <span className="text-sm text-text-secondary ml-2">{beer.quantity} L</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingBeer(beer)}
                    className="px-3 py-1 rounded border border-border bg-bg-secondary hover:opacity-90"
                  >
                    Szerkesztés
                  </button>
                  <button
                    onClick={() => handleDeleteBeer(beer.id)}
                    className="px-3 py-1 rounded border border-error text-error hover:bg-error hover:text-bg"
                  >
                    Törlés
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit beer modal */}
        {editingBeer && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="bg-surface border border-border rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-xl font-semibold">Sör szerkesztése</h2>
                <button
                  onClick={() => setEditingBeer(null)}
                  className="text-text-secondary hover:text-text-primary text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleEditBeer} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Név</label>
                  <input
                    type="text"
                    value={editingBeer.beerName || editingBeer.name}
                    onChange={(e) => setEditingBeer({ ...editingBeer, beerName: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-bg-secondary text-text-primary border border-border focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">ABV (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBeer.abv || ""}
                    onChange={(e) => setEditingBeer({ ...editingBeer, abv: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-bg-secondary text-text-primary border border-border focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Ár (Ft)</label>
                  <input
                    type="number"
                    value={editingBeer.price || ""}
                    onChange={(e) => setEditingBeer({ ...editingBeer, price: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-bg-secondary text-text-primary border border-border focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Mennyiség (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBeer.quantity || 0.5}
                    onChange={(e) => setEditingBeer({ ...editingBeer, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-bg-secondary text-text-primary border border-border focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingBeer(null)}
                    className="flex-1 px-4 py-2 rounded border border-border bg-bg-secondary text-text-primary hover:opacity-90"
                  >
                    Mégse
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded bg-accent text-bg hover:opacity-95"
                  >
                    Mentés
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditBeers
