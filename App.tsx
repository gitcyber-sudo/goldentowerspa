
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
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  const openBooking = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingOpen(true);
  };

  const containerRef = useScrollAnimation() as React.RefObject<HTMLDivElement>;

  return (
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
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/therapist" element={<TherapistDashboard />} />
    </Routes>
  );
};

export default App;

