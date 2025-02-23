"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreateCommunityModal from "../components/CreateCommunityModal";

const Communities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/communities", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();
      setCommunities(data);
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/communities/${communityId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        navigate(`/chat/${communityId}`);
      }
    } catch (error) {
      console.error("Error joining community:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 md:px-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Medical Communities</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          + Create Community
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <div key={community._id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900">{community.name}</h2>
            <p className="text-gray-600 text-sm line-clamp-2 mt-1">{community.description}</p>
            <span className="text-gray-500 text-xs mt-2">{community.members.length} members</span>
            <button 
              className="mt-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
              onClick={() => handleJoinCommunity(community._id)}
            >
              View Community
            </button>
          </div>
        ))}
      </div>

      {communities.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-600 text-lg">No communities found. Create one to get started!</p>
        </div>
      )}

      <CreateCommunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateCommunity={fetchCommunities}
      />
    </div>
  );
};

export default Communities;