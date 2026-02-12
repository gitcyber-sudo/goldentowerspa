
import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
        ? 'glass py-3 shadow-md'
        : 'bg-transparent py-6 border-b border-transparent'
        }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand */}
        <a href="/" className="group flex items-center gap-3 outline-none">
          <Logo
            className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isScrolled
              ? 'h-8 md:h-10 w-auto'
              : 'h-12 md:h-16 w-auto'
              }`}
            color="#C5A059"
          />
          <div className="flex flex-col justify-center">
            <h1 className={`font-serif font-bold tracking-tight leading-none transition-all duration-700 text-gold ${isScrolled ? 'text-lg md:text-xl' : 'text-xl md:text-3xl'
              }`}>
              Golden Tower
            </h1>
            <span className={`text-gold uppercase tracking-[0.3em] leading-none mt-1 transition-all duration-700 ${isScrolled ? 'text-[0.5rem] md:text-[0.55rem]' : 'text-[0.6rem] md:text-xs'
              }`}>
              Spa & Wellness
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-12">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-[10px] uppercase tracking-[0.25em] font-bold transition-all hover:text-gold relative group ${isScrolled ? 'text-charcoal/80' : 'text-charcoal'
                }`}
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <button
            onClick={onBookClick}
            className="btn-gold text-[10px] uppercase tracking-[0.2em] px-8 py-3"
          >
            Book Now
          </button>

          {/* User Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 hover:border-gold/50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <User size={14} className="text-gold" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal/70">
                  Profile
                </span>
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-64 glass rounded-2xl shadow-2xl border border-gold/10 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-gold/5 bg-gold/5">
                        <p className="text-[9px] text-gold uppercase tracking-[0.2em] font-bold mb-1">Authenticated</p>
                        <p className="text-sm font-serif italic text-charcoal truncate">{user.email}</p>
                        {profile?.role && profile.role !== 'user' && (
                          <span className="inline-block mt-2 px-3 py-0.5 bg-gold text-white text-[9px] rounded-full uppercase tracking-widest font-bold">
                            {profile.role}
                          </span>
                        )}
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            navigate(getDashboardLink());
                            setProfileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gold/5 rounded-xl transition-colors flex items-center gap-3 text-charcoal group"
                        >
                          <Calendar size={16} className="text-gold transition-transform group-hover:scale-110" />
                          <span className="text-xs font-medium uppercase tracking-wide">My Dashboard</span>
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-3 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-3 text-rose-600 border-t border-gold/5 group mt-1"
                        >
                          <LogOut size={16} className="transition-transform group-hover:translate-x-0.5" />
                          <span className="text-xs font-medium uppercase tracking-wide">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : null}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gold focus:outline-none p-2 transition-transform active:scale-90"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden absolute top-0 left-0 w-full bg-cream z-50 overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center px-6 py-6 border-b border-gold/10">
              <Logo className="h-10 w-auto" color="#C5A059" />
              <button onClick={() => setMobileMenuOpen(false)} className="text-gold p-2">
                <X size={32} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
              <nav className="flex flex-col items-center space-y-8">
                {navLinks.map((link, i) => (
                  <motion.a
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-4xl font-serif italic text-charcoal overflow-hidden group py-2"
                  >
                    <span className="relative inline-block transition-transform duration-300 group-hover:translate-x-2">
                      {link.name}
                    </span>
                  </motion.a>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="w-full flex flex-col items-center space-y-6 pt-12 border-t border-gold/10"
              >
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onBookClick();
                  }}
                  className="btn-gold w-full max-w-sm text-sm"
                >
                  Book Appointment
                </button>

                {user ? (
                  <div className="w-full flex flex-col items-center space-y-4">
                    <button
                      onClick={() => {
                        navigate(getDashboardLink());
                        setMobileMenuOpen(false);
                      }}
                      className="text-charcoal font-bold uppercase tracking-widest text-xs"
                    >
                      My Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-rose-500 font-bold uppercase tracking-widest text-xs"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] uppercase tracking-widest text-gold/60 font-medium">
                    Golden Tower Experience
                  </p>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
