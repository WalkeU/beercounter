import React, { useState, useEffect } from "react"
import { adminGetUsers, adminResetPassword } from "../api/user"
import Navbar from "../components/Navbar"

const AdminUsersPage = ({ isEmbedded = false }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tempPassword, setTempPassword] = useState(null)
  const [resetUsername, setResetUsername] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminGetUsers()
      setUsers(data)
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba a felhasználók betöltésekor!")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (userId, username) => {
    if (!window.confirm(`Biztosan visszaállítod ${username} jelszavát?`)) return
    try {
      setError("")
      const result = await adminResetPassword(userId)
      setTempPassword(result.tempPassword)
      setResetUsername(result.username)
      fetchUsers()
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba a jelszó visszaállításakor!")
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
        {!isEmbedded && <h1 className="text-2xl font-bold mb-6">Felhasználók kezelése</h1>}

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700">{error}</div>
        )}

        <div className="p-4 rounded border border-border bg-surface">
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border border-border rounded"
              >
                <div>
                  <span className="font-semibold">{user.username}</span>
                  <span className="text-sm text-text-secondary ml-2">{user.email}</span>
                  {user.is_admin ? (
                    <span className="ml-2 text-xs bg-accent text-bg px-2 py-0.5 rounded">Admin</span>
                  ) : null}
                  {user.must_change_password ? (
                    <span className="ml-2 text-xs border border-yellow-500 text-yellow-500 px-2 py-0.5 rounded">
                      Jelszó csere szükséges
                    </span>
                  ) : null}
                </div>
                <button
                  onClick={() => handleResetPassword(user.id, user.username)}
                  className="px-3 py-1 rounded border border-border bg-bg-secondary hover:opacity-90 text-sm"
                >
                  Jelszó visszaállítása
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Temp password modal */}
        {tempPassword && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="bg-surface border border-border rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h2 className="text-xl font-semibold mb-4">Jelszó visszaállítva</h2>
              <p className="text-text-secondary mb-2">
                <span className="font-semibold text-text-primary">{resetUsername}</span> ideiglenes jelszava:
              </p>
              <div className="bg-bg border border-border rounded-lg px-4 py-3 font-mono text-lg tracking-widest text-center mb-4 select-all">
                {tempPassword}
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Add át ezt a jelszót a felhasználónak. Bejelentkezés után meg kell változtatnia.
              </p>
              <button
                onClick={() => setTempPassword(null)}
                className="w-full px-4 py-2 rounded bg-accent text-bg hover:opacity-95"
              >
                Bezárás
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsersPage
