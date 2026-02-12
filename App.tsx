
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import VisualJourney from './components/VisualJourney';
import Services from './components/Services';
import Therapists from './components/Therapists';
import HomeService from './components/HomeService';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import { useScrollAnimation } from './hooks/useScrollAnimation';
import { Sparkles } from 'lucide-react';
import PWAInstallPrompt from './components/PWAInstallPrompt';

import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import TherapistDashboard from './components/TherapistDashboard';
import TherapistLogin from './components/TherapistLogin';
import { useAuth } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
// import { SpeedInsights } from '@vercel/speed-insights/react';

const MainLayout: React.FC<{
  openBooking: (id?: string) => void;
  isBookingOpen: boolean;
  setIsBookingOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  onLoginClick: () => void;
  selectedServiceId?: string;
  containerRef: React.RefObject<HTMLDivElement>;
}> = ({ openBooking, isBookingOpen, setIsBookingOpen, isAuthOpen, setIsAuthOpen, onLoginClick, selectedServiceId, containerRef }) => {
  const { user } = useAuth();

  const handleBookingAttempt = (serviceId?: string) => {
    openBooking(serviceId);
  };

  return (
    <div ref={containerRef} className="bg-cream min-h-screen w-full overflow-x-hidden selection:bg-gold selection:text-white">
      <Header onBookClick={() => handleBookingAttempt()} onLoginClick={onLoginClick} />
      <main>
        <Hero onBookClick={() => handleBookingAttempt()} />
        <div className="section-reveal will-change-transform">
          <Philosophy />
        </div>

        <VisualJourney />

        <div className="section-reveal will-change-transform">
          <Services onBookClick={(id) => handleBookingAttempt(id)} />
        </div>

        <div className="section-reveal will-change-transform">
          <HomeService onBookClick={(id) => handleBookingAttempt(id)} />
        </div>

        <Therapists onBookClick={() => handleBookingAttempt()} />
      </main>
      <div className="section-reveal will-change-transform">
        <Footer />
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => handleBookingAttempt()}
        className="md:hidden fixed bottom-6 right-6 px-6 py-3 bg-gold text-white rounded-full shadow-[0_8px_30px_rgb(197,160,89,0.5)] flex items-center justify-center z-[90] active:scale-95 transition-all hover:bg-gold-dark ring-4 ring-white font-bold uppercase tracking-wider text-sm gap-2 btn-tactile"
        aria-label="Book a Treatment"
      >
        <Sparkles size={18} />
        <span>Book Now</span>
      </button>

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

      <PWAInstallPrompt />
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
