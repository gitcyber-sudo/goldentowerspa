
import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// DATA FROM YOUR IMAGES
// IMPORTANT: Replace the 'image' URLs with your actual local files (e.g., "/images/jake.jpg") 
// to match the specific photos you provided.
const team = [
  {
    name: "Jake",
    age: "27yo",
    role: "Senior Expert in Sports Massage",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Charles",
    age: "26yo",
    role: "Senior Trainer Therapist",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Lemeul",
    age: "23yo",
    role: "Relaxation Specialist",
    image: "https://images.unsplash.com/photo-1591343395082-9b1bf82ad468?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Nic",
    age: "21yo",
    role: "Therapist",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Matt",
    age: "20yo",
    role: "Therapist",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Kim",
    age: "21yo",
    role: "Therapist",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "JB",
    age: "20yo",
    role: "Therapist",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Sheena",
    age: "22yo",
    role: "Therapist",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
  }
];

const Therapists: React.FC = () => {
  const componentRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const mobileCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Setup GSAP MatchMedia for responsive animations
      let mm = gsap.matchMedia();

      // --- DESKTOP ANIMATION (Horizontal Scroll) ---
      mm.add("(min-width: 768px)", () => {
        const slider = sliderRef.current;
        if (!slider) return;

        // Calculate how far to scroll (Total width - Viewport width)
        const totalWidth = slider.scrollWidth;
        const viewportWidth = window.innerWidth;
        const scrollDistance = -(totalWidth - viewportWidth + 100); // +100 for padding

        gsap.to(slider, {
          x: scrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: componentRef.current,
            start: "top top",
            end: `+=${totalWidth}`, // The scroll length matches the content width
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          }
        });
      });

      // --- MOBILE ANIMATION (Fly In) ---
      mm.add("(max-width: 767px)", () => {
        mobileCardsRef.current.forEach((card, i) => {
          if (!card) return;
          
          // Determine direction (Alternate left/right)
          const xStart = i % 2 === 0 ? -100 : 100;
          
          gsap.fromTo(card, 
            { 
              opacity: 0, 
              x: xStart, 
              y: 50,
              scale: 0.9 
            },
            {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%", // Start animation when card top is near bottom of screen
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
      
      {/* DESKTOP LAYOUT (Horizontal Scroll) */}
      <div className="hidden md:flex h-screen w-full flex-col justify-center">
        <div className="container mx-auto px-12 mb-8 relative z-10">
          <span className="text-gold font-bold uppercase tracking-[0.3em] text-sm">Expert Care</span>
          <h2 className="font-serif text-6xl text-charcoal mt-2">
            Meet the <span className="italic text-gold-dark">Therapists</span>
          </h2>
        </div>

        {/* The Track */}
        <div 
          ref={sliderRef}
          className="flex gap-12 px-12 w-max items-center h-[650px]"
          style={{ paddingLeft: '5vw' }}
        >
          {team.map((member, i) => (
            <div 
              key={i} 
              className="relative w-[400px] h-[600px] flex-shrink-0 group overflow-hidden rounded-t-[150px] shadow-2xl transition-transform duration-500 hover:-translate-y-4"
            >
              <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/0 transition-all duration-500 z-10" />
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay Content */}
              <div className="absolute bottom-0 left-0 w-full p-8 z-20 bg-gradient-to-t from-charcoal/90 to-transparent">
                 <p className="text-gold text-xs font-bold uppercase tracking-widest mb-1">{member.role}</p>
                 <div className="flex items-baseline gap-2">
                    <h3 className="font-serif text-5xl text-white italic">{member.name}</h3>
                    <span className="font-serif italic text-2xl text-white/70 transform -rotate-6">{member.age}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* MOBILE LAYOUT (Vertical Stack with Fly-In) */}
      <div className="md:hidden py-20 px-6">
        <div className="mb-12 text-center">
            <span className="text-gold font-bold uppercase tracking-[0.3em] text-xs">Expert Care</span>
            <h2 className="font-serif text-4xl text-charcoal mt-2">
            Meet the <span className="italic text-gold-dark">Therapists</span>
            </h2>
        </div>

        <div className="flex flex-col gap-8">
            {team.map((member, i) => (
                <div 
                    key={i}
                    ref={el => { mobileCardsRef.current[i] = el; }}
                    className="relative w-full aspect-[4/5] rounded-t-[100px] rounded-b-lg overflow-hidden shadow-xl"
                >
                    <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent">
                        <p className="text-gold text-[10px] font-bold uppercase tracking-widest mb-1">{member.role}</p>
                        <div className="flex items-end gap-3">
                            <h3 className="font-serif text-4xl text-white italic leading-none">{member.name}</h3>
                            <span className="font-serif italic text-xl text-white/80 transform -rotate-3 mb-1">{member.age}</span>
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
