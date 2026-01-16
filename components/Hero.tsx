import React from 'react';
import { ChevronDown } from 'lucide-react';

// Helper to split text for character animations
const SplitText = ({ text, className = "" }: { text: string, className?: string }) => (
  <span className={`inline-block ${className}`} aria-label={text}>
    {text.split('').map((char, i) => (
      <span 
        key={i} 
        className="char-animate inline-block opacity-0 translate-y-8 will-change-transform" 
        style={{ transition: 'opacity 0s' }} // Let GSAP handle transition
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </span>
);

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center hero-section">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 z-0">
        <div 
          className="parallax-bg w-full h-[120%] bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop')",
            transform: 'translateY(0%)' 
          }}
        />
        {/* Gradient Overlay - Darker at bottom for text readability on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-cream/10 to-cream/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16 md:mt-0">
        <span className="fade-up block text-gold-dark text-sm md:text-base font-bold uppercase tracking-[0.4em] mb-6 drop-shadow-sm">
          Luxury Wellness in Mansalay
        </span>
        
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-charcoal mb-8 leading-[1.1] hero-title-trigger">
          <div className="block overflow-hidden">
            <SplitText text="Golden Tower" />
          </div>
          <div className="block overflow-hidden mt-2">
            <span className="char-animate inline-block opacity-0 translate-y-8 italic font-light text-gold-dark">Spa</span>
          </div>
        </h1>
        
        <p className="fade-up text-charcoal-light text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md md:drop-shadow-none">
          Escape the ordinary and ascend to a state of pure tranquility. 
          Experience the golden touch of traditional healing.
        </p>
        
        <div className="fade-up flex flex-col md:flex-row gap-5 justify-center items-center">
            <button className="bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded-full text-sm md:text-base uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-gold/30 transform hover:-translate-y-1 w-full md:w-auto">
              Book an Experience
            </button>
            <button className="bg-transparent hover:bg-gold border border-gold text-gold hover:text-white px-9 py-4 rounded-full text-sm md:text-base uppercase tracking-widest transition-all duration-300 w-full md:w-auto">
                View Menu
            </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-charcoal/50">
        <ChevronDown size={32} />
      </div>
    </section>
  );
};

export default Hero;