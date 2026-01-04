import axios from "axios"

export const getGlobalStats = async () => {
  const response = await axios.get("/api/public/globalstats")
  return response.data
}

export const getLastEntry = async () => {
  const response = await axios.get("/api/public/lastentry")
  return response.data
}
