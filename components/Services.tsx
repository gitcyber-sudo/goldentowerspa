
import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Loader2, Star, Clock, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';

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

const ServiceCard: React.FC<{ service: ServiceItem, onBook: (id: string) => void, isSignature?: boolean }> = ({ service, onBook, isSignature }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative group bg-white rounded-3xl p-6 shadow-xl border border-gold/10 transition-shadow hover:shadow-2xl cursor-pointer ${isSignature ? 'ring-2 ring-gold/20' : ''}`}
    >
      <div style={{ transform: "translateZ(50px)" }} className="relative h-64 w-full overflow-hidden rounded-2xl mb-6">
        <img
          src={service.image_url}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full flex items-center gap-2">
          <Clock size={12} className="text-gold" />
          <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest">{service.duration}</span>
        </div>
      </div>

      <div style={{ transform: "translateZ(30px)" }}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-luxury text-2xl text-charcoal group-hover:text-gold transition-colors">{service.title}</h3>
          {isSignature && <Star size={18} className="text-gold fill-gold" />}
        </div>

        <p className="text-charcoal/60 text-sm font-light mb-8 line-clamp-3 italic leading-relaxed">
          {service.description}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-gold/5">
          <span className="text-luxury text-xl text-gold font-bold">P{service.price}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onBook(service.id); }}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal hover:text-gold transition-colors overflow-hidden group/btn"
          >
            Reserve Ritual
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Services: React.FC<ServicesProps> = ({ onBookClick }) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'signature' | 'packages'>('all');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('title', { ascending: true });

        if (error) throw error;
        if (data) setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const signatureItems = services.filter(s => s.category === 'signature' || s.title.toLowerCase().includes('signature'));
  const packageItems = services.filter(s => s.title.toUpperCase().includes('PACKAGE'));
  const regularItems = services.filter(s => !signatureItems.includes(s) && !packageItems.includes(s));

  const filteredServices = () => {
    if (activeTab === 'signature') return signatureItems;
    if (activeTab === 'packages') return packageItems;
    return [...signatureItems, ...regularItems];
  };

  return (
    <section id="services" className="py-32 bg-cream/50 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center mb-20 text-center">
          <span className="text-gold text-[10px] uppercase tracking-[0.6em] font-bold mb-4">Curated Experiences</span>
          <h2 className="text-luxury text-5xl md:text-7xl text-charcoal mb-8">Therapeutic <span className="italic font-light">Rituals</span></h2>

          <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-full border border-gold/10 shadow-inner">
            {['all', 'signature', 'packages'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-2 rounded-full text-[10px] uppercase tracking-widest font-black transition-all ${activeTab === tab ? 'bg-gold text-white shadow-lg' : 'text-charcoal/40 hover:text-gold'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-gold" size={48} />
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
          >
            <AnimatePresence mode='popLayout'>
              {filteredServices().map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBook={onBookClick}
                  isSignature={service.category === 'signature' || service.title.toLowerCase().includes('signature')}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Decorative Ornaments */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
};

export default Services;
