import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Sanctuary from '../components/Sanctuary';
import VisualJourney from '../components/VisualJourney';
import Services from '../components/Services';
import Therapists from '../components/Therapists';
import HomeService from '../components/HomeService';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import AuthModal from '../components/AuthModal';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { ChevronUp } from 'lucide-react';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import Logo from '../components/Logo';
import { useSEO } from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';

interface MainLayoutProps {
  openBooking: (id?: string) => void;
  isBookingOpen: boolean;
  setIsBookingOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  onLoginClick: () => void;
  selectedServiceId?: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  openBooking,
  isBookingOpen,
  setIsBookingOpen,
  isAuthOpen,
  setIsAuthOpen,
  onLoginClick,
  selectedServiceId,
  containerRef
}) => {
  useSEO({
    title: 'Luxury Wellness & Traditional Hilot',
    description: 'The premier destination for traditional Hilot massage and luxury wellness treatments in Quezon City. Book your path to tranquility today.'
  });

  // We can access user from useAuth if needed, but it wasn't strictly used in the rendered JSX in the original file
  // keeping it to match original logic if it was doing something invisible, but it seems unused in the return.
  // The original had `const { user } = useAuth();`
  const { user } = useAuth();

  const handleBookingAttempt = (serviceId?: string) => {
    openBooking(serviceId);
  };

  return (
    <div ref={containerRef} className="bg-cream min-h-screen w-full overflow-x-hidden selection:bg-gold selection:text-white">
      {/* Skip to content — accessibility */}
      <a href="#main-content" className="sr-only sr-only-focusable">
        Skip to main content
      </a>

      <Header onBookClick={() => handleBookingAttempt()} onLoginClick={onLoginClick} />
      <main id="main-content">
        <Hero onBookClick={() => handleBookingAttempt()} />
        <div className="section-reveal will-change-transform">
          <Sanctuary />
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
        className="md:hidden fixed bottom-6 right-6 px-6 py-3.5 bg-gold text-white rounded-full shadow-[0_8px_30px_rgb(197,160,89,0.5)] flex items-center justify-center z-[90] active:scale-95 transition-all hover:bg-gold-dark ring-4 ring-white/80 font-bold uppercase tracking-wider text-sm gap-2 btn-tactile"
        aria-label="Book a wellness treatment"
      >
        <Logo className="w-5 h-5" color="white" />
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

export default MainLayout;
