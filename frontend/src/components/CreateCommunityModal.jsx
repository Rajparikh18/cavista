"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const CreateCommunityModal = ({ isOpen, onClose, onCreateCommunity }) => {
  const { user } = useAuth(); 
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`, 
        },
        body: JSON.stringify({ name, description }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create community.");
      }

      const newCommunity = await response.json();
      console.log("Community created successfully:", newCommunity);

      onCreateCommunity();
      onClose();
    } catch (error) {
      console.error("Error creating community:", error);
      setError(error.message || "An error occurred while creating the community.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Create a New Community</h3>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Community Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Enter community name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Enter community description"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-600 mr-2"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;