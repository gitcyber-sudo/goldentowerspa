import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
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
        <Philosophy />
        <Services />
      </main>
      <Footer />
      <Analytics />
    </div>
  );
};

export default App;