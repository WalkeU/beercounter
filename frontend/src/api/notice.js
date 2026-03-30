import axios from "axios"

export const getPendingNotices = async () => {
  const response = await axios.get("/api/notice/pending", { withCredentials: true })
  return response.data
}

export const acknowledgeNotice = async (id) => {
  const response = await axios.post(`/api/notice/acknowledge/${id}`, {}, { withCredentials: true })
  return response.data
}
