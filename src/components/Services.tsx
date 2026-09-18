import React, { useEffect, useState, useMemo } from 'react';
import { ArrowRight, Loader2, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ExpressSection from './ExpressSection';
import SignatureMassage from './SignatureMassage';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatDuration } from '../lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  duration: number;
  price: number;
  category?: string;
}

interface ServicesProps {
  onBookClick: (id: string) => void;
}

const Services: React.FC<ServicesProps> = React.memo(({ onBookClick }) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchServices = async (retryCount = 0) => {
      if (!mounted) return;

      // Ensure spinner is visible on every fetch attempt
      setLoading(true);

      try {

        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('title', { ascending: true });

        if (error) throw error;

        // If no data returned, it might be a Supabase sync delay
        if ((!data || data.length === 0) && retryCount < 3) {

          setTimeout(() => fetchServices(retryCount + 1), 500);
          return;
        }

        if (data && mounted) {

          setServices(data);
        }
      } catch (error: any) {
        console.error('Services fetch error:', error);

        // Standardized Telemetry
        import('../lib/errorLogger').then(({ logError }) => {
          logError({
            message: `[GTS-201]: Failed to fetch services menu. ${error.message || ''}`,
            severity: 'error',
            metadata: { retryCount, originalError: error }
          });
        });

        // Try a retry even on error (e.g. network blip during sync)
        if (retryCount < 3) {

          setTimeout(() => fetchServices(retryCount + 1), 500);
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

    const elements = document.querySelectorAll('.reveal, .reveal-3d-deck, .reveal-glass-float');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, services]);

  const processedServices = useMemo(() => (services || []).map(s => ({
    ...s
  })), [services]);

  const goldenTowerSignature = useMemo(() => processedServices.find(s =>
    s && s.title && s.title.toLowerCase().includes('golden tower signature')
  ), [processedServices]);

  const signatureTreatments = useMemo(() => processedServices
    .filter(s =>
      s &&
      (s.category === 'signature' || (s.title && s.title.toLowerCase().includes('signature'))) &&
      (!goldenTowerSignature || s.id !== goldenTowerSignature.id)
    )
    .sort((a, b) => (a.title || "").localeCompare(b.title || "")), [processedServices, goldenTowerSignature]);

  const luxuryPackages = useMemo(() => processedServices
    .filter(s => s && s.title && s.title.toUpperCase().includes('PACKAGE'))
    .sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { numeric: true })), [processedServices]);

  const expressMassages = useMemo(() => processedServices
    .filter(s => s && s.category === 'express')
    .sort((a, b) => (a.title || "").localeCompare(b.title || "")), [processedServices]);

  const regularServices = useMemo(() => processedServices.filter(s =>
    s &&
    s.title !== 'Home Service Massage' &&
    !signatureTreatments.some(st => st.id === s.id) &&
    !luxuryPackages.some(lp => lp.id === s.id) &&
    !expressMassages.some(em => em.id === s.id) &&
    (!goldenTowerSignature || s.id !== goldenTowerSignature.id)
  ).sort((a, b) => (a.title || "").localeCompare(b.title || "")), [processedServices, signatureTreatments, luxuryPackages, expressMassages, goldenTowerSignature]);

  return (
    <section id="services" aria-label="Spa treatments and services" className="py-16 md:py-24 bg-gradient-to-b from-white via-[#faf9f5] to-cream/50 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        {/* Highlighted Golden Tower Signature Massage */}
        {goldenTowerSignature && (
          <div className="mb-24">
            <SignatureMassage
              service={goldenTowerSignature}
              onBookClick={onBookClick}
            />
          </div>
        )}

        {/* --- REGULAR SECTION — Clean Redesign --- */}
        <div className="mb-24">
          {/* Section header with ornamental accent */}
          <div className="flex flex-col mb-10 md:mb-14">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-gold"></div>
              <span className="text-gold text-[11px] uppercase tracking-[0.3em] font-bold">The Art of Healing</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-charcoal leading-tight">Regular Massages</h2>
            <p className="text-charcoal-light/60 mt-3 max-w-lg text-sm md:text-base font-light leading-relaxed">Traditional techniques refined for modern wellness. Each session is crafted to restore body and mind.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10" role="status" aria-label="Loading treatments">
              <Loader2 className="animate-spin text-gold" size={32} aria-hidden="true" />
              <span className="sr-only">Loading treatments...</span>
            </div>
          ) : (
            <>
              {signatureTreatments.length === 0 && regularServices.length === 0 && !goldenTowerSignature ? (
                <div className="text-center py-16">
                  <p className="text-charcoal/50 text-lg font-light">Our treatment menu is being updated. Please check back soon.</p>
                </div>
              ) : (
                <>
                  {/* Desktop: elegant grid layout */}
                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...signatureTreatments, ...regularServices].map((service, index) => (
                      <div
                        key={service.id}
                        className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(197,160,89,0.12)] transition-shadow duration-300"
                        style={{ animation: `fadeUpCard 0.5s ease-out ${index * 0.08}s both` }}
                      >
                        {/* Image */}
                        <div className="relative h-[240px] w-full overflow-hidden">
                          <img
                            src={service.image_url}
                            alt={service.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          {/* Dark gradient overlay at bottom */}
                          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent"></div>
                          {/* Price badge */}
                          <div className="absolute bottom-3 right-3 bg-gold text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md">
                            ₱{service.price}
                          </div>
                          {/* Duration badge */}
                          <div className="absolute top-3 left-3 bg-charcoal/80 text-cream-light px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">
                            {formatDuration(service.duration)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="font-serif text-xl text-charcoal mb-2 group-hover:text-gold transition-colors duration-200">
                            {service.title}
                          </h3>
                          <p className="text-charcoal-light/70 text-sm font-light leading-relaxed line-clamp-2 mb-4">
                            {service.description.charAt(0).toUpperCase() + service.description.slice(1).toLowerCase()}
                          </p>
                          <button
                            onClick={() => onBookClick(service.id)}
                            className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 hover:text-gold-dark transition-colors duration-200 btn-tactile"
                            aria-label={`Book ${service.title}`}
                          >
                            Book Massage <ArrowRight size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile: vertical stacked cards with full descriptions */}
                  <div className="md:hidden flex flex-col gap-5">
                    {[...signatureTreatments, ...regularServices].map((service, index) => (
                      <div
                        key={service.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                        style={{ animation: `fadeUpCard 0.5s ease-out ${index * 0.06}s both` }}
                      >
                        {/* Full-width image */}
                        <div className="relative h-[200px] w-full overflow-hidden">
                          <img
                            src={service.image_url}
                            alt={service.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent"></div>
                          {/* Price badge */}
                          <div className="absolute bottom-3 right-3 bg-gold text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md">
                            ₱{service.price}
                          </div>
                          {/* Duration badge */}
                          <div className="absolute top-3 left-3 bg-charcoal/80 text-cream-light px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">
                            {formatDuration(service.duration)}
                          </div>
                        </div>

                        {/* Content — no clamp, full description */}
                        <div className="p-4">
                          {/* Gold accent line */}
                          <div className="w-8 h-[2px] bg-gold/40 mb-3"></div>
                          <h3 className="font-serif text-xl text-charcoal leading-tight mb-2">
                            {service.title}
                          </h3>
                          <p className="text-charcoal-light/60 text-sm font-light leading-relaxed mb-4">
                            {service.description.charAt(0).toUpperCase() + service.description.slice(1).toLowerCase()}
                          </p>
                          <button
                            onClick={() => onBookClick(service.id)}
                            className="w-full py-3 bg-cream border border-gold/20 text-gold text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 rounded-xl active:scale-[0.98] transition-transform btn-tactile"
                            aria-label={`Book ${service.title}`}
                          >
                            Book Massage <ArrowRight size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* ═══ SEPARATOR: Regular → Express ═══ */}
        <div className="relative w-screen left-1/2 -ml-[50vw]">
          {/* Gradient fade: cream → dark */}
          <div className="h-24 md:h-32 bg-gradient-to-b from-transparent via-[#1A1A1A]/40 to-[#1A1A1A]"></div>
          {/* Ornamental gold accent */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/30"></div>
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/40"></div>
            <div className="w-2 h-2 rotate-45 border border-gold/30"></div>
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/40"></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/30"></div>
          </div>
        </div>

        {/* --- EXPRESS MASSAGE SECTION (Isolated Component) --- */}
        <ExpressSection
          expressMassages={expressMassages}
          onBookClick={onBookClick}
          loading={loading}
        />

        {/* ═══ SEPARATOR: Express → Packages ═══ */}
        <div className="-mx-6 md:-mx-12 relative">
          {/* Solid dark bridge + ornamental line */}
          <div className="h-16 md:h-20 bg-gradient-to-b from-[#1A1A1A] via-[#1c1814] to-[#1a1612] relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
              <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-gold/20"></div>
              <div className="w-1 h-1 rounded-full bg-gold/50"></div>
              <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-gold/20"></div>
            </div>
          </div>
        </div>

        {/* --- PACKAGES SECTION — Dark Luxury Redesign --- */}
        <div id="packages" className="relative -mx-6 md:-mx-12">
          {/* Dark background with subtle radial glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1612] via-[#1f1a14] to-[#1a1612]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(197,160,89,0.08)_0%,_transparent_70%)]"></div>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23C5A059\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

          <div className="relative z-10 px-6 md:px-12 py-20 md:py-28">
            {/* Golden divider line with shimmer */}
            <div className="flex items-center justify-center mb-16">
              <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-gold/40"></div>
              <div className="mx-6 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rotate-45 bg-gold/60"></div>
                <Crown size={20} className="text-gold" />
                <div className="w-1.5 h-1.5 rotate-45 bg-gold/60"></div>
              </div>
              <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-gold/40"></div>
            </div>

            {/* Section header */}
            <div className="flex flex-col mb-14 text-center">
              <span className="text-gold/80 text-xs uppercase tracking-[0.35em] font-bold mb-4 block">Exclusive Bundles</span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream-light tracking-tight">Luxury Packages</h2>
              <p className="text-cream-dark/60 mt-5 max-w-xl mx-auto text-base leading-relaxed font-light">Experience more for less. Our curated packages deliver a holistic journey of rebirth and relaxation.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20" role="status" aria-label="Loading packages">
                <Loader2 className="animate-spin text-gold" size={32} aria-hidden="true" />
                <span className="sr-only">Loading packages...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                {luxuryPackages.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    style={{ transitionDelay: `${index * 150}ms` }}
                    className="relative group rounded-2xl overflow-hidden reveal transition-all duration-500 hover:-translate-y-1"
                  >
                    {/* Card glow border effect */}
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-gold/30 via-gold/10 to-gold/30 opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>

                    {/* Card inner */}
                    <div className="relative bg-gradient-to-br from-[#2a2318] to-[#1e1a13] rounded-2xl p-7 md:p-8 flex flex-col justify-between min-h-[320px] backdrop-blur-sm">
                      {/* Top accent line */}
                      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>

                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-gold/60 text-[10px] uppercase font-bold tracking-[0.3em] mb-2 block flex items-center gap-1.5">
                              <span className="w-4 h-px bg-gold/40 inline-block"></span>
                              Value Bundle
                            </span>
                            <h3 className="font-serif text-2xl md:text-3xl text-cream-light group-hover:text-gold transition-colors duration-300">{pkg.title}</h3>
                          </div>
                          <div className="relative">
                            <div className="bg-gradient-to-br from-gold via-gold-light to-gold text-charcoal-dark px-5 py-2.5 rounded-xl font-black text-lg shadow-lg shadow-gold/20 group-hover:shadow-gold/40 transition-shadow">
                              ₱{pkg.price}
                            </div>
                          </div>
                        </div>
                        <p className="text-cream-dark/50 text-base italic mb-6 whitespace-pre-line leading-relaxed border-l-2 border-gold/20 pl-5 group-hover:border-gold/50 transition-colors font-light">
                          {pkg.description.toLowerCase().charAt(0).toUpperCase() + pkg.description.toLowerCase().slice(1)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5 group-hover:border-gold/20 transition-colors">
                        <span className="text-[10px] uppercase tracking-widest text-cream-dark/40 font-bold">{formatDuration(pkg.duration)} Total Duration</span>
                        <button
                          onClick={() => onBookClick(pkg.id)}
                          className="text-gold text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer btn-tactile"
                          aria-label={`Select ${pkg.title}`}
                        >
                          Select Package <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom golden divider */}
            <div className="flex items-center justify-center mt-16">
              <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-gold/30"></div>
              <div className="mx-4 w-1.5 h-1.5 rotate-45 bg-gold/40"></div>
              <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-gold/30"></div>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
});

export default Services;
