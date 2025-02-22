"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import CreateCommunityModal from "./CreateCommunityModal"
import { useState } from "react"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const createCommunity = async (communityData) => {
    try {
      const response = await fetch("http://localhost:5000/api/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(communityData),
      })

      if (response.ok) {
        return true
      }
    } catch (error) {
      console.error("Error creating community:", error)
    }
    return false
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          MedConnect
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/communities" className="nav-link">
                Communities
              </Link>
              <button onClick={() => setIsModalOpen(true)} className="nav-link create-community-btn">
                Create Community
              </button>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <button onClick={logout} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      <CreateCommunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateCommunity={createCommunity}
      />
    </nav>
  )
}

export default Navbar

