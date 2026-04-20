import axios from "axios"

export const getPendingNotices = async () => {
  const response = await axios.get("/api/notice/pending", { withCredentials: true })
  return response.data
}

export const acknowledgeNotice = async (id) => {
  const response = await axios.post(`/api/notice/acknowledge/${id}`, {}, { withCredentials: true })
  return response.data
}

// Admin
export const adminGetAllNotices = async () => {
  const response = await axios.get("/api/notice/admin/all", { withCredentials: true })
  return response.data
}

export const adminGetNoticeAcks = async (id) => {
  const response = await axios.get(`/api/notice/admin/${id}/acks`, { withCredentials: true })
  return response.data
}

export const adminCreateNotice = async (data) => {
  const response = await axios.post("/api/notice/admin", data, { withCredentials: true })
  return response.data
}

export const adminUpdateNotice = async (id, data) => {
  const response = await axios.put(`/api/notice/admin/${id}`, data, { withCredentials: true })
  return response.data
}

export const adminDeleteNotice = async (id) => {
  const response = await axios.delete(`/api/notice/admin/${id}`, { withCredentials: true })
  return response.data
}
