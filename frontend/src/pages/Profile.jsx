"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import "./Profile.css"

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/users/${user._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [user])

  if (!profile) {
    return <div>Loading profile...</div>
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Your Profile</h1>
      <div className="profile-info">
        <div className="profile-field">
          <span className="field-label">Username:</span>
          <span className="field-value">{profile.username}</span>
        </div>
        <div className="profile-field">
          <span className="field-label">Email:</span>
          <span className="field-value">{profile.email}</span>
        </div>
        <div className="profile-field">
          <span className="field-label">Role:</span>
          <span className="field-value">{profile.role}</span>
        </div>
        {profile.role === "doctor" && (
          <div className="profile-field">
            <span className="field-label">Specialty:</span>
            <span className="field-value">{profile.specialty || "Not specified"}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile

