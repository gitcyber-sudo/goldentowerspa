
import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { Loader2, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

interface TherapistItem {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image_url: string;
  rating: number;
}

interface TherapistsProps {
  onBookClick: () => void;
}

const TherapyCard: React.FC<{ member: TherapistItem, index: number, cardRef: (el: HTMLDivElement | null) => void }> = ({ member, index, cardRef }) => {
  return (
    <div
      ref={cardRef}
      className={`relative group w-full ${index % 2 !== 0 ? 'lg:mt-32' : ''}`}
    >
      <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20">
        <img
          src={member.image_url || `https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1000&auto=format&fit=crop`}
          alt={member.name}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <Award size={14} className="text-gold" />
            <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">{member.specialty}</span>
          </div>

          <div className="flex items-baseline gap-4 mb-2">
            <h3 className="text-luxury text-4xl md:text-6xl text-white italic leading-none">{member.name}</h3>
            <div className="flex items-center gap-1">
              <Star size={14} className="text-gold fill-gold" />
              <span className="text-white/60 text-sm font-serif italic">{member.rating}</span>
            </div>
          </div>

          <p className="text-white/70 text-xs md:text-sm font-light leading-relaxed max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            {member.bio || "Guided by passion and expert technique, bringing harmony to every touch."}
          </p>
        </div>
      </div>

      {/* Vertical Ornament */}
      <div className="absolute -right-6 top-1/2 -rotate-90 origin-center opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 pointer-events-none">
        <span className="text-[9px] uppercase tracking-[0.6em] text-gold font-bold whitespace-nowrap">Experience Ritual</span>
      </div>
    </div>
  );
};

const Therapists: React.FC<TherapistsProps> = ({ onBookClick }) => {
  const [team, setTeam] = useState<TherapistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        if (data) setTeam(data);
      } catch (error) {
        console.error('Error fetching therapists:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTherapists();
  }, []);

  useLayoutEffect(() => {
    if (loading) return;

    let ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

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
              start: "top 92%",
              toggleActions: "play none none reverse",
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [loading]);

  return (
    <section ref={sectionRef} id="specialists" className="bg-cream py-32 md:py-48 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="mb-24 md:mb-32 text-center max-w-3xl mx-auto">
          <span className="text-gold font-bold uppercase tracking-[0.6em] text-[10px] mb-6 block">Master Artisans</span>
          <h2 className="text-luxury text-5xl md:text-8xl text-charcoal leading-none mb-8">
            Meet the <span className="italic font-light">Therapists</span>
          </h2>
          <div className="w-24 h-[1px] bg-gold/30 mx-auto"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-gold" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32">
            {team.map((member, i) => (
              <TherapyCard
                key={member.id}
                member={member}
                index={i}
                cardRef={el => { cardsRef.current[i] = el; }}
              />
            ))}
          </div>
        )}

        <div className="mt-32 md:mt-48 text-center">
          <button
            onClick={onBookClick}
            className="btn-gold px-12 py-5 text-xs tracking-[0.3em]"
          >
            Reserve with Expert
          </button>
        </div>
      </div>
    </section>
  );
};

export default Therapists;

