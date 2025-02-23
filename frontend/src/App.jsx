import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Communities from "./pages/Communities"
import ChatApp from "./pages/ChatApp"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import "./App.css"
import ChatbotPage from "./pages/ChatbotPage"
import Blogs from "./pages/Blogs"

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />
  }
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route
                path="/communities"
                element={
                  <PrivateRoute allowedRoles={["patient", "doctor"]}>
                    <Communities />
                  </PrivateRoute>
                }
              />
              <Route
                path="/chat/:communityId"
                element={
                  <PrivateRoute allowedRoles={["patient", "doctor"]}>
                    <ChatApp />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute allowedRoles={["patient", "doctor"]}>
                    <Profile />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

