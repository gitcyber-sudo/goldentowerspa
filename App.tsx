import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import Services from './components/Services';
import Footer from './components/Footer';
import { useScrollAnimation } from './hooks/useScrollAnimation';

const App: React.FC = () => {
  // Initialize GSAP Animations via custom hook
  const containerRef = useScrollAnimation();

  return (
    <div ref={containerRef} className="bg-cream min-h-screen w-full overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Philosophy />
        <Services />
      </main>
      <Footer />
    </div>
  );
};

export default App;