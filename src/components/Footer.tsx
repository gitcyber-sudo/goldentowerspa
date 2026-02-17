import React from 'react';
import { Facebook, MapPin, Mail, Smartphone, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer id="footer" role="contentinfo" className="bg-charcoal text-cream relative overflow-hidden">
      {/* Gold accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden="true" />

      <div className="pt-16 md:pt-24 pb-24 md:pb-12">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 border-b border-white/10 pb-12 md:pb-16">

            {/* Brand Column */}
            <div className="md:col-span-4 space-y-5 md:space-y-6">
              <h2 className="font-serif text-2xl md:text-4xl text-white">
                Golden Tower <span className="text-gold italic">Spa</span>
              </h2>
              <p className="text-white/60 font-light max-w-sm text-sm md:text-base leading-relaxed">
                An oasis of calm where French elegance meets Filipino hospitality.
                Reconnect with your inner self in Quezon City.
              </p>
              <div className="flex space-x-4 pt-2 md:pt-4">
                <a
                  href="https://www.facebook.com/profile.php?id=100063262268519"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all duration-300 group"
                  aria-label="Follow Golden Tower Spa on Facebook"
                >
                  <Facebook size={18} className="text-white group-hover:text-white" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Navigation Column */}
            <div className="md:col-span-2 md:col-start-6">
              <h3 className="text-gold text-sm uppercase tracking-widest font-bold mb-4 md:mb-6">Explore</h3>
              <ul className="space-y-3 md:space-y-4 font-light text-white/80">
                <li><a href="#sanctuary" className="hover:text-gold transition-colors">Sanctuary</a></li>
                <li><a href="#services" className="hover:text-gold transition-colors">Treatments</a></li>
                <li>
                  <span className="text-white/40 flex items-center gap-2">
                    Gift Cards
                    <span className="text-[8px] bg-gold/20 text-gold px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Coming Soon</span>
                  </span>
                </li>
                <li>
                  <span className="text-white/40 flex items-center gap-2">
                    Membership
                    <span className="text-[8px] bg-gold/20 text-gold px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Coming Soon</span>
                  </span>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="md:col-span-4 md:col-start-9">
              <h3 className="text-gold text-sm uppercase tracking-widest font-bold mb-4 md:mb-6">Visit Us</h3>
              <address className="not-italic">
                <ul className="space-y-4 md:space-y-6 font-light text-white/80">
                  <li className="flex items-start">
                    <MapPin className="mr-3 md:mr-4 text-gold mt-1 flex-shrink-0" size={18} aria-hidden="true" />
                    <span className="text-sm md:text-base">#1 C2 Road 9, Project 6,<br />Quezon City, Philippines</span>
                  </li>
                  <li>
                    <a href="tel:09228262336" className="flex items-center hover:text-gold transition-colors">
                      <Smartphone className="mr-3 md:mr-4 text-gold flex-shrink-0" size={18} aria-hidden="true" />
                      <span className="text-sm md:text-base">0922 826 2336</span>
                    </a>
                  </li>
                  <li>
                    <a href="mailto:gtowerspa@gmail.com" className="flex items-center hover:text-gold transition-colors">
                      <Mail className="mr-3 md:mr-4 text-gold flex-shrink-0" size={18} aria-hidden="true" />
                      <span className="text-sm md:text-base">gtowerspa@gmail.com</span>
                    </a>
                  </li>
                </ul>
              </address>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40 uppercase tracking-wider font-medium">
            <p>&copy; {new Date().getFullYear()} Golden Tower Spa. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="hover:text-gold transition-colors flex items-center gap-1">
                Privacy Policy <ArrowUpRight size={10} aria-hidden="true" />
              </Link>
              <Link to="/terms-of-service" className="hover:text-gold transition-colors flex items-center gap-1">
                Terms of Service <ArrowUpRight size={10} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background glow */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" aria-hidden="true" />
    </footer>
  );
};

export default Footer;