
import React from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer" className="bg-charcoal text-cream pt-32 pb-16 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24 mb-24">

          {/* Brand Column */}
          <div className="md:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-luxury text-4xl md:text-5xl text-white mb-6">
                Golden Tower <span className="italic font-light">Spa</span>
              </h2>
              <div className="w-16 h-[1px] bg-gold mb-8" />
              <p className="text-white/50 font-light leading-relaxed max-w-sm italic">
                "Where French elegance meets the soul of Filipino hospitality. A sanctuary dedicated to the art of rebirth."
              </p>
            </motion.div>

            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(197, 160, 89, 1)" }}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center transition-colors group"
                >
                  <Icon size={18} className="text-white group-hover:text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h3 className="text-gold text-[10px] uppercase tracking-[0.6em] font-bold mb-10">Sanctuary</h3>
            <ul className="space-y-6">
              {[
                { label: "Philosophy", href: "#philosophy" },
                { label: "Rituals", href: "#services" },
                { label: "Our Experts", href: "#specialists" },
                { label: "The Gallery", href: "#visual-journey" }
              ].map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-white/60 hover:text-gold text-sm tracking-widest transition-colors flex items-center group">
                    {link.label}
                    <ArrowUpRight size={12} className="ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4">
            <h3 className="text-gold text-[10px] uppercase tracking-[0.6em] font-bold mb-10">The Concierge</h3>
            <div className="space-y-10">
              <div className="flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                  <MapPin className="text-gold" size={18} />
                </div>
                <p className="text-white/60 text-sm font-light leading-relaxed group-hover:text-white transition-colors">
                  Mansalay, Oriental Mindoro,<br />Philippines 5213
                </p>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                  <Phone className="text-gold" size={18} />
                </div>
                <p className="text-white/60 text-sm font-light group-hover:text-white transition-colors">+63 912 345 6789</p>
              </div>
              <div className="flex items-center gap-6 group cursor-pointer" onClick={() => window.location.href = 'mailto:concierge@goldentowerspa.ph'}>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                  <Mail className="text-gold" size={18} />
                </div>
                <p className="text-white/60 text-sm font-light group-hover:text-white transition-colors">concierge@goldentowerspa.ph</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">
            &copy; {new Date().getFullYear()} Golden Tower Spa &middot; All Rights Reserved
          </p>

          <div className="flex items-center gap-8">
            <Link to="/admin" className="text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-gold transition-colors font-bold">Admin Portal</Link>
            <button
              onClick={scrollToTop}
              className="w-12 h-12 bg-gold/10 hover:bg-gold text-gold hover:text-white transition-all rounded-full flex items-center justify-center"
            >
              <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] -translate-x-1/4 translate-y-1/4 pointer-events-none" />
    </footer>
  );
};

export default Footer;
