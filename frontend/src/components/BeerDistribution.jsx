import React from "react"
import { useNavigate } from "react-router-dom"

const palette = ["bg-rank-1", "bg-rank-2", "bg-rank-3", "bg-rank-4", "bg-rank-5"]

const BeerDistribution = ({ beerDist, eventId }) => {
  const navigate = useNavigate()
  const maxCount = Math.max(...beerDist.map((b) => b.count), 1)

  return (
    <div className="col-span-full lg:col-span-1 p-4 rounded border border-border bg-surface h-full">
      <div className="flex items-center justify-between mb-4">
        <h2>
          <span className="text-text-secondary">Top 5</span> Sör
        </h2>
        {!eventId && (
          <button
            onClick={() => navigate("/beers")}
            className="text-sm px-3 py-1 rounded border border-accent text-accent hover:bg-accent hover:text-bg transition-colors"
          >
            Bővebben
          </button>
        )}
      </div>
      <div className="space-y-2">
        {beerDist.slice(0, 5).map((b, i) => (
          <div key={b.beer}>
            <div className="flex justify-between text-sm mb-1">
              <div>{b.beer}</div>
              <div className="text-text-secondary">
                {b.count} ({b.percent}%)
              </div>
            </div>
            <div className="w-full h-3 rounded bg-bg-secondary overflow-hidden">
              <div
                className={`h-3 ${palette[i % palette.length]}`}
                style={{ width: `${(b.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {beerDist.length === 0 && <div className="text-sm text-text-secondary">Nincs még adat.</div>}
      </div>
    </div>
  )
}

export default BeerDistribution
