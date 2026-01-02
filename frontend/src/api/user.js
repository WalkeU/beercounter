import axios from "axios"

export const register = async (email, username, password, password2) => {
  const response = await axios.post(
    "/api/user/register",
    {
      email,
      username,
      password,
      password2,
    },
    { withCredentials: true }
  )
  return response.data
}

export const login = async (username, password) => {
  const response = await axios.post(
    "/api/user/login",
    {
      username,
      password,
    },
    { withCredentials: true }
  )
  return response.data
}

export const getCurrentUser = async () => {
  const response = await axios.get("/api/user/me", { withCredentials: true })
  return response.data
}

export const checkAuth = async () => {
  const response = await axios.get("/api/user/check-auth", { withCredentials: true })
  return response.data.isAuthenticated
}

export const logout = async () => {
  const response = await axios.post("/api/user/logout", {}, { withCredentials: true })
  return response.data
}
