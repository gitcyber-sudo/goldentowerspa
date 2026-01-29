
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('user' | 'therapist' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen message="Verifying access" />;
    }

    if (!user) {
        // Redirect to home if not logged in
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Redirect to their respective dashboard if they have the wrong role
        const defaultPath = role === 'admin' ? '/admin' : (role === 'therapist' ? '/therapist' : '/dashboard');
        return <Navigate to={defaultPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
