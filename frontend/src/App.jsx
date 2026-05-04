import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Dashboard from "./pages/Dashboard"
import AuthPage from "./pages/AuthPage"
import AdminDashboard from "./pages/AdminDashboard"
import BeerDistributionPage from "./pages/BeerDistributionPage"
import TopUsersPage from "./pages/TopUsersPage"
import ChangePasswordPage from "./pages/ChangePasswordPage"
import EventsPage from "./pages/EventsPage"
import EventDetailPage from "./pages/EventDetailPage"
import StatsPage from "./pages/StatsPage"
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
            path="/beers"
            element={
              <SafeRoute>
                <BeerDistributionPage />
              </SafeRoute>
            }
          />

          <Route
            path="/users"
            element={
              <SafeRoute>
                <TopUsersPage />
              </SafeRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <SafeRoute>
                <AdminDashboard />
              </SafeRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <SafeRoute>
                <ChangePasswordPage />
              </SafeRoute>
            }
          />

          <Route
            path="/events"
            element={
              <SafeRoute>
                <EventsPage />
              </SafeRoute>
            }
          />

          <Route
            path="/events/:id"
            element={
              <SafeRoute>
                <EventDetailPage />
              </SafeRoute>
            }
          />

          <Route
            path="/stats"
            element={
              <SafeRoute>
                <StatsPage />
              </SafeRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  )
}

export default App
