"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import "./Create.css"

const CreateCommunityModal = ({ isOpen, onClose, onCreateCommunity }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [error, setError] = useState("")
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const response = await fetch("http://localhost:5000/api/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onCreateCommunity()
        setFormData({ name: "", description: "" })
        onClose()
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create community. Please try again.")
      }
    } catch (error) {
      console.error("Error creating community:", error)
      setError("An unexpected error occurred. Please try again.")
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Create New Community</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="community-name">Community Name</label>
            <input
              id="community-name"
              type="text"
              placeholder="Enter community name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="community-description">Community Description</label>
            <textarea
              id="community-description"
              placeholder="Enter community description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="modal-buttons">
            <button type="submit" className="create-button">
              Create
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCommunityModal

