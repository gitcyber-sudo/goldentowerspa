import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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
          ? 'bg-white/80 backdrop-blur-md py-4 border-gray-200 shadow-sm'
          : 'bg-transparent py-6 border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand */}
        <a href="#" className="group relative">
          <div className="flex flex-col items-center md:items-start">
             {/* Eiffel Tower Icon representation - using SVG */}
            <h1 className={`font-serif text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-300 ${isScrolled ? 'text-charcoal' : 'text-charcoal md:text-charcoal'}`}>
              Golden Tower <span className="text-gold font-normal italic">Spa</span>
            </h1>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm uppercase tracking-widest font-medium transition-colors hover:text-gold ${
                isScrolled ? 'text-charcoal' : 'text-charcoal'
              }`}
            >
              {link.name}
            </a>
          ))}
          <button className="bg-gold hover:bg-gold-dark text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
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
        className={`md:hidden absolute top-full left-0 w-full bg-cream/95 backdrop-blur-xl border-t border-gray-200 transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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
          <button className="bg-gold text-white px-8 py-3 rounded-full text-base font-medium">
            Book Now
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;