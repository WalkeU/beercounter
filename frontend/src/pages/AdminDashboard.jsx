import React, { useState } from "react"
import Navbar from "../components/Navbar"
import EditBeers from "./EditBeers"
import AdminUsersPage from "./AdminUsersPage"
import AdminEventsPage from "./AdminEventsPage"
import AdminNoticesPage from "./AdminNoticesPage"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("beers")

  const tabs = [
    { id: "beers", label: "Sörök szerkesztése", component: EditBeers },
    { id: "users", label: "Felhasználók kezelése", component: AdminUsersPage },
    { id: "events", label: "Események kezelése", component: AdminEventsPage },
    { id: "notices", label: "Értesítések", component: AdminNoticesPage },
  ]

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || EditBeers

  return (
    <div className="app min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        {/* Admin tab navigation */}
        <div className="mb-6 flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === tab.id
                  ? "border-b-2 border-accent text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active component */}
        <div className="mt-4">
          <ActiveComponent isEmbedded={true} />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
