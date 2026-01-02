import React, { useState } from "react"
import { register, login } from "../api/user"

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-accent">
          {isLogin ? "Bejelentkezés" : "Regisztráció"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              // type="email"
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
