import { Spin } from 'antd';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
 const { user, isLoading } = useAuthContext();
 const location = useLocation();

 // Wait for auth check to complete
 if (isLoading) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 // Check if user is authenticated
 if (!user) {
  return <Navigate to="/login" state={{ from: location }} replace />;
 }

 // Check for role-based access if requiredRole is specified
 if (requiredRole && user.role !== requiredRole) {
  return <Navigate to="/" replace />;
 }

 return children;
};

export default ProtectedRoute;
