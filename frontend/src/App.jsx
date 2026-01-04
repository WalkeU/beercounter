import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Dashboard from "./pages/Dashboard"
import AuthPage from "./pages/AuthPage"
import EditBeers from "./pages/EditBeers"
import SafeRoute from "./SafeRoute"
import GuestRoute from "./GuestRoute"

function App() {
  return (
    <div className="min-h-screen w-full bg-bg">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={
              <GuestRoute>
                <AuthPage />
              </GuestRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <SafeRoute>
                <Dashboard />
              </SafeRoute>
            }
          />

          <Route
            path="/admin/beers"
            element={
              <SafeRoute>
                <EditBeers />
              </SafeRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  )
}

export default App
