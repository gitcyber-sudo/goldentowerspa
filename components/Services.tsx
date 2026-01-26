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

  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    const fetchServices = async () => {
      // Set a safety timeout - if fetch takes > 5s, something is wrong
      const timeout = setTimeout(() => {
        if (mounted) {
          console.warn("Service fetch timed out, forcing loading to false");
          setLoading(false);
        }
      }, 5000);

      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('title', { ascending: true });

        if (error) throw error;
        if (data && mounted) setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    };

    fetchServices();
    return () => { mounted = false; };
  }, []); // Only fetch once on mount to prevent "stuck" loading during auth shifts

  const processedServices = services.map(s => ({
    ...s,
    image_url: s.title === 'Shiatsu Massage'
      ? 'https://images.unsplash.com/photo-1611077544192-fa35438177e7?q=80&w=2070'
      : s.image_url
  }));

  const signatureTreatments = processedServices
    .filter(s => s.category === 'signature' || s.title.toLowerCase().includes('signature'))
    .sort((a, b) => a.title.localeCompare(b.title));

  const luxuryPackages = processedServices
    .filter(s => s.title.toUpperCase().includes('PACKAGE'))
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));

  const regularServices = processedServices.filter(s =>
    !signatureTreatments.some(st => st.id === s.id) && !luxuryPackages.some(lp => lp.id === s.id)
  ).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <section id="services" className="py-24 bg-white relative overflow-hidden">
      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes border-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shine {
          0% { left: -100%; top: -100%; }
          20% { left: 100%; top: 100%; }
          100% { left: 100%; top: 100%; }
        }
        .signature-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: conic-gradient(from 0deg, #C5A059, #F9F7F2, #997B3D, #F9F7F2, #C5A059);
          border-radius: 1.25rem;
          animation: border-rotate 4s linear infinite;
          z-index: -1;
        }
        .shimmer-effect::after {
          content: '';
          position: absolute;
          width: 50%;
          height: 200%;
          background: linear-gradient(to bottom right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(45deg);
          animation: shine 6s ease-in-out infinite;
          pointer-events: none;
        }
      `}} />

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
              {[...signatureTreatments, ...regularServices].map((service) => (
                <div
                  key={service.id}
                  className={`group transition-all duration-700 relative ${service.title.toLowerCase().includes('signature')
                    ? 'signature-card bg-white rounded-2xl p-4 shadow-xl scale-105 z-10'
                    : 'bg-cream/30 p-4 rounded-2xl border border-gold/10'
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
                    className="text-gold text-xs font-bold uppercase tracking-widest flex items-center hover:text-gold-dark transition-colors"
                  >
                    Book Massage <ArrowRight size={14} className="ml-2" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- PACKAGES SECTION --- */}
        <div id="packages" className="pt-24 border-t border-gold/10">
          <div className="flex flex-col mb-12 text-center">
            <span className="text-gold text-sm uppercase tracking-widest font-bold mb-2 block">Exclusive Bundles</span>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal">Luxury Packages</h2>
            <p className="text-charcoal-light mt-4 max-w-2xl mx-auto">Experience more for less. Our packages are designed to provide a holistic journey of rebirth and relaxation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {luxuryPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-[#Fdfbf7] border-2 border-sepia-200/30 rounded-3xl overflow-hidden hover:border-gold/50 transition-all duration-500 group shadow-sm hover:shadow-xl p-8 flex flex-col justify-between min-h-[300px]"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-gold text-[10px] uppercase font-black tracking-[0.3em] mb-2 block">Value Bundle</span>
                      <h3 className="font-serif text-3xl text-sepia-900">{pkg.title}</h3>
                    </div>
                    <div className="bg-gold/10 text-gold px-4 py-2 rounded-xl font-bold">
                      P{pkg.price}
                    </div>
                  </div>
                  <p className="text-charcoal-light text-lg italic mb-6 whitespace-pre-line leading-relaxed border-l-2 border-gold/20 pl-6">
                    {pkg.description.toLowerCase().charAt(0).toUpperCase() + pkg.description.toLowerCase().slice(1)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gold/10">
                  <span className="text-[10px] uppercase tracking-widest text-charcoal/50 font-bold">{pkg.duration} Total Duration</span>
                  <button
                    onClick={() => onBookClick(pkg.id)}
                    className="text-gold text-xs font-bold uppercase tracking-widest flex items-center group-hover:translate-x-1 transition-transform cursor-pointer"
                  >
                    Select Package <ArrowRight size={14} className="ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
