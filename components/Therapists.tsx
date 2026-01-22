
import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * STEP 4: The data below now points to your local "public/images/" folder.
 * Make sure your filenames match exactly (e.g., jake.jpg, charles.jpg).
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
  const componentRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const mobileCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      let mm = gsap.matchMedia();

      // --- DESKTOP: Smooth Horizontal Scroll ---
      mm.add("(min-width: 768px)", () => {
        const slider = sliderRef.current;
        if (!slider || !componentRef.current) return;

        const totalWidth = slider.scrollWidth;
        const viewportWidth = window.innerWidth;
        const scrollDistance = -(totalWidth - viewportWidth + 100);

        gsap.to(slider, {
          x: scrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: componentRef.current,
            start: "top top",
            end: () => `+=${slider.scrollWidth}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          }
        });
      });

      // --- MOBILE: Fly-In From Sides ---
      mm.add("(max-width: 767px)", () => {
        mobileCardsRef.current.forEach((card, i) => {
          if (!card) return;
          
          // Elements fly in from alternating sides
          const xStart = i % 2 === 0 ? -150 : 150;
          
          gsap.fromTo(card, 
            { 
              opacity: 0, 
              x: xStart,
              rotate: i % 2 === 0 ? -5 : 5,
              scale: 0.8
            },
            {
              opacity: 1,
              x: 0,
              rotate: 0,
              scale: 1,
              duration: 1.2,
              ease: "expo.out",
              scrollTrigger: {
                trigger: card,
                start: "top 90%",
                toggleActions: "play none none reverse"
              }
            }
          );
        });
      });

    }, componentRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={componentRef} id="specialists" className="bg-cream overflow-hidden relative">
      
      {/* DESKTOP VIEW */}
      <div className="hidden md:flex h-screen w-full flex-col justify-center">
        <div className="container mx-auto px-12 mb-8 relative z-10">
          <span className="text-gold font-bold uppercase tracking-[0.4em] text-xs">The Specialists</span>
          <h2 className="font-serif text-7xl text-charcoal mt-2">
            Meet the <span className="italic text-gold-dark">Team</span>
          </h2>
        </div>

        <div 
          ref={sliderRef}
          className="flex gap-10 px-12 w-max items-center h-[70vh]"
          style={{ paddingLeft: '10vw' }}
        >
          {team.map((member, i) => (
            <div 
              key={i} 
              className="relative w-[450px] h-[600px] flex-shrink-0 group overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 hover:shadow-gold/20"
            >
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                onError={(e) => {
                  // Fallback if image isn't found during setup
                  (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1000&auto=format&fit=crop`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-0 left-0 w-full p-10 z-20">
                 <p className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-2">{member.role}</p>
                 <div className="flex items-end gap-3">
                    <h3 className="font-serif text-6xl text-white italic leading-none">{member.name}</h3>
                    <span className="font-serif italic text-2xl text-white/60 mb-1">{member.age}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden py-24 px-6">
        <div className="mb-16 text-center">
            <span className="text-gold font-bold uppercase tracking-[0.4em] text-xs">The Specialists</span>
            <h2 className="font-serif text-5xl text-charcoal mt-2">
              Meet the <span className="italic text-gold-dark">Team</span>
            </h2>
        </div>

        <div className="flex flex-col gap-12">
            {team.map((member, i) => (
                <div 
                    key={i}
                    ref={el => { mobileCardsRef.current[i] = el; }}
                    className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl"
                >
                    <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1000&auto=format&fit=crop`;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-8">
                        <p className="text-gold text-[10px] font-bold uppercase tracking-widest mb-1">{member.role}</p>
                        <div className="flex items-end gap-3">
                            <h3 className="font-serif text-5xl text-white italic leading-none">{member.name}</h3>
                            <span className="font-serif italic text-xl text-white/70 mb-1">{member.age}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Therapists;
