
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import VisualJourney from './components/VisualJourney';
import Services from './components/Services';
import Footer from './components/Footer';
import { useScrollAnimation } from './hooks/useScrollAnimation';

const App: React.FC = () => {
  // Initialize GSAP Animations
  const containerRef = useScrollAnimation();

  return (
    <div ref={containerRef} className="bg-cream min-h-screen w-full overflow-x-hidden selection:bg-gold selection:text-white">
      <Header />
      <main>
        <Hero />
        {/* Added section-reveal class for polished GSAP scale/fade entry */}
        <div className="section-reveal will-change-transform">
          <Philosophy />
        </div>
        
        {/* New Scroll-Driven Animation Section */}
        <VisualJourney />
        
        <div className="section-reveal will-change-transform">
          <Services />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
