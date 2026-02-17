import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { useScrollAnimation } from './hooks/useScrollAnimation';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import MainLayout from './layouts/MainLayout';

// Dashboard Components
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import TherapistDashboard from './components/TherapistDashboard';
import TherapistLogin from './components/TherapistLogin';

const App: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  const openBooking = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingOpen(true);
  };

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
      </Routes>
    </AnalyticsProvider>
  );
};

export default App;
