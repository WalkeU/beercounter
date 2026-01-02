import React from "react"
import Logo from "../components/Logo"

const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <Logo size={64} />
          <p className="text-sm text-gray-300">
            Idén ki hány sört iszik? — Írd be, kövesd, és elemezzük együtt.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Ide beírhatjátok, hogy melyik sört és mennyit ittatok 2026-ban; ezekből statisztikákat készítünk,
            és összefoglaljuk, mennyi pénzt költöttetek rá összesen. Kezdj el egy bejegyzést, vagy nézd meg a
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
            <h2 className="text-2xl font-bold">Gyors statisztika</h2>
            <span className="text-sm text-gray-300">Dummy adatok</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-white/3 rounded-lg text-center">
              <div className="text-sm text-gray-300">Bejegyzések</div>
              <div className="text-2xl font-semibold">42</div>
            </div>
            <div className="p-4 bg-white/3 rounded-lg text-center">
              <div className="text-sm text-gray-300">Összes költség</div>
              <div className="text-2xl font-semibold">12 345 Ft</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-gray-300 mb-2">Legutóbbi bejegyzések</h3>
            <ul className="space-y-2 text-gray-200">
              <li className="p-2 rounded-md bg-white/2">Minta sör — 0 db</li>
              <li className="p-2 rounded-md bg-white/2">Minta sör 2 — 0 db</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
