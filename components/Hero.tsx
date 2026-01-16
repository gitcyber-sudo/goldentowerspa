import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 z-0">
        <div 
          className="parallax-bg w-full h-[120%] bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-cream/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <span className="fade-up block text-gold-dark text-sm md:text-base uppercase tracking-[0.3em] mb-4 font-semibold">
          Luxury Wellness in Mansalay
        </span>
        <h1 className="fade-up font-serif text-5xl md:text-7xl lg:text-8xl text-charcoal mb-6 leading-tight">
          Golden Tower <br/>
          <span className="italic font-light text-gold-dark">Spa</span>
        </h1>
        <p className="fade-up text-charcoal-light text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed">
          Escape the ordinary and ascend to a state of pure tranquility. 
          Experience the golden touch of traditional healing and modern luxury.
        </p>
        
        <div className="fade-up flex flex-col md:flex-row gap-4 justify-center items-center">
            <button className="bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded-full text-sm md:text-base uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
            Book an Experience
            </button>
            <button className="text-charcoal hover:text-gold px-8 py-4 text-sm md:text-base uppercase tracking-widest transition-colors border-b border-transparent hover:border-gold">
                View Menu
            </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-charcoal/50">
        <ChevronDown size={32} />
      </div>
    </section>
  );
};

export default Hero;