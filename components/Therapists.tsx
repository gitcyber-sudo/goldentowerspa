
import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

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

const Therapists: React.FC<TherapistsProps> = ({ onBookClick }) => {
  const { loading: authLoading, user } = useAuth();
  const [team, setTeam] = useState<TherapistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchTherapists = async (retryCount = 0) => {
      if (!mounted) return;

      setLoading(true);

      try {
        console.log(`Therapists: Fetch attempt ${retryCount + 1}...`);
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        if ((!data || data.length === 0) && retryCount < 3) {
          console.log(`Therapists: No data yet, retrying (${retryCount + 1}/3) in 2s...`);
          setTimeout(() => fetchTherapists(retryCount + 1), 2000);
          return;
        }

        if (data && mounted) {
          console.log(`Therapists: Loaded ${data.length} specialists`);
          setTeam(data);
        }
      } catch (error) {
        console.error('Therapists fetch error:', error);
        if (retryCount < 3) {
          console.log(`Therapists: Error encountered, retrying (${retryCount + 1}/3) in 2s...`);
          setTimeout(() => fetchTherapists(retryCount + 1), 2000);
          return;
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTherapists();
    return () => { mounted = false; };
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
  }, [loading]);

  return (
    <section
      ref={sectionRef}
      id="specialists"
      className="bg-gradient-to-b from-cream/50 to-white py-24 md:py-32 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 mix-blend-multiply"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">

        <div className="therapists-header mb-16 md:mb-24 text-center">
          <span className="text-gold font-bold uppercase tracking-[0.4em] text-xs mb-3 block">Expert Hands</span>
          <h2 className="font-serif text-5xl md:text-7xl text-charcoal leading-tight">
            Meet the <span className="italic text-gold-dark">Therapists</span>
          </h2>
          <div className="w-24 h-1 bg-gold mx-auto mt-8 opacity-50"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-gold" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-x-20 md:gap-y-32">
            {team.map((member, i) => (
              <div
                key={member.id}
                ref={el => { cardsRef.current[i] = el; }}
                className={`relative group w-full ${i % 2 !== 0 ? 'md:mt-32' : ''}`}
              >
                <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-t-[120px] rounded-b-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transition-shadow duration-500 group-hover:shadow-gold/20">

                  <img
                    src={member.image_url || `https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1000&auto=format&fit=crop`}
                    alt={`Wellness Specialist: ${member.name}`}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />

                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20">
                    <p className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-3 transform transition-transform duration-500 group-hover:-translate-y-1">
                      {member.specialty}
                    </p>
                    <div className="flex items-end gap-3">
                      <h3 className="font-serif text-5xl md:text-6xl text-white italic leading-none">
                        {member.name}
                      </h3>
                      <span className="font-serif italic text-2xl md:text-3xl text-white/50 mb-1 transform -rotate-3">
                        {member.rating}★
                      </span>
                    </div>
                  </div>
                </div>


              </div>
            ))}
          </div>
        )}


      </div>
    </section>
  );
};

export default Therapists;

