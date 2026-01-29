
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import VisualJourney from './components/VisualJourney';
import Services from './components/Services';
import Therapists from './components/Therapists';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import { useScrollAnimation } from './hooks/useScrollAnimation';

import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import TherapistDashboard from './components/TherapistDashboard';
import { useAuth } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import ProtectedRoute from './components/ProtectedRoute';

const MainLayout: React.FC<{
  openBooking: (id?: string) => void;
  isBookingOpen: boolean;
  setIsBookingOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  selectedServiceId?: string;
  containerRef: React.RefObject<HTMLDivElement>;
}> = ({ openBooking, isBookingOpen, setIsBookingOpen, isAuthOpen, setIsAuthOpen, selectedServiceId, containerRef }) => {
  const { user } = useAuth();

  const handleBookingAttempt = (serviceId?: string) => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      openBooking(serviceId);
    }
  };

  return (
    <div ref={containerRef} className="bg-cream min-h-screen w-full overflow-x-hidden selection:bg-gold selection:text-white">
      <Header onBookClick={() => handleBookingAttempt()} />
      <main>
        <Hero onBookClick={() => handleBookingAttempt()} />
        <div className="section-reveal will-change-transform">
          <Philosophy />
        </div>

        <VisualJourney />

        <div className="section-reveal will-change-transform">
          <Services onBookClick={(id) => handleBookingAttempt(id)} />
        </div>

        <Therapists onBookClick={() => handleBookingAttempt()} />
      </main>
      <Footer />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialServiceId={selectedServiceId}
        onAuthRequired={() => setIsAuthOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          if (selectedServiceId) {
            setTimeout(() => setIsBookingOpen(true), 300);
          }
        }}
      />
    </div>
  );
};

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
  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold mb-6" />
          <h2 className="font-serif text-3xl text-charcoal mb-2">Golden Tower <span className="text-gold italic">Spa</span></h2>
          <p className="text-sm text-charcoal/40 italic">Restoring your session...</p>
        </div>
      </div>
    );
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
            <ProtectedRoute allowedRoles={['user']}>
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
      </Routes>
    </AnalyticsProvider>
  );
};

export default App;
