import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ServiceItem {
  title: string;
  description: string;
  image: string;
  duration: string;
  price?: string;
}

const services: ServiceItem[] = [
  {
    title: "Traditional Hilot Massage",
    description: "An ancient Filipino healing art that uses banana leaves and virgin coconut oil to detect ailments and restore balance to the body's energy.",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2787&auto=format&fit=crop",
    duration: "90 min"
  },
  {
    title: "Golden Glow Facial",
    description: "Our signature facial using 24k gold-infused serums to boost collagen, reduce inflammation, and leave your skin with a radiant, youthful shimmer.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop",
    duration: "60 min"
  },
  {
    title: "Tower Ritual Foot Spa",
    description: "A grounding ritual beginning with a warm soak in minerals and essential oils, followed by a reflexology massage to release tension from the soles up.",
    image: "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=2070&auto=format&fit=crop",
    duration: "45 min"
  }
];

const Services: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 fade-up">
            <div>
                <span className="text-gold text-sm uppercase tracking-widest font-bold mb-2 block">Curated Menu</span>
                <h2 className="font-serif text-4xl md:text-5xl text-charcoal">Signature Treatments</h2>
            </div>
            <a href="#" className="hidden md:flex items-center text-charcoal hover:text-gold transition-colors mt-4 md:mt-0 group">
                <span className="uppercase tracking-widest text-sm mr-2">View Full Menu</span>
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-container">
          {services.map((service, index) => (
            <div key={index} className="stagger-item group cursor-pointer">
              <div className="relative h-[400px] w-full overflow-hidden mb-6">
                <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/0 transition-all duration-500 z-10" />
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-wider z-20">
                    {service.duration}
                </div>
              </div>
              
              <h3 className="font-serif text-2xl text-charcoal mb-3 group-hover:text-gold transition-colors">
                {service.title}
              </h3>
              <p className="text-charcoal-light font-light leading-relaxed mb-4 text-sm md:text-base border-l-2 border-transparent group-hover:border-gold pl-0 group-hover:pl-4 transition-all duration-300">
                {service.description}
              </p>
              <span className="inline-flex items-center text-xs uppercase tracking-widest font-medium text-gold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Book Treatment <ArrowRight size={12} className="ml-2" />
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
            <button className="text-charcoal border border-charcoal/20 px-8 py-3 uppercase text-sm tracking-widest hover:bg-charcoal hover:text-white transition-colors">
                View Full Menu
            </button>
        </div>
      </div>
    </section>
  );
};

export default Services;