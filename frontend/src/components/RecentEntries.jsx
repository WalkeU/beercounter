import React from "react"

const RecentEntries = ({
  entries,
  view,
  user,
  page,
  pageCount,
  onPageChange,
  openMenuId,
  setOpenMenuId,
  onEdit,
  onDelete,
}) => {
  const canPrev = page > 1
  const canNext = page < pageCount

  return (
    <div className="col-span-full lg:col-span-3 h-full">
      <div className="mb-4 p-4 rounded border border-border bg-surface h-full flex flex-col relative pb-10 lg:pb-10">
        <h2 className="mb-2">Legutóbbi bejegyzések ({view === "global" ? "Globális" : "Saját"})</h2>
        <table className="w-full">
          <tbody>
            {entries.map((it) => (
              <tr key={it.id} className="border-b border-bg-secondary last:border-b-0 relative group">
                <td className="py-2 pr-4 align-center">
                  <div className="font-semibold">{it.beer_name || it.beer || "Ismeretlen"}</div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                    <span suppressHydrationWarning>
                      {new Date(it.created_at).toLocaleString("hu-HU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {it.comment && <span title={it.comment}>– {it.comment}</span>}
                  </div>
                </td>
                <td className="py-2 text-right align-center">
                  <div className="flex items-center justify-end gap-4">
                    <div className="text-m text-text-secondary">
                      {it.count} × {it.quantity || 0.5}L • {it.user?.username || it.username}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === it.id ? null : it.id)}
                        className="opacity-0 text-lg group-hover:opacity-100 px-0 py-1 text-text-secondary hover:text-text-primary transition-opacity"
                      >
                        ⋮
                      </button>
                      {openMenuId === it.id && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 mt-1 bg-surface border border-border rounded shadow-lg z-30 min-w-[200px]">
                            {user?.username === (it.user?.username || it.username) ? (
                              <>
                                <button
                                  onClick={() => {
                                    onEdit(it)
                                    setOpenMenuId(null)
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-bg-secondary text-text-primary"
                                >
                                  Módosítás
                                </button>
                                <button
                                  onClick={() => {
                                    onDelete(it)
                                    setOpenMenuId(null)
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-bg-secondary text-text-primary text-error"
                                >
                                  Törlés
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setOpenMenuId(null)}
                                className="w-full px-4 py-2 text-left hover:bg-bg-secondary text-text-primary"
                              >
                                Felhasználó megtekintése
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageCount > 1 && (
          <div className="flex items-center bg-surface/80 p-2 absolute left-0 right-0 bottom-0 w-full rounded-none z-20 justify-between lg:right-4 lg:bottom-4 lg:w-auto lg:rounded lg:justify-end">
            <button
              className="px-2 py-1 rounded disabled:opacity-50"
              onClick={() => onPageChange(1)}
              disabled={!canPrev}
              title="Első oldal"
            >
              ⏮️
            </button>
            <button
              className="px-2 py-1 rounded disabled:opacity-50"
              onClick={() => onPageChange(page - 1)}
              disabled={!canPrev}
              title="Előző oldal"
            >
              ◀️
            </button>
            <span className="px-2 text-sm">
              {page} / {pageCount}
            </span>
            <button
              className="px-2 py-1 rounded disabled:opacity-50"
              onClick={() => onPageChange(page + 1)}
              disabled={!canNext}
              title="Következő oldal"
            >
              ▶️
            </button>
            <button
              className="px-2 py-1 rounded disabled:opacity-50"
              onClick={() => onPageChange(pageCount)}
              disabled={!canNext}
              title="Utolsó oldal"
            >
              ⏭️
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentEntries
