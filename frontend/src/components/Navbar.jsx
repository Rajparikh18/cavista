import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreateCommunityModal from '../components/CreateCommunityModal';
import './Navbar.css';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createCommunity = async (communityData, userToken) => {
    try {
      const response = await fetch('http://localhost:5000/api/communities', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify(communityData)
      });
      
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.error('Error creating community:', error);
    }
    return false;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">MedConnect</Link>
        <div className="navbar-links">
          {user ? (
            <>
              {user.role === 'patient' && (
                <Link to="/communities" className="nav-link">Communities</Link>
              )}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="nav-link"
              >
                Create Community
              </button>
              <span className="username">{user.username}</span>
              <button onClick={logout} className="nav-link">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
      <CreateCommunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateCommunity={(communityData) => createCommunity(communityData, user.token)}
      />
    </nav>
  );
};

export default Navbar;