import React, { useState, useEffect } from "react"
import Logo from "../components/Logo"
import { getGlobalStats, getLastEntry } from "../api/public"

const HomePage = () => {
  const [globalStats, setGlobalStats] = useState({ totalCount: 0, totalMoney: 0 })
  const [lastEntry, setLastEntry] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const stats = await getGlobalStats()
        setGlobalStats(stats)
        const entry = await getLastEntry()
        setLastEntry(entry.entry)
      } catch (error) {
        console.error("Hiba az adatok betöltésekor:", error)
      }
    }
    loadData()
  }, [])

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: "HUF",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatLiters = (liters) => {
    return new Intl.NumberFormat("hu-HU", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(liters)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <Logo size={64} />
          <p className="text-sm text-gray-300">Ki hány sört iszik? — Írd be, kövesd, és elemezzük együtt.</p>
          <p className="text-text-secondary leading-relaxed">
            Ide beírhatjátok, hogy melyik sört és mennyit ittatok; ezekből statisztikákat készítünk, és
            összefoglaljuk, mennyi pénzt költöttetek rá összesen. Kezdj el egy bejegyzést, vagy nézd meg a
            havi statisztikákat.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center px-5 py-2 rounded-lg bg-accent text-bg font-semibold hover:brightness-105"
            >
              Megnézem a statisztikákat
            </a>
            <a
              href="/login"
              className="inline-flex items-center px-5 py-2 rounded-lg border border-border text-accent hover:bg-white/5"
            >
              Belépés / Regisztráció
            </a>
          </div>
        </div>

        <div className="bg-white/5 border border-white/6 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Gyors statisztikák</h2>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            <div className="p-4 bg-white/3 rounded-lg flex items-center justify-between">
              <div className="text-sm text-gray-300">Összes liter</div>
              <div className="text-lg font-semibold">{formatLiters(globalStats.totalCount || 0)} L</div>
            </div>
            <div className="p-4 bg-white/3 rounded-lg flex items-center justify-between">
              <div className="text-sm text-gray-300">Összes költség</div>
              <div className="text-lg font-semibold">{formatMoney(globalStats.totalMoney || 0)}</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-gray-300 mb-2">Legutolsó bejegyzés</h3>
            {lastEntry ? (
              <div className="p-2 rounded-md bg-white/2 text-gray-200">
                {lastEntry.username} — {lastEntry.beer_name} — {lastEntry.count} db (
                {(lastEntry.count * lastEntry.quantity).toFixed(1)} L)
              </div>
            ) : (
              <div className="p-2 rounded-md bg-white/2 text-gray-400">Nincs bejegyzés</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
