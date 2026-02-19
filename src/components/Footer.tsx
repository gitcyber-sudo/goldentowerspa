import React, { useState } from 'react';
import { Facebook, MapPin, Mail, Smartphone, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FeaturesModal from './modals/FeaturesModal';

const Footer: React.FC = () => {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (id: string) => {
    if (location.pathname === '/' || location.pathname === '/index.html') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

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
                <a href="https://www.facebook.com/profile.php?id=100063262268519" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all duration-300" aria-label="Follow us on Facebook">
                  <Facebook size={20} />
                </a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=Golden+Tower+Spa+Project+6+Quezon+City" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all duration-300" aria-label="Find us on Maps">
                  <MapPin size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Quick Links</h3>
              <ul className="space-y-3 font-light text-white/60 text-sm">
                <li><button onClick={() => handleScroll('services')} className="hover:text-gold transition-colors text-left w-full">Services</button></li>
                <li><button onClick={() => handleScroll('specialists')} className="hover:text-gold transition-colors text-left w-full">Our Team</button></li>
                <li><button onClick={() => handleScroll('sanctuary')} className="hover:text-gold transition-colors text-left w-full">Locations</button></li>
                <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="md:col-span-3 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Contact</h3>
              <ul className="space-y-4 font-light text-white/60 text-sm">
                <li className="flex items-center gap-3">
                  <Smartphone size={16} className="text-gold" />
                  <span>+63 922 826 2336</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-gold" />
                  <span>valdezjohnpaul15.jv@gmail.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-gold flex-shrink-0 mt-0.5" />
                  <span>Golden Tower, Quezon City, Philippines</span>
                </li>
              </ul>
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
                    Website Features
                  </button>

                  <span className="w-px h-3 bg-white/10" aria-hidden="true" />

                  <a
                    href="mailto:valdezjohnpaul15.jv@gmail.com?subject=Project%20Inquiry%20-%20Golden%20Tower%20Spa%20Platform&body=Hello%20John%20Paul%2C%0A%0AI%20am%20interested%20in%20discussing%20a%20potential%20project%20related%20to%20the%20Golden%20Tower%20Spa%20digital%20platform.%0A%0AI%20specifically%20liked%20the%20website%20features%20mentioned%20in%20your%20highlights.%0A%0ALooking%20forward%20to%20hearing%20from%20you.%0A%0ABest%20regards%2C%0A%5BYour%20Name%5D"
                    className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-gold transition-colors flex items-center gap-1.5"
                  >
                    <Mail size={12} className="text-gold/40" />
                    Inquire
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