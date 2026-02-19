import React, { useState } from 'react';
import { Facebook, MapPin, Mail, Smartphone, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeaturesModal from './modals/FeaturesModal';

const Footer: React.FC = () => {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  return (
    <footer id="footer" role="contentinfo" className="bg-charcoal text-cream relative overflow-hidden">
      {/* Gold accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden="true" />

      <div className="pt-16 md:pt-24 pb-24 md:pb-12">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 border-b border-white/10 pb-12 md:pb-16">

            <div className="md:col-span-4 space-y-5 md:space-y-6">
              <h2 className="font-serif text-2xl md:text-4xl text-white">
                Golden Tower <span className="text-gold italic">Spa</span>
              </h2>
              <p className="text-white/60 font-light max-w-sm text-sm md:text-base leading-relaxed">
                Experience the pinnacle of relaxation and wellness. Your journey to tranquility starts here at our sanctuary of peace.
              </p>
              <div className="flex space-x-5">
                <a href="#" className="p-2.5 rounded-full border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all duration-300" aria-label="Follow us on Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="p-2.5 rounded-full border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all duration-300" aria-label="Find us on Maps">
                  <MapPin size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Quick Links</h3>
              <ul className="space-y-3 font-light text-white/60 text-sm">
                <li><Link to="/services" className="hover:text-gold transition-colors">Services</Link></li>
                <li><Link to="/therapists" className="hover:text-gold transition-colors">Our Team</Link></li>
                <li><Link to="/locations" className="hover:text-gold transition-colors">Locations</Link></li>
                <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="md:col-span-3 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Contact</h3>
              <ul className="space-y-4 font-light text-white/60 text-sm">
                <li className="flex items-center gap-3">
                  <Smartphone size={16} className="text-gold" />
                  <span>+63 945 123 4567</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-gold" />
                  <span>connect@goldentower.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-gold flex-shrink-0 mt-0.5" />
                  <span>Cebu Business Park, Cebu City, Philippines</span>
                </li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="md:col-span-3 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Newsletter</h3>
              <p className="text-white/40 text-xs font-light leading-relaxed">
                Subscribe to receive special offers and updates on new wellness programs.
              </p>
              <form className="relative group" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 px-6 text-sm focus:outline-none focus:border-gold/50 transition-all duration-300 pr-12"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-gold hover:bg-gold-light text-black rounded-full transition-all duration-300 flex items-center justify-center p-2"
                  aria-label="Subscribe"
                >
                  <ArrowUpRight size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar: Professional Credits & Legal */}
          <div className="pt-8 md:pt-10 flex flex-col items-center gap-10">

            {/* Humble Developer Signature */}
            <div className="w-full max-w-lg mt-4">
              <div className="text-center space-y-4 px-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold block">Website by</span>
                  <h4 className="font-serif italic text-xl md:text-2xl text-gold/80 tracking-wide">John Paul Valdez</h4>
                  <p className="text-[11px] text-white/30 font-light max-w-xs mx-auto">
                    Need a website? Let's build your business together.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 pt-1">
                  <button
                    onClick={() => setIsFeaturesOpen(true)}
                    className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-gold transition-colors flex items-center gap-1.5 group/btn"
                  >
                    <Sparkles size={12} className="text-gold/40 group-hover/btn:text-gold transition-transform duration-500" />
                    Technical Features
                  </button>

                  <span className="w-px h-3 bg-white/10" aria-hidden="true" />

                  <a
                    href="mailto:valdezjohnpaul15.jv@gmail.com"
                    className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-gold transition-colors flex items-center gap-1.5"
                  >
                    <Mail size={12} className="text-gold/40" />
                    Work with Me
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright & Links */}
            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 border-t border-white/5 pt-8">
              <p>&copy; {new Date().getFullYear()} Golden Tower Spa. All rights reserved.</p>

              <div className="flex items-center gap-8">
                <Link to="/privacy-policy" className="hover:text-gold transition-colors flex items-center gap-1.5 group">
                  Privacy Policy <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <Link to="/terms-of-service" className="hover:text-gold transition-colors flex items-center gap-1.5 group">
                  Terms of Service <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase Modal */}
      <FeaturesModal
        isOpen={isFeaturesOpen}
        onClose={() => setIsFeaturesOpen(false)}
      />

      {/* Decorative background glow */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" aria-hidden="true" />
    </footer>
  );
};

export default Footer;