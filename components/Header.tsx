
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Philosophy', href: '#philosophy' },
    { name: 'Services', href: '#services' },
    { name: 'Location', href: '#footer' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-cream/80 backdrop-blur-lg py-2 border-b border-gold/20 shadow-sm'
          : 'bg-transparent py-6 border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand */}
        <a href="#" className="group flex items-center gap-3 outline-none">
          <Logo 
            className={`transition-all duration-300 ease-out ${
              isScrolled 
                ? 'h-9 md:h-10 w-auto text-gold-dark' 
                : 'h-12 md:h-14 w-auto text-charcoal'
            }`} 
            color={isScrolled ? '#997B3D' : '#1A1A1A'} 
          />
          <div className="flex flex-col justify-center">
            <h1 className={`font-serif font-bold tracking-tight leading-none transition-colors duration-300 ${
              isScrolled ? 'text-lg md:text-xl text-charcoal' : 'text-xl md:text-3xl text-charcoal'
            }`}>
              Golden Tower
            </h1>
            <span className={`text-gold-dark uppercase tracking-[0.25em] leading-none mt-1 transition-all duration-300 ${
              isScrolled ? 'text-[0.55rem] md:text-[0.6rem]' : 'text-[0.65rem] md:text-xs'
            }`}>
              Spa & Wellness
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all hover:text-gold ${
                isScrolled ? 'text-charcoal/80' : 'text-charcoal'
              }`}
            >
              {link.name}
            </a>
          ))}
          <button className="bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 transform hover:scale-105 shadow-lg border border-white/20 hover:shadow-gold/30">
            Book Now
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-charcoal focus:outline-none p-2 transition-transform active:scale-90"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-cream/98 backdrop-blur-2xl border-t border-gold/10 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) overflow-hidden ${
          mobileMenuOpen ? 'max-h-screen opacity-100 shadow-2xl' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center py-20 space-y-10 min-h-[60vh]">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-charcoal text-3xl font-serif italic hover:text-gold transition-all"
            >
              {link.name}
            </a>
          ))}
          <button className="bg-gold text-white px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest shadow-xl w-3/4 max-w-xs transition-transform active:scale-95">
            Book Appointment
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
