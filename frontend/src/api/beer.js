import axios from "axios"

export const createEntry = async (count, beer, comment = "") => {
  const response = await axios.post(
    "/api/beer/entry",
    {
      count,
      beer,
      comment,
    },
    { withCredentials: true }
  )
  return response.data
}

export const deleteEntry = async (entryId) => {
  const res = await axios.delete(`/api/beer/entry/${entryId}`, {
    withCredentials: true,
  })
  return res.data
}

export const getBeers = async (search = "", limit = 10) => {
  const response = await axios.get("/api/beer/beers", {
    params: { search, limit },
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

export const getAllUsers = async (limit = 20, offset = 0) => {
  const response = await axios.get("/api/beer/alluser", {
    params: { limit, offset },
    withCredentials: true,
  })
  return response.data
}

export const getTopUsers = async () => {
  const response = await axios.get("/api/beer/top", { withCredentials: true })
  return response.data
}
