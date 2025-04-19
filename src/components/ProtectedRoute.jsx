import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ProtectedRoute component to wrap routes that require authentication
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have it, redirect
  if (requiredRole && user.role !== requiredRole) {
    // Redirect admin to dashboard, users to home
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/home'} replace />;
  }

  // User is authenticated (and has the required role if specified)
  return children;
}

export default ProtectedRoute; 