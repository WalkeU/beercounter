import React, { useEffect, useState } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"
import Navbar from "../components/Navbar"
import { getTimeline, getUserList, getGlobalStats, getUserStats } from "../api/beer"
import { getCurrentUser } from "../api/user"

const MONTHS = ["Jan", "Feb", "Már", "Ápr", "Máj", "Jún", "Júl", "Aug", "Sze", "Okt", "Nov", "Dec"]
const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

const formatLabel = (row, groupBy, allMonths = false) => {
  if (groupBy === "year") return String(row.year)
  if (groupBy === "month") return MONTHS[(row.month || 1) - 1]
  if (groupBy === "day") {
    if (allMonths) return `${MONTHS[(row.month || 1) - 1]} ${String(row.day).padStart(2, "0")}`
    return String(row.day).padStart(2, "0")
  }
  return `${String(row.week).padStart(2, "0")}. hét`
}

// Helper function to generate all periods up to today for the selected year
const generateAllPeriods = (groupBy, year, month) => {
  const today = new Date()
  const periods = []

  if (groupBy === "week") {
    // Generate all weeks of the selected year up to today using ISO 8601 week numbering
    const yearNum = Number(year)

    // Calculate the week number for a date
    const getWeekNumber = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
    }

    const maxWeek = getWeekNumber(today)
    for (let w = 1; w <= maxWeek; w++) {
      periods.push({ year: yearNum, week: w })
    }
  } else if (groupBy === "month") {
    // Generate all months of the selected year up to today
    const yearNum = Number(year)
    for (let m = 1; m <= 12; m++) {
      const monthDate = new Date(yearNum, m - 1, 1)
      if (monthDate.getFullYear() < yearNum || (monthDate.getFullYear() === yearNum && monthDate <= today)) {
        periods.push({ year: yearNum, month: m })
      }
    }
  } else if (groupBy === "day") {
    // Generate all days for the selected month(s) up to today
    const yearNum = Number(year)

    if (month) {
      // Single month
      const monthNum = Number(month)
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const dayDate = new Date(yearNum, monthNum - 1, d)
        if (dayDate <= today) {
          periods.push({ year: yearNum, month: monthNum, day: d })
        }
      }
    } else {
      // All months of the year
      for (let m = 1; m <= 12; m++) {
        const daysInMonth = new Date(yearNum, m, 0).getDate()
        for (let d = 1; d <= daysInMonth; d++) {
          const dayDate = new Date(yearNum, m - 1, d)
          if (dayDate <= today) {
            periods.push({ year: yearNum, month: m, day: d })
          }
        }
      }
    }
  }

  return periods
}

// Helper function to merge fetched data with all periods, filling missing with 0
const fillMissingPeriods = (fetchedRows, groupBy, year, month = null) => {
  const allPeriods = generateAllPeriods(groupBy, year, month)
  const dataMap = new Map()

  // Create a map of existing data for quick lookup
  fetchedRows.forEach((row) => {
    let key
    if (groupBy === "week") {
      key = `${row.year}-${row.week}`
    } else if (groupBy === "month") {
      key = `${row.year}-${row.month}`
    } else if (groupBy === "day") {
      key = `${row.year}-${row.month}-${row.day}`
    }
    dataMap.set(key, row.total || 0)
  })

  // Create complete list with missing periods filled with 0
  const result = allPeriods.map((period) => {
    let key
    if (groupBy === "week") {
      key = `${period.year}-${period.week}`
    } else if (groupBy === "month") {
      key = `${period.year}-${period.month}`
    } else if (groupBy === "day") {
      key = `${period.year}-${period.month}-${period.day}`
    }
    return {
      ...period,
      total: dataMap.get(key) ?? 0,
    }
  })

  return result
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded px-3 py-2 text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-accent">{Number(payload[0]?.value || 0).toFixed(2)} L</p>
    </div>
  )
}

