
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
        <nav className="hidden md:flex items-center space-x-6">
          {!user ? (
            <button
              onClick={onBookClick}
              className="bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 transform hover:scale-105 shadow-lg border border-white/20 hover:shadow-gold/30"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(getDashboardLink())}
                className="bg-charcoal hover:bg-gold text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 shadow-md border border-gold/10"
              >
                Dashboard
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-gold/10 hover:bg-gold/20 transition-all border border-gold/20"
                  title={profile?.full_name || user.email}
                >
                  <User size={20} className="text-gold" />
                </button>

                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gold/10 py-3 z-50 overflow-hidden animate-fade-in">
                      <div className="px-5 py-3 border-b border-gold/5 bg-cream/30">
                        <p className="text-[10px] text-gold uppercase font-bold tracking-[0.2em] mb-1">Authenticated</p>
                        <p className="text-sm font-bold text-charcoal truncate">{profile?.full_name || 'Valued Guest'}</p>
                        <p className="text-[10px] text-charcoal/40 truncate mt-0.5">{user.email}</p>
                      </div>

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-5 py-4 hover:bg-rose-50 transition-all flex items-center gap-3 text-rose-600 font-bold text-xs uppercase tracking-widest"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Action Button */}
        <div className="md:hidden flex items-center gap-3">
          {!user ? (
            <button
              onClick={onBookClick}
              className="bg-gold text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg"
            >
              Login
            </button>
          ) : (
            <button
              onClick={() => navigate(getDashboardLink())}
              className="bg-charcoal text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg"
            >
              Dashboard
            </button>
          )}

          <button
            className="text-charcoal focus:outline-none p-1.5 transition-transform active:scale-90 bg-gold/5 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-cream/98 backdrop-blur-2xl border-t border-gold/10 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) overflow-hidden ${mobileMenuOpen ? 'max-h-screen opacity-100 shadow-2xl' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="flex flex-col items-center py-16 space-y-8 min-h-[40vh]">
          <a href="/" onClick={() => setMobileMenuOpen(false)} className="text-charcoal text-2xl font-serif italic">Home</a>
          <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-charcoal text-2xl font-serif italic">Rituals</a>
          <a href="#specialists" onClick={() => setMobileMenuOpen(false)} className="text-charcoal text-2xl font-serif italic">Specialists</a>
          <a href="#footer" onClick={() => setMobileMenuOpen(false)} className="text-charcoal text-2xl font-serif italic">Location</a>

          {user && (
            <button
              onClick={() => {
                handleSignOut();
                setMobileMenuOpen(false);
              }}
              className="mt-8 text-rose-600 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2"
            >
              <LogOut size={16} /> Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
