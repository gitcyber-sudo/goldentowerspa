import React, { useEffect, useRef } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

// Helper to split text for character animations
const SplitText = ({ text, className = "" }: { text: string, className?: string }) => (
  <span className={`inline-block ${className}`} aria-label={text}>
    {text.split('').map((char, i) => (
      <span
        key={i}
        className="char-animate inline-block will-change-transform"
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </span>
);

interface HeroProps {
  onBookClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookClick }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.to(bgRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Text Entrance
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo('.badge-anim',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, delay: 0.5 }
      )
        .fromTo('.char-animate',
          { y: 100, rotateX: -90, opacity: 0 },
          { y: 0, rotateX: 0, opacity: 1, duration: 1, stagger: 0.02 },
          '-=0.7'
        )
        .fromTo('.fade-up-anim',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.1 },
          '-=0.8'
        );

      // Scroll Down Fade
      gsap.to('.scroll-indicator', {
        opacity: 0,
        y: 20,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '10% top',
          end: '20% top',
          scrub: true,
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden flex items-center justify-center hero-section bg-charcoal">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          ref={bgRef}
          className="w-full h-[120%] bg-cover bg-center scale-110"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        {/* Luxury Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-cream" />
        <div className="absolute inset-0 bg-black/40 mix-blend-overlay" />
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative z-10 text-center px-6 max-w-5-xl mx-auto">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="badge-anim inline-block mb-8"
        >
          <span className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-2 rounded-full text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] shadow-2xl">
            Ascend to Tranquility
          </span>
        </motion.div>

        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-white mb-8 leading-[0.9] tracking-tighter drop-shadow-2xl">
          <div className="block overflow-hidden pb-2">
            <SplitText text="Golden Tower" />
          </div>
          <div className="block overflow-hidden py-2">
            <span className="char-animate inline-block italic font-light text-gold">Experience</span>
          </div>
        </h1>

        <p className="fade-up-anim text-white/90 text-sm md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed font-sans tracking-wide">
          A sanctuary of golden healing and timeless rituals in the heart of Mansalay.
          Discover the profound alchemy of body and soul.
        </p>

        <div className="fade-up-anim flex flex-col sm:flex-row gap-6 justify-center items-center">
          <motion.button
            onClick={onBookClick}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(197, 160, 89, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="btn-gold px-12 py-5 text-xs uppercase tracking-[0.3em] font-bold flex items-center gap-3"
          >
            Begin Journey <ArrowRight size={16} />
          </motion.button>
          <motion.button
            whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            className="px-10 py-5 rounded-full border border-white/30 text-white text-xs uppercase tracking-[0.3em] font-bold backdrop-blur-sm transition-colors"
          >
            Explore Rituals
          </motion.button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="scroll-indicator absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-3"
      >
        <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
