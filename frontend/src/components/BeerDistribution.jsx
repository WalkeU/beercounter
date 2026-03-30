import React from "react"

const palette = ["bg-rank-1", "bg-rank-2", "bg-rank-3", "bg-rank-4", "bg-rank-5"]

const BeerDistribution = ({ beerDist }) => {
  const maxCount = Math.max(...beerDist.map((b) => b.count), 1)

  return (
    <div className="col-span-full lg:col-span-1 p-4 rounded border border-border bg-surface h-full">
      <h2>
        Sörmegoszlás <span className="text-text-secondary">Top 5</span>
      </h2>
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
                style={{ width: `${Math.pow(b.count / maxCount, 10) * 100}%` }}
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
