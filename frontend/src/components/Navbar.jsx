import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

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
    </nav>
  );
};

export default Navbar;