
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext'; // Ensure UserRole is exported from AuthContext or its source

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Verifying authentication...</div>
          <div className="text-sm text-gray-500 mt-2">Please wait while we check your login status</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔄 User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Optional: Redirect to an unauthorized page or back to home
    // For now, redirecting to home if role not allowed.
    // Consider a specific 'Unauthorized' page for better UX.
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

export default ProtectedRoute;
