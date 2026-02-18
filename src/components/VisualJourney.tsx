
import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const suiteSections = [
  {
    title: "The Entrance",
    concept: "Elegance",
    image: "/images/journey-1.jpg",
    quote: "A transition from the city's pulse to a sanctuary of silence."
  },
  {
    title: "Modern Rituals",
    concept: "Healing",
    image: "/images/journey-2.jpg",
    quote: "Where time-honored Hilot meets contemporary luxury."
  },
  {
    title: "Pure Alchemy",
    concept: "Purity",
    image: "/images/journey-3.jpg",
    quote: "Organic oils and botanicals crafted for your rebirth."
  },
  {
    title: "Parisian Grace",
    concept: "Architectural",
    image: "/images/journey-4.jpg",
    quote: "Every corner designed to elevate the human spirit."
  }
];

const VisualJourney: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.suite-section');
      const amountToScroll = horizontalRef.current!.offsetWidth - window.innerWidth;

      // Main horizontal scroll timeline
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${horizontalRef.current!.offsetWidth}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });

      mainTl.to(horizontalRef.current, {
        x: -amountToScroll,
        ease: "none",
      });

      // Individual parallax effects for elements within sections
      sections.forEach((section: Element) => {
        const title = section.querySelector('.section-title');
        const concept = section.querySelector('.section-concept');
        const img = section.querySelector('.section-img');
        const quote = section.querySelector('.section-quote');

        gsap.to(img, {
          xPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            containerAnimation: mainTl,
            start: "left right",
            end: "right left",
            scrub: true,
          }
        });

        gsap.to(concept, {
          xPercent: -30,
          opacity: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            containerAnimation: mainTl,
            start: "left right",
            end: "right left",
            scrub: true,
          }
        });

        gsap.to(title, {
          yPercent: -20,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            containerAnimation: mainTl,
            start: "left center",
            end: "right left",
            scrub: true,
          }
        });
      });

      // Shimmer overlay animation
      gsap.to(shimmerRef.current, {
        backgroundPosition: '200% center',
        duration: 8,
        repeat: -1,
        ease: "linear"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="bg-charcoal overflow-hidden">
      {/* Gold Shimmer Overlay */}
      <div
        ref={shimmerRef}
        className="fixed inset-0 pointer-events-none z-50 opacity-20 mix-blend-overlay"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(197,160,89,0.2) 50%, transparent 100%)',
          backgroundSize: '200% 100%'
        }}
      ></div>

      <div ref={horizontalRef} className="flex h-screen w-max items-center relative">
        {/* Intro Section */}
        <div className="w-[50vw] flex flex-col justify-center px-12 md:px-24">
          <span className="text-gold font-bold uppercase tracking-[0.5em] text-xs mb-4">The Suite</span>
          <h2 className="text-white font-serif text-6xl md:text-8xl leading-tight">
            A Cinematic <br />
            <span className="italic text-gold">Odyssey</span>
          </h2>
          <p className="text-cream/40 mt-8 font-light tracking-widest uppercase text-xs">Scroll to Begin Your Journey</p>
        </div>

        {/* Content Sections */}
        {suiteSections.map((section, idx) => (
          <div
            key={idx}
            className="suite-section w-[100vw] h-screen flex items-center justify-center px-12 md:px-24 relative"
          >
            {/* Background Concept Text (Parallax) */}
            <div className="section-concept absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vh] md:text-[50vh] font-serif italic text-white/[0.03] whitespace-nowrap pointer-events-none select-none">
              {section.concept}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-7xl relative z-10">
              {/* Image with Border/Frame */}
              <div className="lg:col-span-7 relative group">
                <div className="absolute -inset-4 border border-gold/20 rounded-2xl -z-10 transition-transform group-hover:scale-105 duration-700"></div>
                <div className="aspect-[16/10] overflow-hidden rounded-xl border-4 border-white/5 shadow-2xl">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="section-img w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="lg:col-span-5 space-y-8">
                <div className="overflow-hidden">
                  <h3 className="section-title text-gold font-serif text-4xl md:text-6xl leading-tight">
                    {section.title}
                  </h3>
                </div>
                <p className="section-quote text-cream/80 text-xl font-light leading-relaxed italic border-l-2 border-gold/30 pl-6">
                  "{section.quote}"
                </p>
                <div className="pt-8">
                  <div className="w-12 h-[1px] bg-gold/50"></div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Outro / Transition */}
        <div className="w-[50vw] flex flex-col items-center justify-center px-12">
          <div className="w-24 h-24 rounded-full border border-gold/30 flex items-center justify-center animate-spin-slow">
            <div className="w-2 h-2 bg-gold rounded-full"></div>
          </div>
          <p className="text-gold font-serif mt-8 text-2xl italic">The Path Awaits</p>
        </div>
      </div>
    </section>
  );
};

export default VisualJourney;
