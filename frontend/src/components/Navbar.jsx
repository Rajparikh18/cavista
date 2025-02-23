import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const createCommunity = async (communityData) => {
    try {
      const response = await fetch('http://localhost:5000/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(communityData),
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
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-2xl">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-600" />
              <span className=" font-bold text-red-600">MedConnect</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="tex-3xl hidden sm:flex sm:items-center">
            <ul className="flex items-center space-x-4">
              {user ? (
                <>
                  <li>
                    <Link
                      to="/communities"
                      className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-lg font-medium transition-colors"
                    >
                      Communities
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/chatbot"
                      className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-lg font-medium transition-colors"
                    >
                      Consult-AI
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/blogs"
                      className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-lg font-medium transition-colors"
                    >
                      Blogs
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-lg font-medium transition-colors"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={logout}
                      className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-lg font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="text-gray-1000 hover:text-red-600 px-3 py-2 rounded-md text-lg font-medium transition-colors"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-lg font-medium transition-colors"
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <ul className="pt-2 pb-3 space-y-1">
          {user ? (
            <>
              <li>
                <Link
                  to="/communities"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  Communities
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  Create Community
                </button>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;