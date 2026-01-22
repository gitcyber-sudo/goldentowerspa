
import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * THERAPIST DATA
 * Pointing to your local "public/images/" folder as per the step-by-step guide.
 */
const team = [
  {
    name: "Jake",
    age: "27yo",
    role: "Senior Expert in Sports Massage",
    image: "/images/jake.jpg" 
  },
  {
    name: "Charles",
    age: "26yo",
    role: "Senior Trainer Therapist",
    image: "/images/charles.jpg"
  },
  {
    name: "Lemeul",
    age: "23yo",
    role: "Relaxation Specialist",
    image: "/images/lemeul.jpg"
  },
  {
    name: "Nic",
    age: "21yo",
    role: "Therapist",
    image: "/images/nic.jpg"
  },
  {
    name: "Matt",
    age: "20yo",
    role: "Therapist",
    image: "/images/matt.jpg"
  },
  {
    name: "Kim",
    age: "21yo",
    role: "Therapist",
    image: "/images/kim.jpg"
  },
  {
    name: "JB",
    age: "20yo",
    role: "Therapist",
    image: "/images/jb.jpg"
  },
  {
    name: "Sheena",
    age: "22yo",
    role: "Therapist",
    image: "/images/sheena.jpg"
  }
];

const Therapists: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Animate each card as it enters the viewport
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        // Configuration for the "Fly-In"
        // Alternating horizontal start positions for a dynamic feel
        const isEven = i % 2 === 0;
        const xOffset = isEven ? -150 : 150;
        const rotationStart = isEven ? -8 : 8;

        gsap.fromTo(card, 
          { 
            opacity: 0, 
            x: xOffset,
            y: 100,
            rotate: rotationStart,
            scale: 0.85,
            filter: "blur(10px)"
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: "top 92%", // Starts animation early for a smooth transition
              toggleActions: "play none none reverse",
            }
          }
        );
      });

      // Animate the Header
      gsap.from(".therapists-header", {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: ".therapists-header",
          start: "top 90%",
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="specialists" 
      className="bg-cream py-24 md:py-32 overflow-hidden relative"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="therapists-header mb-16 md:mb-24 text-center">
          <span className="text-gold font-bold uppercase tracking-[0.4em] text-xs mb-3 block">Expert Hands</span>
          <h2 className="font-serif text-5xl md:text-7xl text-charcoal leading-tight">
            Meet the <span className="italic text-gold-dark">Therapists</span>
          </h2>
          <div className="w-24 h-1 bg-gold mx-auto mt-8 opacity-50"></div>
        </div>

        {/* Vertical Grid for both Mobile and Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-x-20 md:gap-y-32">
          {team.map((member, i) => (
            <div 
              key={i}
              ref={el => { cardsRef.current[i] = el; }}
              className={`relative group w-full ${i % 2 !== 0 ? 'md:mt-32' : ''}`} // Staggered vertical layout on desktop
            >
              {/* The Card */}
              <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-t-[120px] rounded-b-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transition-shadow duration-500 group-hover:shadow-gold/20">
                
                {/* Image */}
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback to placeholder if local file is missing
                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1000&auto=format&fit=crop`;
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />
                
                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20">
                   <p className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-3 transform transition-transform duration-500 group-hover:-translate-y-1">
                     {member.role}
                   </p>
                   <div className="flex items-end gap-3">
                      <h3 className="font-serif text-5xl md:text-6xl text-white italic leading-none">
                        {member.name}
                      </h3>
                      <span className="font-serif italic text-2xl md:text-3xl text-white/50 mb-1 transform -rotate-3">
                        {member.age}
                      </span>
                   </div>
                </div>
              </div>

              {/* Subtle Labeling for additional flair on Desktop */}
              <div className="hidden md:block absolute -right-8 top-1/2 -rotate-90 origin-center opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                <span className="text-[10px] uppercase tracking-[0.5em] text-gold-dark font-bold whitespace-nowrap">
                  Golden Tower Signature
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 md:mt-48 text-center">
            <button className="bg-charcoal text-gold border border-gold/30 hover:bg-gold hover:text-white px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-500 shadow-xl">
                Book with your Favorite
            </button>
        </div>
      </div>
    </section>
  );
};

export default Therapists;
