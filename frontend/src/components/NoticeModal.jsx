import React, { useEffect, useState } from "react"
import { getPendingNotices, acknowledgeNotice } from "../api/notice"

const NoticeModal = () => {
  const [notices, setNotices] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let ignore = false
    getPendingNotices()
      .then((data) => {
        if (!ignore) setNotices(data)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  if (notices.length === 0 || current >= notices.length) return null

  const notice = notices[current]

  const handleAccept = async () => {
    try {
      await acknowledgeNotice(notice.id)
    } catch {}
    setCurrent((c) => c + 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-accent">{notice.title}</h2>
          {notices.length > 1 && (
            <span className="text-sm text-text-secondary">
              {current + 1} / {notices.length}
            </span>
          )}
        </div>
        <pre className="px-6 py-4 overflow-y-auto text-sm text-text-secondary whitespace-pre-wrap font-sans flex-1">
          {notice.content}
        </pre>
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={handleAccept}
            className="px-6 py-2 bg-accent text-bg font-semibold rounded-lg"
          >
            {notice.button_text || "Elfogadom"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoticeModal
