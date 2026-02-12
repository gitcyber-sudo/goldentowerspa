

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, User, Loader2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: { full_name: formData.fullName }
                    }
                });
                if (signUpError) throw signUpError;
                alert('Account created! Please check your email to confirm, then sign in.');
                setIsSignUp(false);
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });
                if (signInError) throw signInError;
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            if (err.message === "Invalid login credentials") {
                setError("Incorrect email or password. Please try again.");
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: { redirectTo: window.location.origin }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(`${provider} sign-in failed`);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        },
        exit: { opacity: 0, scale: 0.95, y: 20 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-charcoal/40 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative bg-cream w-full max-w-4xl min-h-full md:min-h-[600px] md:h-auto md:max-h-[85vh] md:rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20 flex flex-col md:flex-row"
                    >
                        {/* Interactive Decor Side */}
                        <div className="hidden md:flex w-5/12 bg-charcoal p-12 flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Sparkles className="text-gold mb-8" size={32} />
                                    <h2 className="text-luxury text-4xl text-white italic mb-6 leading-tight">
                                        The Doorway to <span className="block not-italic font-bold text-gold">Serenity</span>
                                    </h2>
                                    <p className="text-white/50 text-sm leading-relaxed font-light italic">
                                        Your sacred space for healing and rebirth. Enter the sanctuary to manage your journey.
                                    </p>
                                </motion.div>
                            </div>

                            <motion.div
                                className="relative z-10 space-y-4 pt-12"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="flex items-center gap-3 text-white/40">
                                    <ShieldCheck size={16} className="text-gold/50" />
                                    <span className="text-[10px] uppercase tracking-widest font-medium">Secured by Gold Standard</span>
                                </div>
                            </motion.div>

                            {/* Animated Background Elements */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.1, 0.15, 0.1]
                                }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-12 -right-12 w-64 h-64 bg-gold rounded-full blur-[80px]"
                            />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
                        </div>

                        {/* Form Side */}
                        <div className="flex-1 flex flex-col bg-cream p-8 md:p-16 relative overflow-y-auto">
                            <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-gold/5 rounded-full transition-colors text-charcoal/40 hover:text-charcoal md:block">
                                <X size={20} />
                            </button>

                            <div className="max-w-sm mx-auto w-full flex-1 flex flex-col justify-center">
                                <div className="text-center mb-10">
                                    <h3 className="text-luxury text-3xl text-charcoal mb-2">
                                        {isSignUp ? 'Join the Circle' : 'Welcome Back'}
                                    </h3>
                                    <div className="h-0.5 w-12 bg-gold/30 mx-auto" />
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isSignUp ? 'signup' : 'signin'}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            {isSignUp && (
                                                <div className="group relative">
                                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gold group-focus-within:scale-110 transition-transform" size={18} />
                                                    <input
                                                        type="text"
                                                        placeholder="Name of the Soul"
                                                        required
                                                        className="w-full bg-white border border-gold/10 pl-14 pr-6 py-4 rounded-2xl outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm shadow-sm"
                                                        value={formData.fullName}
                                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            <div className="group relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gold group-focus-within:scale-110 transition-transform" size={18} />
                                                <input
                                                    type="email"
                                                    placeholder="Digital Address"
                                                    required
                                                    className="w-full bg-white border border-gold/10 pl-14 pr-6 py-4 rounded-2xl outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm shadow-sm"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>

                                            <div className="group relative">
                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gold group-focus-within:scale-110 transition-transform" size={18} />
                                                <input
                                                    type="password"
                                                    placeholder="Secret Key"
                                                    required
                                                    minLength={6}
                                                    className="w-full bg-white border border-gold/10 pl-14 pr-6 py-4 rounded-2xl outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm shadow-sm"
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-rose-50 text-rose-600 text-[10px] p-4 rounded-xl border border-rose-100 italic"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full btn-gold py-5 rounded-2xl flex items-center justify-center gap-3 group disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                                                    {isSignUp ? 'Begin Journey' : 'Begin Experience'}
                                                </span>
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-12 space-y-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gold/5"></div>
                                        </div>
                                        <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em]">
                                            <span className="bg-cream px-4 text-charcoal/30">Or Connect via</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleOAuthSignIn('google')}
                                            className="flex items-center justify-center gap-3 bg-white border border-gold/10 px-4 py-3 rounded-xl hover:border-gold/40 transition-all hover:shadow-sm"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span className="text-[9px] uppercase tracking-widest font-bold text-charcoal/60">Google</span>
                                        </button>
                                        <button
                                            onClick={() => handleOAuthSignIn('facebook')}
                                            className="flex items-center justify-center gap-3 bg-[#1877F2] px-4 py-3 rounded-xl hover:bg-[#166FE5] transition-all shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                            <span className="text-[9px] uppercase tracking-widest font-bold text-white">Facebook</span>
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <button
                                            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                                            className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hover:text-gold transition-colors font-bold underline decoration-gold/20 underline-offset-8"
                                        >
                                            {isSignUp ? 'Already have a legacy? Sign In' : 'Begin a new chapter? Join us'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-center md:hidden">
                                <button onClick={onClose} className="text-[10px] uppercase tracking-widest text-charcoal/30 font-bold">
                                    Return to Sanctuary
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
