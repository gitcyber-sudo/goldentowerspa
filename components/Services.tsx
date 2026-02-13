import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2, Crown, Sparkles, MoveRight } from 'lucide-react';
import Logo from './Logo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  duration: string;
  price: number;
  category?: string;
}

interface ServicesProps {
  onBookClick: (id: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onBookClick }) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { loading: authLoading, user } = useAuth();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardsRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const fetchServices = async (retryCount = 0) => {
      if (!mounted) return;

      // Ensure spinner is visible on every fetch attempt
      setLoading(true);

      try {
        console.log(`Services: Fetch attempt ${retryCount + 1}...`);
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('title', { ascending: true });

        if (error) throw error;

        // If no data returned, it might be a Supabase sync delay
        if ((!data || data.length === 0) && retryCount < 3) {
          console.log(`Services: No data yet, retrying (${retryCount + 1}/3) in 2s...`);
          setTimeout(() => fetchServices(retryCount + 1), 2000);
          return;
        }

        if (data && mounted) {
          console.log(`Services: Loaded ${data.length} items`);
          setServices(data);
        }
      } catch (error) {
        console.error('Services fetch error:', error);
        // Try a retry even on error (e.g. network blip during sync)
        if (retryCount < 3) {
          console.log(`Services: Error encountered, retrying (${retryCount + 1}/3) in 2s...`);
          setTimeout(() => fetchServices(retryCount + 1), 2000);
          return;
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchServices();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (loading || !services.length) return;

    const ctx = gsap.context(() => {
      // Mobile Only Animation (check if width < 768px)
      if (window.innerWidth < 768 && cardsRef.current && containerRef.current) {

        const cards = gsap.utils.toArray('.express-card');
        const totalCards = cards.length;

        // Pin the container
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: `+=${totalCards * 100}%`,
            pin: true,
            scrub: 1,
            anticipatePin: 1
          }
        });

        cards.forEach((card: any, i) => {
          if (i === totalCards - 1) return; // Last card doesn't need to animate out

          tl.to(card, {
            yPercent: -120,
            opacity: 0,
            scale: 0.9,
            rotation: -5,
            duration: 1,
            ease: "power2.inOut"
          });
        });
      }

    }, containerRef);

    return () => ctx.revert();
  }, [loading, services]);

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const elements = document.querySelectorAll('.reveal, .reveal-express');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, services]);

  const processedServices = (services || []).map(s => ({
    ...s
  }));

  const signatureTreatments = processedServices
    .filter(s => s && (s.category === 'signature' || (s.title && s.title.toLowerCase().includes('signature'))))
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  const luxuryPackages = processedServices
    .filter(s => s && s.title && s.title.toUpperCase().includes('PACKAGE'))
    .sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { numeric: true }));

  const expressMassages = processedServices
    .filter(s => s && s.category === 'express')
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  const regularServices = processedServices.filter(s =>
    s &&
    s.title !== 'Home Service Massage' &&
    !signatureTreatments.some(st => st.id === s.id) &&
    !luxuryPackages.some(lp => lp.id === s.id) &&
    !expressMassages.some(em => em.id === s.id)
  ).sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-white via-[#faf9f5] to-cream/50 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        {/* --- SIGNATURE SECTION --- */}
        <div className="mb-24">
          <div className="flex flex-col mb-12">
            <span className="text-gold text-sm uppercase tracking-widest font-bold mb-2 block">The Art of Healing</span>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal">Signature Massages</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gold" size={32} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...signatureTreatments, ...regularServices].map((service, index) => (
                <div
                  key={service.id}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  className={`group transition-all duration-700 rounded-2xl p-4 reveal ${service.title.toLowerCase().includes('signature')
                    ? 'card-signature'
                    : 'bg-cream/30 border border-gold/10 hover:-translate-y-2 hover:shadow-lg'
                    }`}
                >
                  <div className={`relative h-[300px] w-full overflow-hidden mb-6 rounded-lg ${service.title.toLowerCase().includes('signature') ? 'shimmer-effect' : ''}`}>
                    <img
                      src={service.image_url}
                      alt={`Luxury treatment: ${service.title}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute bottom-4 right-4 bg-gold text-white px-3 py-1 text-sm font-bold shadow-md">P {service.price}</div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] uppercase font-bold tracking-widest">{service.duration}</div>
                  </div>
                  <h3 className="font-serif text-2xl text-charcoal mb-2 group-hover:text-gold transition-colors">{service.title}</h3>
                  <p className="text-charcoal-light text-sm font-light mb-4 line-clamp-2 italic">
                    {service.description.toLowerCase().charAt(0).toUpperCase() + service.description.toLowerCase().slice(1)}
                  </p>
                  <button
                    onClick={() => onBookClick(service.id)}
                    className="text-gold text-xs font-bold uppercase tracking-widest flex items-center hover:text-gold-dark transition-colors btn-tactile"
                  >
                    Book Massage <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- EXPRESS MASSAGE SECTION --- */}
        <div
          id="express"
          className="relative mt-24 mb-24 py-24 bg-charcoal -mx-6 md:-mx-12 px-6 md:px-12 overflow-hidden"
        >
          {/* Subtle Shimmer Background Layer */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(197,160,89,0.15),transparent_70%)] animate-pulse"></div>

          <div className="flex flex-col mb-16 relative z-10 lg:text-center">
            <span className="text-gold text-xs uppercase tracking-[0.4em] font-black mb-3 block flex lg:justify-center items-center gap-2">
              <Sparkles size={14} className="animate-spin-slow" /> Timeless Efficiency
            </span>
            <h2 className="font-serif text-5xl md:text-7xl text-white leading-tight">
              Express <span className="italic text-gold">Massage</span>
            </h2>
            <p className="text-cream/40 mt-6 max-w-2xl lg:mx-auto font-light leading-relaxed">
              Curated precision. Targeted treatments reimagined for those with
              limited time but high standards. Experience total restoration in 30 minutes.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={32} /></div>
          ) : (
            <div className="relative group/carousel">
              {/* Desktop Grid / Mobile Horizontal Carousel */}
              <div
                className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-12 snap-x snap-mandatory hide-scrollbar group transition-all duration-500 scroll-smooth"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {expressMassages.map((service, index) => (
                  <div
                    key={service.id}
                    className="flex-shrink-0 w-[85vw] md:w-full snap-center reveal-express group/card"
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all duration-700 hover:bg-white/10 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 flex flex-col relative overflow-hidden">
                      {/* Hover Shimmer */}
                      <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>

                      <div className="relative h-[280px] w-full overflow-hidden mb-8 rounded-2xl ring-1 ring-white/10 group-hover/card:ring-gold/20">
                        <img
                          src={service.image_url}
                          alt={`Express therapy: ${service.title}`}
                          loading="lazy"
                          className="w-full h-full object-cover grayscale-[30%] group-hover/card:grayscale-0 group-hover/card:scale-105 transition-all duration-1000"
                        />
                        <div className="absolute bottom-6 right-6 bg-gold text-white px-5 py-2 text-base font-black shadow-[0_8px_30px_rgb(197,160,89,0.3)] rounded-lg">
                          P {service.price}
                        </div>
                        <div className="absolute top-6 left-6 bg-charcoal/80 backdrop-blur-md px-3 py-1.5 text-[10px] text-gold uppercase font-black tracking-[0.2em] rounded-full border border-gold/20">
                          30 Mins Ritual
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-3xl text-white group-hover/card:text-gold transition-colors leading-tight">
                            {service.title}
                          </h3>
                        </div>
                        <p className="text-cream/60 text-sm font-light leading-relaxed italic line-clamp-3 pl-4 border-l border-gold/20">
                          {service.description.toLowerCase().charAt(0).toUpperCase() + service.description.toLowerCase().slice(1)}
                        </p>
                      </div>

                      <button
                        onClick={() => onBookClick(service.id)}
                        className="mt-auto w-full py-4 bg-transparent border border-gold/40 text-gold text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gold hover:text-white transition-all duration-500 btn-tactile group/btn rounded-xl"
                      >
                        Express Booking <MoveRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Swipe Indicator (Mobile Only) */}
              <div className="flex md:hidden items-center justify-center gap-3 text-gold/40 animate-pulse mt-4">
                <div className="w-8 h-[1px] bg-gold/20"></div>
                <span className="text-[10px] uppercase tracking-widest font-black text-center">Swipe Left for more massage</span>
                <div className="w-8 h-[1px] bg-gold/20"></div>
              </div>
            </div>
          )}
        </div>

        {/* --- PACKAGES SECTION --- */}
        <div id="packages" className="pt-24 border-t border-gold/10 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
          <div className="flex flex-col mb-12 text-center relative z-10">
            <span className="text-gold text-sm uppercase tracking-widest font-bold mb-2 block flex justify-center items-center gap-2"><Crown size={14} /> Exclusive Bundles</span>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal">Luxury Packages</h2>
            <p className="text-charcoal-light mt-4 max-w-2xl mx-auto">Experience more for less. Our packages are designed to provide a holistic journey of rebirth and relaxation.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={32} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {luxuryPackages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  style={{ transitionDelay: `${index * 150}ms` }}
                  className="bg-[#Fdfbf7]/80 backdrop-blur-sm border-2 border-gold/10 rounded-3xl overflow-hidden hover:border-gold/50 transition-all duration-500 group shadow-sm hover:shadow-2xl hover:shadow-gold/10 p-8 flex flex-col justify-between min-h-[300px] reveal"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-gold text-[10px] uppercase font-black tracking-[0.3em] mb-2 block">Value Bundle</span>
                        <h3 className="font-serif text-3xl text-sepia-900 group-hover:text-gold transition-colors">{pkg.title}</h3>
                      </div>
                      <div className="bg-gold/10 text-gold px-4 py-2 rounded-xl font-bold group-hover:bg-gold group-hover:text-white transition-colors">
                        P{pkg.price}
                      </div>
                    </div>
                    <p className="text-charcoal-light text-lg italic mb-6 whitespace-pre-line leading-relaxed border-l-2 border-gold/20 pl-6 group-hover:border-gold transition-colors">
                      {pkg.description.toLowerCase().charAt(0).toUpperCase() + pkg.description.toLowerCase().slice(1)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-gold/10 group-hover:border-gold/30">
                    <span className="text-[10px] uppercase tracking-widest text-charcoal/50 font-bold">{pkg.duration} Total Duration</span>
                    <button
                      onClick={() => onBookClick(pkg.id)}
                      className="text-gold text-xs font-bold uppercase tracking-widest flex items-center group-hover:translate-x-1 transition-transform cursor-pointer btn-tactile"
                    >
                      Select Package <ArrowRight size={14} className="ml-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Services;
