
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('user' | 'therapist' | 'admin')[];
    allowGuests?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, allowGuests }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    // 1. Wait if auth or profile is still loading (Initial restoration)
    if (loading) {
        return <LoadingScreen message="Verifying access" />;
    }

    // 2. If not logged in at all:
    if (!user) {
        if (allowGuests) return <>{children}</>;
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // 3. Fallback if role is STILL missing after loading is done
    // (This ensures we don't proceed if authorization is fundamentally broken)
    if (!role) {
        console.error("[ProtectedRoute] Authorization failed: No role found for user.");
        return <Navigate to="/" replace />;
    }

    // 4. If logged in but wrong role
    if (allowedRoles && !allowedRoles.includes(role)) {
        console.warn(`Access denied for role: ${role}. Redirecting to correct portal.`);
        const defaultPath = role === 'admin' ? '/admin' : (role === 'therapist' ? '/therapist' : '/dashboard');
        return <Navigate to={defaultPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
