import React, { useState } from "react"
import { changePassword } from "../api/user"

const ChangePasswordPage = () => {
  const [newPassword, setNewPassword] = useState("")
  const [newPassword2, setNewPassword2] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (newPassword.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie!")
      return
    }
    if (newPassword !== newPassword2) {
      setError("A jelszavak nem egyeznek!")
      return
    }
    try {
      await changePassword(newPassword)
      setSuccess("Jelszó sikeresen megváltoztatva!")
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500)
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba a jelszó megváltoztatásakor!")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2 text-center text-accent">Új jelszó beállítása</h1>
        <p className="text-sm text-text-secondary text-center mb-6">
          Az admin visszaállította a jelszavadat. Kérjük, adj meg egy új jelszót a folytatáshoz.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Új jelszó"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 bg-bg text-text-primary border border-border rounded-lg outline-none"
          />
          <input
            type="password"
            placeholder="Új jelszó újra"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            className="w-full px-4 py-2 bg-bg text-text-primary border border-border rounded-lg outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 bg-accent text-bg font-semibold rounded-lg transition border-0"
          >
            Jelszó megváltoztatása
          </button>
        </form>
        {error && <div className="mt-4 text-center text-error">{error}</div>}
        {success && <div className="mt-4 text-center text-success">{success}</div>}
      </div>
    </div>
  )
}

export default ChangePasswordPage
