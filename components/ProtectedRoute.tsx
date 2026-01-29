
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('user' | 'therapist' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold mb-6" />
                    <h2 className="font-serif text-3xl text-charcoal mb-2">Golden Tower <span className="text-gold italic">Spa</span></h2>
                    <p className="text-sm text-charcoal/40 italic">Verifying access...</p>
                </div>
            </div>
        );
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
