
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import VisualJourney from './components/VisualJourney';
import Services from './components/Services';
import Therapists from './components/Therapists';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import { useScrollAnimation } from './hooks/useScrollAnimation';

const App: React.FC = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  const openBooking = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingOpen(true);
  };

  // Initialize GSAP Animations
  const containerRef = useScrollAnimation();

  return (
    <div ref={containerRef} className="bg-cream min-h-screen w-full overflow-x-hidden selection:bg-gold selection:text-white">
      <Header onBookClick={() => openBooking()} />
      <main>
        <Hero onBookClick={() => openBooking()} />
        <div className="section-reveal will-change-transform">
          <Philosophy />
        </div>

        <VisualJourney />

        <div className="section-reveal will-change-transform">
          <Services onBookClick={(id) => openBooking(id)} />
        </div>

        <Therapists onBookClick={() => openBooking()} />
      </main>
      <Footer />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialServiceId={selectedServiceId}
      />
    </div>
  );
};

export default App;

