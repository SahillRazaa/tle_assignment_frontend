import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            sessionStorage.getItem("adminToken") ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:handle/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
