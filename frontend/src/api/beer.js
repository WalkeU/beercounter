import axios from "axios"

export const createEntry = async (count, beer, comment = "", eventId = null) => {
  const response = await axios.post(
    "/api/beer/entry",
    {
      count,
      beer,
      comment,
      event_id: eventId || undefined,
    },
    { withCredentials: true },
  )
  return response.data
}

export const deleteEntry = async (entryId) => {
  const response = await axios.delete(`/api/beer/deleteentry/${entryId}`, { withCredentials: true })
  return response.data
}

export const editEntry = async (entryId, count, beer, comment = "", quantity = 0.5) => {
  const response = await axios.put(
    `/api/beer/editentry/${entryId}`,
    {
      count,
      beer,
      comment,
      quantity,
    },
    { withCredentials: true },
  )
  return response.data
}

export const modifyEntry = async (entryId, count, comment = "") => {
  const response = await axios.put(
    `/api/beer/modifyentry/${entryId}`,
    {
      count,
      comment,
    },
    { withCredentials: true },
  )
  return response.data
}

export const getBeers = async (search = "", limit = 10) => {
  const response = await axios.get("/api/beer/beers", {
    params: { search, limit },
    withCredentials: true,
  })
  return response.data
}

export const getTopBeers = async (limit = 10, offset = 0) => {
  const response = await axios.get("/api/beer/topbeers", {
    params: { limit, offset },
    withCredentials: true,
  })
  return response.data
}

export const getUserEntries = async (username, limit = 20, offset = 0) => {
  const response = await axios.get("/api/beer/getuserentries", {
    params: { username, limit, offset },
    withCredentials: true,
  })
  return response.data
}

export const getRecentEntries = async (limit = 20, offset = 0) => {
  const response = await axios.get("/api/beer/recent", {
    params: { limit, offset },
    withCredentials: true,
  })
  return response.data
}

export const getGlobalStats = async () => {
  const response = await axios.get("/api/beer/globalstats", { withCredentials: true })
  return response.data
}

export const getUserStats = async (username) => {
  const response = await axios.get("/api/beer/userstats", {
    params: { username },
    withCredentials: true,
  })
  return response.data
}

export const getAllUsers = async () => {
  const response = await axios.get("/api/beer/all-users", { withCredentials: true })
  return response.data
}

export const getTopUsers = async () => {
  const response = await axios.get("/api/beer/top", { withCredentials: true })
  return response.data
}

export const getUserList = async () => {
  const response = await axios.get("/api/beer/userlist", { withCredentials: true })
  return response.data
}

export const getTimeline = async (groupBy = "month", year = null, month = null, username = "all") => {
  const response = await axios.get("/api/beer/timeline", {
    params: { groupBy, year: year || undefined, month: month || undefined, username },
    withCredentials: true,
  })
  return response.data
}

// Admin beer management
export const createBeer = async (name, abv, price, quantity) => {
  const response = await axios.post(
    "/api/admin/createbeer",
    { name, abv, price, quantity },
    { withCredentials: true },
  )
  return response.data
}

export const editBeer = async (beerId, name, abv, price, quantity) => {
  const response = await axios.put(
    `/api/admin/editbeer/${beerId}`,
    { name, abv, price, quantity },
    { withCredentials: true },
  )
  return response.data
}

export const deleteBeer = async (beerId) => {
  const response = await axios.delete(`/api/admin/deletebeer/${beerId}`, { withCredentials: true })
  return response.data
}
