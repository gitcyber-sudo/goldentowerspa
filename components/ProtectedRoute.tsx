
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

    // 1. Wait if auth or profile is still loading
    if (loading) {
        return <LoadingScreen message="Verifying access" />;
    }

    // 2. If not logged in at all, go home
    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // 3. If logged in but ROLE is not yet loaded, wait (prevent race to /dashboard)
    if (!role) {
        return <LoadingScreen message="Loading profile..." />;
    }

    // 4. If logged in but wrong role, go to their correct dashboard
    if (allowedRoles && !allowedRoles.includes(role)) {
        console.warn(`Access denied for role: ${role}. Redirecting to correct portal.`);
        const defaultPath = role === 'admin' ? '/admin' : (role === 'therapist' ? '/therapist' : '/dashboard');
        return <Navigate to={defaultPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
