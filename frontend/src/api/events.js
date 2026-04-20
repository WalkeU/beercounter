import axios from "axios"

export const getEvents = async () => {
  const response = await axios.get("/api/events", { withCredentials: true })
  return response.data
}

export const getEvent = async (id) => {
  const response = await axios.get(`/api/events/${id}`, { withCredentials: true })
  return response.data
}

export const createEvent = async (data) => {
  const response = await axios.post("/api/events", data, { withCredentials: true })
  return response.data
}

export const updateEvent = async (id, data) => {
  const response = await axios.put(`/api/events/${id}`, data, { withCredentials: true })
  return response.data
}

export const deleteEvent = async (id) => {
  const response = await axios.delete(`/api/events/${id}`, { withCredentials: true })
  return response.data
}

export const joinEvent = async (id) => {
  const response = await axios.post(`/api/events/${id}/join`, {}, { withCredentials: true })
  return response.data
}

export const leaveEvent = async (id) => {
  const response = await axios.post(`/api/events/${id}/leave`, {}, { withCredentials: true })
  return response.data
}

export const getEventEntries = async (id, limit = 20, offset = 0, mine = false) => {
  const response = await axios.get(`/api/events/${id}/entries`, {
    params: { limit, offset, mine },
    withCredentials: true,
  })
  return response.data
}

export const getEventLeaderboard = async (id) => {
  const response = await axios.get(`/api/events/${id}/leaderboard`, { withCredentials: true })
  return response.data
}

export const getEventStats = async (id) => {
  const response = await axios.get(`/api/events/${id}/stats`, { withCredentials: true })
  return response.data
}
