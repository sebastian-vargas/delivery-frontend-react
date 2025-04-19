import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// PublicRoute component to redirect authenticated users away from login/register pages
function PublicRoute({ children }) {
  const { user } = useAuth();

  // If user is already logged in, redirect based on their role
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/home'} replace />;
  }

  // User is not authenticated, show the public route
  return children;
}

export default PublicRoute; 