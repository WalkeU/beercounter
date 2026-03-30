import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { checkAuth } from "./api/user"
import NoticeModal from "./components/NoticeModal"

const SafeRoute = ({ children }) => {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <NoticeModal />
      {children}
    </>
  )
}

export default SafeRoute
