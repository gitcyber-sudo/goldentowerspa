
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Lock, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import Logo from './Logo';

const TherapistLogin: React.FC = () => {
    useSEO({
        title: 'Therapist Access',
        description: 'Secure login for Golden Tower Spa wellness specialists.'
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Fetch the user's email from profiles table using their name (case-insensitive)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('email')
                .ilike('full_name', formData.name.trim())
                .eq('role', 'therapist')
                .maybeSingle();

            if (profileError) throw profileError;

            if (!profile) {
                throw new Error('Invalid credentials. Please try again.');
            }

            // 2. Sign in with the fetched email
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: profile.email,
                password: formData.password
            });

            if (signInError) throw signInError;

            // Success redirect
            navigate('/therapist');
        } catch (err: any) {
            console.error('Therapist Login Error:', err);
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

            <div className="w-full max-w-md relative z-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-charcoal/40 hover:text-gold transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium uppercase tracking-widest">Back to Site</span>
                </button>

                <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gold/10 overflow-hidden">
                    <div className="bg-charcoal p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
                        <Logo className="h-8 w-8 mx-auto mb-4 animate-pulse" color="#997B3D" />
                        <h1 className="font-serif text-3xl text-white mb-2 italic">Therapist Portal</h1>
                        <p className="text-gold/60 text-xs uppercase tracking-[0.2em] font-bold">Staff Secure Access</p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 ml-1">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40 group-focus-within:text-gold transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        required
                                        className="w-full bg-cream/30 border border-gold/10 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-gold focus:bg-white transition-all text-charcoal placeholder:text-charcoal/20"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 ml-1">
                                    Access Key
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40 group-focus-within:text-gold transition-colors" size={18} />
                                    <input
                                        type="password"
                                        placeholder="4-Digit Access PIN"
                                        required
                                        className="w-full bg-cream/30 border border-gold/10 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-gold focus:bg-white transition-all text-charcoal placeholder:text-charcoal/20"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3 animate-shake">
                                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                                    <p className="text-xs text-rose-600 leading-relaxed font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gold-dark transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-lg shadow-gold/20"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Enter Portal</span>
                                        <Logo className="h-4 w-4 group-hover:rotate-12 transition-transform" color="white" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-gold/5 text-center">
                            <p className="text-[10px] text-charcoal/40 uppercase tracking-widest leading-relaxed">
                                Authorized Personnel Only.<br />
                                All access is monitored and logged.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TherapistLogin;
