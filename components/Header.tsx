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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
        isScrolled
          ? 'bg-cream/80 backdrop-blur-md py-3 border-gold/20 shadow-sm'
          : 'bg-transparent py-6 border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand */}
        <a href="#" className="group flex items-center gap-3">
          <Logo 
            className={`h-10 w-10 transition-colors duration-300 ${isScrolled ? 'text-gold-dark' : 'text-charcoal'}`} 
            color={isScrolled ? '#997B3D' : '#1A1A1A'} 
          />
          <div className="flex flex-col">
            <h1 className={`font-serif text-xl md:text-2xl font-bold tracking-tight leading-none transition-colors duration-300 ${isScrolled ? 'text-charcoal' : 'text-charcoal'}`}>
              Golden Tower
            </h1>
            <span className="text-gold-dark text-xs uppercase tracking-[0.2em] leading-none mt-1">Spa & Wellness</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm uppercase tracking-widest font-medium transition-colors hover:text-gold ${
                isScrolled ? 'text-charcoal/80' : 'text-charcoal'
              }`}
            >
              {link.name}
            </a>
          ))}
          <button className="bg-gold hover:bg-gold-dark text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/20">
            Book Now
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-charcoal focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-cream/95 backdrop-blur-xl border-t border-gold/10 transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-96 opacity-100 shadow-xl' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center py-8 space-y-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-charcoal text-lg font-serif hover:text-gold transition-colors"
            >
              {link.name}
            </a>
          ))}
          <button className="bg-gold text-white px-8 py-3 rounded-full text-base font-medium shadow-md">
            Book Now
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;