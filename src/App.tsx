import React, { useState, Suspense, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { useScrollAnimation } from './hooks/useScrollAnimation';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import MainLayout from './layouts/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded routes — each becomes a separate chunk
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const UserDashboard = React.lazy(() => import('./components/UserDashboard'));
const TherapistDashboard = React.lazy(() => import('./components/TherapistDashboard'));
const TherapistLogin = React.lazy(() => import('./components/TherapistLogin'));
const AdminLogin = React.lazy(() => import('./components/AdminLogin'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./components/TermsOfService'));
const About = React.lazy(() => import('./pages/About'));

const App: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  const openBooking = useCallback((serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingOpen(true);
  }, []);

  const containerRef = useScrollAnimation() as React.RefObject<HTMLDivElement>;

  // Global loading state to ensure auth is settled before any components try to fetch data
  // This prevents race conditions during page refreshes for signed-in users.
  // We allow the homepage ('/') to render immediately to prevent blank sections.
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';

  if (authLoading && !isHomePage) {
    return <LoadingScreen message="Restoring your session" />;
  }

  return (
    <AnalyticsProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen message="Loading" />}>
          <Routes>
            <Route path="/" element={
              <MainLayout
                openBooking={openBooking}
                isBookingOpen={isBookingOpen}
                setIsBookingOpen={setIsBookingOpen}
                isAuthOpen={isAuthOpen}
                setIsAuthOpen={setIsAuthOpen}
                onLoginClick={() => setIsAuthOpen(true)}
                selectedServiceId={selectedServiceId}
                containerRef={containerRef}
              />
            } />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']} allowGuests={true}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/therapist"
              element={
                <ProtectedRoute allowedRoles={['therapist']}>
                  <TherapistDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/therapist-login" element={<TherapistLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AnalyticsProvider>
  );
};

export default App;
