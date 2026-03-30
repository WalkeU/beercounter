import React from "react"

const StatsCard = ({ globalTotal, myTotal, totalMoney, myMoney }) => (
  <div className="col-span-full lg:col-span-1 p-4 rounded border border-border bg-surface h-full">
    <h2 className="mb-2">Statisztikák</h2>
    <div className="mb-3">
      <div className="text-sm text-text-secondary">Összes (globális)</div>
      <div className="text-xl font-semibold">
        {globalTotal.toFixed(1) * 2} Korsó / {globalTotal.toFixed(1)} L
      </div>
      <div className="text-sm text-text-secondary">
        Érték: {totalMoney ? `${Math.round(totalMoney)} Ft` : "-"}
      </div>
    </div>
    <div className="mb-3">
      <div className="text-sm text-text-secondary">Saját</div>
      <div className="text-xl font-semibold">
        {myTotal.toFixed(1) * 2} Korsó / {myTotal.toFixed(1)} L
      </div>
      <div className="text-sm text-text-secondary">
        Érték: {myMoney ? `${Math.round(myMoney)} Ft` : "-"}
      </div>
    </div>
  </div>
)

export default StatsCard
