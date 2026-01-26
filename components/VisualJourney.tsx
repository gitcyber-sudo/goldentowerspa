
import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

const cloudImages = [
  // Top Left
  { src: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=600&auto=format&fit=crop", top: "10%", left: "10%", xDir: -150, yDir: -150 },
  // Top Right
  { src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop", top: "10%", left: "90%", xDir: 150, yDir: -150 },
  // Bottom Left
  { src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=600&auto=format&fit=crop", top: "90%", left: "10%", xDir: -150, yDir: 150 },
  // Bottom Right
  { src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop", top: "90%", left: "90%", xDir: 150, yDir: 150 },
  // Top Center
  { src: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop", top: "5%", left: "50%", xDir: 0, yDir: -200 },
  // Bottom Center (Hero/Treatment vibe)
  { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop", top: "95%", left: "50%", xDir: 0, yDir: 200 },
  // Left Mid
  { src: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=600&auto=format&fit=crop", top: "50%", left: "5%", xDir: -200, yDir: 0 },
  // Right Mid
  { src: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=600&auto=format&fit=crop", top: "50%", left: "95%", xDir: 200, yDir: 0 },
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
          end: "+=200%",
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
        }
      });

      // 1. Center Circle Animation
      tl.fromTo(mainImageRef.current,
        { scale: 1.8, filter: "brightness(1.1)", xPercent: -50, yPercent: -50 },
        { scale: 0.6, filter: "brightness(1)", xPercent: -50, yPercent: -50, ease: "power2.inOut", duration: 1.5 }
        , 0);

      // 2. Cloud Images Animation
      cloudRefs.current.forEach((el, index) => {
        if (!el) return;
        const info = cloudImages[index];

        tl.fromTo(el,
          {
            opacity: 0,
            xPercent: info.xDir,
            yPercent: info.yDir,
            scale: 0.7,
            rotation: index % 2 === 0 ? -15 : 15,
            x: "-50%",
            y: "-50%"
          },
          {
            opacity: 1,
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            rotation: 0,
            x: "-50%",
            y: "-50%",
            ease: "expo.out",
            duration: 1.5
          },
          "<0.15"
        );
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-cream relative">
      <div ref={triggerRef} className="h-screen w-full overflow-hidden flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-white to-cream opacity-50 z-0 pointer-events-none" />

        <div className="relative w-full h-full max-w-[1600px] mx-auto overflow-hidden">

          {/* Main Central Image (Circular Mask) - Now using absolute center and translates */}
          <div
            ref={mainImageRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[45vh] h-[45vh] md:w-[65vh] md:h-[65vh] rounded-full overflow-hidden border-4 border-gold shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop"
              alt="Center Spa Moment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <h3 className="text-white font-serif text-3xl md:text-5xl italic opacity-90 drop-shadow-lg">The Experience</h3>
            </div>
          </div>

          {/* Cloud Images - Positioned relative to center */}
          {cloudImages.map((img, i) => (
            <div
              key={i}
              ref={(el) => { cloudRefs.current[i] = el; }}
              className="absolute z-10 w-28 h-36 md:w-56 md:h-72 shadow-2xl rounded-2xl overflow-hidden border border-white/40"
              style={{
                top: img.top,
                left: img.left,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <img
                src={img.src}
                alt={`Gallery ${i}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
              />
            </div>
          ))}

        </div>

        <div className="absolute bottom-10 left-0 w-full text-center z-30 pointer-events-none">
          <p className="text-gold-dark text-[10px] uppercase font-bold tracking-[0.6em] animate-pulse opacity-60">Ascend to Tranquility</p>
        </div>

      </div>
    </div>
  );
};

export default VisualJourney;
