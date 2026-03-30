import React, { useState } from "react"
import { register, login } from "../api/user"

const ASZF_TEXT = `FELHASZNÁLÁSI FELTÉTELEK

Ez az oldal kizárólag szórakoztató célokat szolgál barátok körében. Az alábbiakat kérjük, hogy vedd figyelembe:

1. NEM ÖSZTÖNZÉS ALKOHOLFOGYASZTÁSRA
Ez az oldal nem ösztönöz senkit alkohol fogyasztására. A BeerCount egy vicces, informális nyilvántartó barátok között – semmi több.

2. MIRE JÓ AZ OLDAL?
Beírod hány sört ittál, mikor és milyen alkalomból. Van toplista és megjegyzés funkció is. Ez az egész lényege.

3. ADATAID
• Az e-mail-cím megadása kötelező a regisztrációhoz, de semmire más célra nem használjuk.
• A jelszavad titkosítva (hash-elve) tárolódik – mi sem látjuk.

4. FELELŐSSÉG
A weboldal üzemeltetője nem vállal felelősséget az oldal tartalmából, használatából vagy az azon rögzített adatokból eredő következményekért.

Azzal, hogy regisztrálsz, elfogadod ezeket a feltételeket.`

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [aszfAccepted, setAszfAccepted] = useState(false)
  const [showAszf, setShowAszf] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (isLogin) {
      if (!username || !password) {
        setError("Minden mező kötelező!")
        return
      }
      try {
        await login(username, password)
        setSuccess("Sikeres bejelentkezés!")
        setError("")
        window.location.href = "/dashboard"
      } catch (err) {
        setError(err?.response?.data?.error || "Hibás felhasználónév vagy jelszó!")
      }
    } else {
      if (!email || !username || !password || !password2) {
        setError("Minden mező kötelező!")
        return
      }
      if (password !== password2) {
        setError("A jelszavak nem egyeznek!")
        return
      }
      if (!aszfAccepted) {
        setError("El kell fogadnod a felhasználási feltételeket!")
        return
      }
      try {
        await register(email, username, password, password2)
        setSuccess("Sikeres regisztráció! Most már bejelentkezhetsz.")
        setIsLogin(true)
        setEmail("")
        setUsername("")
        setPassword("")
        setPassword2("")
      } catch (err) {
        setError(err?.response?.data?.error || "Hiba a regisztráció során!")
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      {showAszf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-accent">Felhasználási feltételek</h2>
              <button
                type="button"
                onClick={() => setShowAszf(false)}
                className="text-text-secondary hover:text-text-primary text-xl font-bold leading-none"
              >
                &times;
              </button>
            </div>
            <pre className="px-6 py-4 overflow-y-auto text-sm text-text-secondary whitespace-pre-wrap font-sans flex-1">
              {ASZF_TEXT}
            </pre>
            <div className="px-6 py-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAszfAccepted(true)
                  setShowAszf(false)
                }}
                className="px-6 py-2 bg-accent text-bg font-semibold rounded-lg"
              >
                Elfogadom
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-accent">
          {isLogin ? "Bejelentkezés" : "Regisztráció"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-bg text-text-primary border border-border rounded-lg outline-none"
            />
          )}
          <input
            type="text"
            placeholder="Felhasználónév"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-bg text-text-primary border border-border rounded-lg outline-none"
          />
          <input
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-bg text-text-primary border border-border rounded-lg outline-none"
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Jelszó újra"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full px-4 py-2 bg-bg text-text-primary border border-border rounded-lg outline-none"
            />
          )}
          {!isLogin && (
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aszfAccepted}
                  onChange={(e) => setAszfAccepted(e.target.checked)}
                  className="mt-1 accent-accent"
                />
                <span className="text-sm text-text-secondary">
                  Elolvastam és elfogadom a{" "}
                  <button type="button" onClick={() => setShowAszf(true)} className="text-accent underline">
                    felhasználási feltételeket
                  </button>
                </span>
              </label>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 bg-accent text-bg font-semibold rounded-lg transition border-0"
          >
            {isLogin ? "Bejelentkezés" : "Regisztráció"}
          </button>
        </form>
        {error && <div className="mt-4 text-center text-error">{error}</div>}
        {success && <div className="mt-4 text-center text-success">{success}</div>}
        <div className="mt-6 text-center">
          {isLogin ? (
            <span>
              Nincs fiókod?{" "}
              <button
                onClick={() => {
                  setIsLogin(false)
                  setError("")
                  setSuccess("")
                }}
                className="font-medium text-accent underline cursor-pointer"
              >
                Regisztrálj!
              </button>
            </span>
          ) : (
            <span>
              Van már fiókod?{" "}
              <button
                onClick={() => {
                  setIsLogin(true)
                  setError("")
                  setSuccess("")
                }}
                className="font-medium text-accent underline cursor-pointer"
              >
                Lépj be!
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
