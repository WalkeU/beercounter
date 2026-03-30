import React from "react"

const TopList = ({ topUsers }) => (
  <div className="col-span-full lg:col-span-1 p-4 rounded border border-border bg-surface h-full">
    <h2 className="mb-2">Toplista</h2>
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

export default TopList