const StatsPage = () => {
  const [userList, setUserList] = useState([])
  const [selectedUser, setSelectedUser] = useState("all")
  const [groupBy, setGroupBy] = useState("month")
  const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR))
  const [selectedMonth, setSelectedMonth] = useState("all")
  const allDays = groupBy === "day" && selectedMonth === "all"
  const [chartData, setChartData] = useState([])
  const [totalLiters, setTotalLiters] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const [, users] = await Promise.all([
          getCurrentUser().catch(() => null),
          getUserList().catch(() => []),
        ])
        setUserList(users)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Fetch chart + total when filters change
  useEffect(() => {
    const fetchData = async () => {
      setChartLoading(true)
      try {
        const yearParam = groupBy === "year" ? null : selectedYear
        const monthParam = groupBy === "day" && selectedMonth !== "all" ? selectedMonth : null
        const allMonths = groupBy === "day" && selectedMonth === "all"
        const [rows, statsData] = await Promise.all([
          getTimeline(groupBy, yearParam, monthParam, selectedUser),
          selectedUser === "all"
            ? getGlobalStats().catch(() => null)
            : getUserStats(selectedUser).catch(() => null),
        ])

        // Fill missing periods with 0 for week, month, and day views
        let filledRows = rows
        if (groupBy === "week" && yearParam) {
          filledRows = fillMissingPeriods(rows, groupBy, selectedYear, null)
        } else if (groupBy === "month" && yearParam) {
          filledRows = fillMissingPeriods(rows, groupBy, selectedYear, null)
        } else if (groupBy === "day" && monthParam) {
          filledRows = fillMissingPeriods(rows, groupBy, selectedYear, selectedMonth)
        } else if (groupBy === "day" && allMonths) {
          filledRows = fillMissingPeriods(rows, groupBy, selectedYear, null)
        }

        const mapped = filledRows.map((row) => ({
          label: formatLabel(row, groupBy, allMonths),
          total: Number(row.total || 0),
        }))
        setChartData(mapped)
        setTotalLiters(statsData?.totalCount ?? null)
      } catch (e) {
        console.error(e)
      } finally {
        setChartLoading(false)
      }
    }
    fetchData()
  }, [groupBy, selectedYear, selectedMonth, selectedUser])

  const periodLabel = () => {
    if (groupBy === "year") return "Összes év"
    if (groupBy === "month") return `${selectedYear} – hónapok`
    if (groupBy === "day" && selectedMonth === "all") return `${selectedYear} – összes nap`
    if (groupBy === "day") return `${selectedYear}. ${MONTHS[Number(selectedMonth) - 1]} – napok`
    return `${selectedYear} – hetek`
  }

  if (loading) {
    return (
      <div className="app min-h-screen">
        <Navbar />
        <div className="container p-6">
          <p>Betöltés...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="mb-6">Statisztikák</h1>

        {/* Filters — 1 row on desktop, stacked on mobile */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-6">
          {/* User selector — full row */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-xs text-text-secondary uppercase tracking-wide">Felhasználó</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent w-full sm:w-auto"
            >
              <option value="all">Mindenki</option>
              {userList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Group by + Év + Hónap — same row, equal width items */}
          <div className="flex gap-4 w-full">
            {/* Group by */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <label className="text-xs text-text-secondary uppercase tracking-wide">Bontás</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="sm:hidden w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              >
                <option value="year">Év</option>
                <option value="month">Hónap</option>
                <option value="week">Hét</option>
                <option value="day">Nap</option>
              </select>
              <div className="hidden sm:flex rounded overflow-hidden border border-border">
                {[
                  { key: "year", label: "Év" },
                  { key: "month", label: "Hónap" },
                  { key: "week", label: "Hét" },
                  { key: "day", label: "Nap" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setGroupBy(key)}
                    className={`flex-1 px-4 py-2 text-sm ${
                      groupBy === key ? "bg-accent text-bg font-semibold" : "bg-surface hover:opacity-80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Year selector — hidden when groupBy is "year" */}
            {groupBy !== "year" && (
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <label className="text-xs text-text-secondary uppercase tracking-wide">Év</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Month selector — only when groupBy is "day" */}
            {groupBy === "day" && (
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <label className="text-xs text-text-secondary uppercase tracking-wide">Hónap</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
                >
                  <option value="all">Összes</option>
                  {MONTHS.map((m, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded border border-border bg-surface">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Összes megivott sör</p>
            <p className="text-3xl font-bold text-accent">
              {totalLiters != null ? Number(totalLiters).toFixed(2) : "—"}
              <span className="text-base font-normal text-text-secondary ml-1">L</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              {selectedUser === "all" ? "Minden felhasználó összesítve" : `@${selectedUser}`}
            </p>
          </div>
          <div className="p-4 rounded border border-border bg-surface">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Megjelenített időszak</p>
            <p className="text-2xl font-bold text-accent">{periodLabel()}</p>
            <p className="text-xs text-text-muted mt-1">{chartData.length} adatpont</p>
          </div>
        </div>

        {/* Chart */}
        <div className="p-4 rounded border border-border bg-surface">
          <h2 className="mb-4 text-base font-semibold">
            Fogyasztás alakulása
            <span className="text-text-secondary font-normal"> – {periodLabel()}</span>
          </h2>
          {chartLoading ? (
            <div className="h-64 flex items-center justify-center text-text-secondary">Betöltés...</div>
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-text-secondary">
              Nincs adat a kiválasztott időszakra.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                barCategoryGap={allDays ? 1 : "10%"}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#cccccc", fontSize: allDays ? 9 : 12 }}
                  axisLine={{ stroke: "#444" }}
                  tickLine={false}
                  interval={allDays ? Math.floor(chartData.length / 12) : 0}
                />
                <YAxis
                  tick={{ fill: "#cccccc", fontSize: 12 }}
                  axisLine={{ stroke: "#444" }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}L`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,153,0,0.08)" }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="#ff9900" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatsPage
