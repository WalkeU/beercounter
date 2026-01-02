import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { checkAuth } from "./api/user"

const GuestRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuth()
      setIsAuthenticated(authenticated)
    }
    verifyAuth()
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="app">
        <div className="container">
          <p>Betöltés...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default GuestRoute
