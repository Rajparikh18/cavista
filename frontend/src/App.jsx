import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Communities from './pages/Communities';
import ChatApp from './pages/ChatApp';
import './App.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/communities"
              element={
                <PrivateRoute allowedRoles={['patient']}>
                  <Communities />
                </PrivateRoute>
              }
            />
            <Route
              path="/"
              element={
                <div className="welcome-container">
                  <h1 className="welcome-title">Welcome to MedConnect</h1>
                </div>
              }
            />
            <Route path="/chat/:communityId" element={<ChatApp />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;