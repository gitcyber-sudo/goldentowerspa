import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2, Sparkles, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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
    if (loading) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const elements = document.querySelectorAll('.reveal');
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
                    <img src={service.image_url} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
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

        {/* --- EXPRESS SECTION --- */}
        <div id="express" className="mb-24 pt-24 border-t border-gold/10 bg-gradient-to-b from-transparent to-cream/30 -mx-6 md:-mx-12 px-6 md:px-12">
          <div className="flex flex-col mb-12">
            <span className="text-gold text-sm uppercase tracking-widest font-bold mb-2 block">Quick Rejuvenation</span>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal">Express Massages</h2>
            <p className="text-charcoal-light mt-4 max-w-2xl">Perfect for those on the go. Targeted treatments designed for maximum relaxation in minimum time.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gold" size={32} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {expressMassages.map((service, index) => (
                <div
                  key={service.id}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  className="group card-express p-4 rounded-xl reveal"
                >
                  <div className="relative h-[240px] w-full overflow-hidden mb-6 rounded-lg">
                    <img src={service.image_url} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute bottom-4 right-4 bg-gold text-white px-3 py-1 text-sm font-bold shadow-md">P {service.price}</div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] uppercase font-bold tracking-widest">30 MIN</div>
                  </div>
                  <h3 className="font-serif text-2xl text-charcoal mb-2 group-hover:text-gold transition-colors flex items-center gap-2">
                    {service.title} <Sparkles size={16} className="text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-charcoal-light text-sm font-light mb-4 line-clamp-2 italic">
                    {service.description.toLowerCase().charAt(0).toUpperCase() + service.description.toLowerCase().slice(1)}
                  </p>
                  <button
                    onClick={() => onBookClick(service.id)}
                    className="text-gold text-xs font-bold uppercase tracking-widest flex items-center hover:text-gold-dark transition-colors btn-tactile"
                  >
                    Select Express <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              ))}
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
