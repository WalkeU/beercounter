import React from "react"
import { useNavigate } from "react-router-dom"

const TopList = ({ topUsers, eventId }) => {
  const navigate = useNavigate()
  return (
    <div className="col-span-full lg:col-span-1 p-4 rounded border border-border bg-surface h-full">
      <div className="flex items-center justify-between mb-2">
        <h2>Toplista</h2>
        {!eventId && (
          <button
            onClick={() => navigate("/users")}
            className="text-sm px-3 py-1 rounded border border-accent text-accent hover:bg-accent hover:text-bg transition-colors"
          >
            Bővebben
          </button>
        )}
      </div>
      <div className="space-y-2">
        {topUsers.map((u, i) => (
          <div key={u.username} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-secondary">#{i + 1}</span>
              <span>{u.username}</span>
            </div>
            <span className="text-sm text-text-secondary">{u.count?.toFixed(1) || 0} L</span>
          </div>
        ))}
        {topUsers.length === 0 && <div className="text-sm text-text-secondary">Nincs még adat.</div>}
      </div>
    </div>
  )
}

export default TopList
