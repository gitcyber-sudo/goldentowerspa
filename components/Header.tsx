
import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onBookClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBookClick }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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

  const handleSignOut = async () => {
    await signOut();
    setProfileMenuOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'therapist') return '/therapist';
    return '/dashboard';
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
        ? 'bg-cream/80 backdrop-blur-lg py-2 border-b border-gold/20 shadow-sm'
        : 'bg-transparent py-6 border-b border-transparent'
        }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand */}
        <a href="/" className="group flex items-center gap-3 outline-none">
          <Logo
            className={`transition-all duration-300 ease-out ${isScrolled
              ? 'h-9 md:h-10 w-auto'
              : 'h-12 md:h-14 w-auto'
              }`}
            color="#997B3D"
          />
          <div className="flex flex-col justify-center">
            <h1 className={`font-serif font-bold tracking-tight leading-none transition-colors duration-300 text-gold ${isScrolled ? 'text-lg md:text-xl' : 'text-xl md:text-3xl'
              }`}>
              Golden Tower
            </h1>
            <span className={`text-gold uppercase tracking-[0.25em] leading-none mt-1 transition-all duration-300 ${isScrolled ? 'text-[0.55rem] md:text-[0.6rem]' : 'text-[0.65rem] md:text-xs'
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
              className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all hover:text-gold ${isScrolled ? 'text-charcoal/80' : 'text-charcoal'
                }`}
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={onBookClick}
            className="bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 transform hover:scale-105 shadow-lg border border-white/20 hover:shadow-gold/30"
          >
            Book Now
          </button>

          {/* User Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 hover:bg-gold/20 transition-all border border-gold/20"
              >
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <User size={16} className="text-gold" />
                </div>
                <span className="text-xs font-medium text-charcoal max-w-[100px] truncate">
                  {profile?.full_name || user.email}
                </span>
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gold/10 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gold/10">
                      <p className="text-xs text-charcoal/60 uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm font-medium text-charcoal truncate">{user.email}</p>
                      {profile?.role && profile.role !== 'user' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-full uppercase tracking-wider">
                          {profile.role}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        navigate(getDashboardLink());
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gold/5 transition-colors flex items-center gap-3 text-charcoal"
                    >
                      <Calendar size={16} className="text-gold" />
                      <span className="text-sm">My Dashboard</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 hover:bg-rose-50 transition-colors flex items-center gap-3 text-rose-600 border-t border-gold/10"
                    >
                      <LogOut size={16} />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}
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
        className={`md:hidden absolute top-full left-0 w-full bg-cream/98 backdrop-blur-2xl border-t border-gold/10 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) overflow-hidden ${mobileMenuOpen ? 'max-h-screen opacity-100 shadow-2xl' : 'max-h-0 opacity-0'
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
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onBookClick();
            }}
            className="bg-gold text-white px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest shadow-xl w-3/4 max-w-xs transition-transform active:scale-95"
          >
            Book Appointment
          </button>

          {/* Mobile User Menu */}
          {user && (
            <>
              <div className="w-3/4 max-w-xs border-t border-gold/20 pt-6">
                <p className="text-xs text-charcoal/60 uppercase tracking-widest text-center mb-3">
                  {profile?.full_name || user.email}
                </p>
                <button
                  onClick={() => {
                    navigate(getDashboardLink());
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-white text-charcoal border border-gold/20 px-6 py-3 rounded-full text-sm font-bold mb-2"
                >
                  My Dashboard
                </button>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-rose-600 px-6 py-3 rounded-full text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
