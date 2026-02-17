import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Logo from './Logo';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onBookClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleLine1Ref = useRef<HTMLDivElement>(null);
  const titleLine2Ref = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgWrapperRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax on the wrapper
      gsap.to(bgWrapperRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      const mm = gsap.matchMedia();

      // Desktop Animations (Complex)
      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo(badgeRef.current,
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, delay: 0.2 }
        )
          .fromTo(titleLine1Ref.current,
            { y: 100, opacity: 0, rotateX: -45 },
            { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.05 },
            "-=0.5"
          )
          .fromTo(titleLine2Ref.current,
            { scale: 1.5, opacity: 0, filter: "blur(10px)" },
            { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.5, ease: "slow(0.7, 0.7, false)" },
            "-=1"
          )
          .fromTo(subtitleRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1 },
            "-=0.8"
          )
          .fromTo(ctaRef.current,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
            "-=0.6"
          );

        // Hover/Float effects
        gsap.to(titleLine2Ref.current, {
          y: 10, repeat: -1, yoyo: true, duration: 2, ease: "sine.inOut"
        });
      });

      // Mobile Animations (Simplified & High Performance)
      mm.add("(max-width: 767px)", () => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        tl.fromTo(badgeRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.1 }
        )
          .fromTo([titleLine1Ref.current, titleLine2Ref.current],
            { y: 40, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.2 },
            "-=0.4"
          )
          .fromTo(subtitleRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 },
            "-=0.6"
          )
          .fromTo(ctaRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 },
            "-=0.4"
          );
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} aria-label="Welcome to Golden Tower Spa" className="relative h-screen w-full overflow-hidden flex items-center justify-center hero-section perspective-1000">
      {/* Background Image with Parallax & Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div ref={bgWrapperRef} className="absolute inset-0 w-full h-[120%] -top-[10%]">
          <img
            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop"
            alt="Golden Tower Spa Hero Background"
            fetchpriority="high"
            className={`w-full h-full object-cover hero-bg ${isMounted ? 'zoomed' : ''}`}
          />
        </div>
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-cream/90" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/10 to-black/40" aria-hidden="true" />
      </div>

      {/* Particles/Sparkles (Static CSS animation) */}
      <div className="absolute inset-0 z-[1] opacity-30 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 animate-pulse"><Logo className="h-4 w-4" color="#DFBD69" /></div>
        <div className="absolute top-1/3 right-1/3 animate-pulse delay-700"><Logo className="h-6 w-6" color="#DFBD69" /></div>
        <div className="absolute bottom-1/3 left-1/3 animate-pulse delay-1000"><Logo className="h-3 w-3" color="#DFBD69" /></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16 md:mt-0 flex flex-col items-center">

        <span ref={badgeRef} className="glass-panel px-8 py-3 rounded-full text-white text-sm md:text-base font-bold uppercase tracking-[0.4em] mb-8 border border-white/30 hero-glow-gold reveal">
          Luxury Wellness in Quezon City
        </span>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl text-charcoal mb-6 leading-[1] drop-shadow-2xl flex flex-col items-center">
          <div ref={titleLine1Ref} className="text-white hero-text-shadow">
            Golden Tower
          </div>
          <div ref={titleLine2Ref} className="font-bold tracking-[0.2em] mt-2 relative" style={{
            color: '#FFFFFF',
            textShadow: '0 0 20px rgba(197,160,89,0.9), 0 0 60px rgba(197,160,89,0.7), 0 0 120px rgba(197,160,89,0.4), 0 0 200px rgba(197,160,89,0.2), 0 4px 20px rgba(0,0,0,0.8)',
            WebkitTextStroke: '1px rgba(197,160,89,0.4)',
          }}>
            Spa
            {/* Decorative line */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gold rounded-full opacity-60 shadow-[0_0_10px_rgba(197,160,89,0.5)]"></div>
          </div>
        </h1>

        <p ref={subtitleRef} className="text-white/90 text-lg md:text-2xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-lg font-serif">
          Escape the ordinary. Ascend to tranquility. <br />
          <span className="text-gold-light italic">Experience the golden touch.</span>
        </p>

        <div ref={ctaRef}>
          <button
            onClick={onBookClick}
            className="group relative px-10 py-5 bg-gold text-white font-bold uppercase tracking-widest overflow-hidden rounded-full shadow-2xl hover:shadow-gold/50 btn-tactile"
          >
            <span className="relative z-10 flex items-center gap-3">
              Book Your Relaxation <ChevronDown className="animate-bounce" size={20} />
            </span>
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-in-out" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-r from-gold via-gold-light to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Hero;