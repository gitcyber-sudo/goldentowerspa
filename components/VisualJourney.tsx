
import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const journeyImages = [
  { src: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop", top: "10%", left: "10%", depth: 0.2, rotate: -5 },
  { src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop", top: "15%", left: "70%", depth: 0.5, rotate: 8 },
  { src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop", top: "60%", left: "5%", depth: 0.3, rotate: -3 },
  { src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop", top: "65%", left: "75%", depth: 0.6, rotate: 12 },
  { src: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop", top: "5%", left: "40%", depth: 0.4, rotate: 5 },
  { src: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=800&auto=format&fit=crop", top: "45%", left: "85%", depth: 0.7, rotate: -8 },
];

const VisualJourney: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=250%",
          scrub: 1.5, // Even smoother scrubbing
          pin: true,
          anticipatePin: 1,
        }
      });

      // Perspective zoom out
      tl.fromTo(mainImageRef.current,
        { scale: 2, filter: "brightness(1.5) blur(10px)", opacity: 0 },
        { scale: 0.6, filter: "brightness(1) blur(0px)", opacity: 1, ease: "power2.inOut", duration: 2 }
        , 0);

      // Parallax images flying in from the void
      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        const img = journeyImages[i];

        tl.fromTo(el,
          {
            opacity: 0,
            z: 500 * (img.depth + 1),
            x: (i % 2 === 0 ? -1 : 1) * 300,
            y: (i < 3 ? -1 : 1) * 300,
            scale: 0.1,
            rotate: img.rotate * 3,
          },
          {
            opacity: 1,
            z: 0,
            x: 0,
            y: 0,
            scale: 1,
            rotate: img.rotate,
            ease: "expo.out",
            duration: 1.5
          },
          i * 0.1 // Staggered entry
        );
      });

      // Background fade
      tl.to('.journey-bg', {
        backgroundColor: "rgba(249, 247, 242, 1)",
        duration: 1
      }, 0.5);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-charcoal overflow-hidden journey-bg transition-colors duration-1000">
      <div ref={triggerRef} className="h-screen w-full relative perspective-[2000px]">

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <h2 className="text-luxury text-[15vw] md:text-[10vw] text-gold/5 uppercase tracking-tighter select-none">
            Experience
          </h2>
        </div>

        {/* Floating background elements */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px] animate-pulse delay-700" />
        </div>

        <div className="relative w-full h-full flex items-center justify-center">

          {/* Central Anchor */}
          <div
            ref={mainImageRef}
            className="absolute z-20 w-[50vh] h-[50vh] md:w-[70vh] md:h-[70vh] overflow-hidden rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20"
          >
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop"
              alt="Main Experience"
              className="w-full h-full object-cover scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12">
              <span className="text-gold uppercase tracking-[0.5em] text-[10px] font-bold mb-2">The Sanctuary</span>
              <h3 className="text-white text-luxury text-4xl md:text-6xl italic leading-none">Inner Radiance</h3>
            </div>
          </div>

          {/* Scatter Images */}
          {journeyImages.map((img, i) => (
            <motion.div
              key={i}
              ref={(el) => { imageRefs.current[i] = el; }}
              className="absolute z-10 w-40 h-56 md:w-64 md:h-80 shadow-2xl rounded-2xl overflow-hidden border border-white/30 backdrop-blur-sm group cursor-pointer"
              style={{ top: img.top, left: img.left }}
              whileHover={{ scale: 1.1, zIndex: 30 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={img.src}
                alt={`Journey ${i}`}
                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}

        </div>

        {/* UI Overlay */}
        <div className="absolute bottom-12 left-0 w-full flex flex-col items-center z-30 pointer-events-none">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-gold/40" />
            <p className="text-gold text-[10px] uppercase tracking-[0.6em] font-bold">Immerse in the Golden Hour</p>
            <div className="w-12 h-[1px] bg-gold/40" />
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-gold/50 to-transparent" />
        </div>

      </div>
    </div>
  );
};

export default VisualJourney;
