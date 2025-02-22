import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreateCommunityModal from '../components/CreateCommunityModal';
import './Communities.css';

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
      const response = await fetch('http://localhost:5000/api/communities', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();
      setCommunities(data);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        navigate(`/chat/${communityId}`);
      }
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  return (
    <div className="communities-page">
      <div className="communities-header">
        <h1>Medical Communities</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="create-community-btn"
        >
          Create New Community
        </button>
      </div>

      <div className="communities-grid">
        {communities.map(community => (
          <div key={community._id} className="community-card">
            <div className="community-card-header">
              <h2>{community.name}</h2>
              <span className="member-count">
                {community.members.length} members
              </span>
            </div>
            <p className="community-description">{community.description}</p>
            <div className="community-footer">
              <span className="created-by">
                Created by: {community.createdBy.username}
              </span>
              <button 
                className="join-btn"
                onClick={() => handleJoinCommunity(community._id)}
              >
                Join Community
              </button>
            </div>
          </div>
        ))}
      </div>

      {communities.length === 0 && (
        <div className="no-communities">
          <p>No communities found. Create one to get started!</p>
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