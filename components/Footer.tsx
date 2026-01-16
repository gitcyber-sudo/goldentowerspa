import React from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-charcoal text-cream pt-24 pb-12">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/10 pb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl text-white">
              Golden Tower <span className="text-gold italic">Spa</span>
            </h2>
            <p className="text-white/60 font-light max-w-sm">
              An oasis of calm where French elegance meets Filipino hospitality. 
              Reconnect with your inner self in Mansalay.
            </p>
            <div className="flex space-x-4 pt-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all duration-300 group">
                <Instagram size={18} className="text-white group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all duration-300 group">
                <Facebook size={18} className="text-white group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all duration-300 group">
                <Twitter size={18} className="text-white group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-2 md:col-start-6">
            <h3 className="text-gold text-sm uppercase tracking-widest font-bold mb-6">Explore</h3>
            <ul className="space-y-4 font-light text-white/80">
              <li><a href="#philosophy" className="hover:text-gold transition-colors">Philosophy</a></li>
              <li><a href="#services" className="hover:text-gold transition-colors">Treatments</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Gift Cards</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Membership</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4 md:col-start-9">
             <h3 className="text-gold text-sm uppercase tracking-widest font-bold mb-6">Visit Us</h3>
             <ul className="space-y-6 font-light text-white/80">
               <li className="flex items-start">
                 <MapPin className="mr-4 text-gold mt-1 flex-shrink-0" size={18} />
                 <span>Mansalay, Oriental Mindoro,<br/>Philippines 5213</span>
               </li>
               <li className="flex items-center">
                 <Phone className="mr-4 text-gold flex-shrink-0" size={18} />
                 <span>+63 912 345 6789</span>
               </li>
               <li className="flex items-center">
                 <Mail className="mr-4 text-gold flex-shrink-0" size={18} />
                 <span>concierge@goldentowerspa.ph</span>
               </li>
             </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 uppercase tracking-wider font-medium">
          <p>&copy; {new Date().getFullYear()} Golden Tower Spa. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;