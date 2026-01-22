
import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

const cloudImages = [
  // Top Left
  { src: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=600&auto=format&fit=crop", top: "15%", left: "15%", xDir: -100, yDir: -100 },
  // Top Right
  { src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop", top: "15%", left: "65%", xDir: 100, yDir: -100 },
  // Bottom Left
  { src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=600&auto=format&fit=crop", top: "65%", left: "15%", xDir: -100, yDir: 100 },
  // Bottom Right
  { src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop", top: "65%", left: "65%", xDir: 100, yDir: 100 },
  // Top Center
  { src: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop", top: "5%", left: "40%", xDir: 0, yDir: -150 },
  // Bottom Center (Updated with working placeholder)
  { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop", top: "75%", left: "40%", xDir: 0, yDir: 150 },
  // Left Center
  // Left Center (Gallery 6 - Fixed)
  { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop", top: "40%", left: "5%", xDir: -150, yDir: 0 },
  // Right Center
  { src: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=600&auto=format&fit=crop", top: "40%", left: "75%", xDir: 150, yDir: 0 },
];

const VisualJourney: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=200%", // Scroll distance of 2 screen heights
          scrub: 1, // Smooth scrubbing linked to scrollbar
          pin: true,
          anticipatePin: 1,
        }
      });

      // 1. Main Image Animation: Scale down from full screen to center circle
      tl.fromTo(mainImageRef.current,
        { scale: 1.5, filter: "brightness(1.1)" },
        { scale: 0.5, filter: "brightness(1)", ease: "power2.inOut", duration: 1 }
        , 0);

      // 2. Cloud Images Animation: Fade in and move to center
      cloudRefs.current.forEach((el, index) => {
        if (!el) return;
        const info = cloudImages[index];

        // They start further out (xDir/yDir) and transparent
        tl.fromTo(el,
          {
            opacity: 0,
            xPercent: info.xDir,
            yPercent: info.yDir,
            scale: 0.8,
            rotation: index % 2 === 0 ? -10 : 10 // Subtle random rotation
          },
          {
            opacity: 1,
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            rotation: 0,
            ease: "power2.out",
            duration: 1
          },
          "<0.1" // Start slightly after main image starts
        );
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-cream relative">
      {/* 
        Trigger Div: This acts as the scroll track. 
        It is tall (h-[300vh]) to allow scroll space. 
      */}
      <div ref={triggerRef} className="h-screen w-full overflow-hidden flex items-center justify-center relative">

        {/* Background Gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-white to-cream opacity-50 z-0 pointer-events-none" />

        <div className="relative w-full h-full max-w-[1920px] mx-auto overflow-hidden flex items-center justify-center">

          {/* Main Central Image (Circular Mask) */}
          <div
            ref={mainImageRef}
            className="absolute z-20 w-[40vh] h-[40vh] md:w-[60vh] md:h-[60vh] rounded-full overflow-hidden border-4 border-gold/20 shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop"
              alt="Center Spa Moment"
              className="w-full h-full object-cover"
            />
            {/* Overlay Text inside the circle */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <h3 className="text-white font-serif text-3xl md:text-5xl italic opacity-90 drop-shadow-md">The Ritual</h3>
            </div>
          </div>

          {/* Cloud Images */}
          {cloudImages.map((img, i) => (
            <div
              key={i}
              ref={(el) => { cloudRefs.current[i] = el; }}
              className="absolute z-10 w-32 h-40 md:w-48 md:h-64 shadow-xl rounded-lg overflow-hidden border border-white/50"
              style={{ top: img.top, left: img.left }}
            >
              <img
                src={img.src}
                alt={`Gallery ${i}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
          ))}

        </div>

        {/* Section Heading that fades out as animation starts (optional aesthetic touch) */}
        <div className="absolute bottom-10 left-0 w-full text-center z-30 pointer-events-none mix-blend-multiply">
          <p className="text-gold-dark text-xs uppercase tracking-[0.5em] animate-pulse">Scroll to Immerse</p>
        </div>

      </div>
    </div>
  );
};

export default VisualJourney;
