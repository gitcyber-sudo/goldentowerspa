import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import Logo from './Logo';

const AdminLogin: React.FC = () => {
    useSEO({
        title: 'Admin Access',
        description: 'Secure administrator login for Golden Tower Spa management.'
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let loginEmail = formData.email.trim();
            // Allow shorthand "admin" to expand to the full admin email
            if (loginEmail.toLowerCase() === 'admin') {
                loginEmail = 'admin@goldentowerspa.ph';
            }

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: formData.password
            });

            if (signInError) throw signInError;

            if (data.user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profileData?.role !== 'admin') {
                    await supabase.auth.signOut();
                    throw new Error('Access denied. This portal is for administrators only.');
                }

                window.location.replace('/admin');
            }
        } catch (err: unknown) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-charcoal flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/3 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/3 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="w-full max-w-md relative z-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-white/30 hover:text-gold transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium uppercase tracking-widest">Back to Site</span>
                </button>

                <div className="bg-charcoal/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gold/10 overflow-hidden">
                    <div className="bg-gradient-to-br from-gold/20 to-gold/5 p-8 text-center relative overflow-hidden border-b border-gold/10">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
                        <div className="relative">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                                <Shield className="text-gold" size={28} />
                            </div>
                            <h1 className="font-serif text-3xl text-white mb-2">Admin Portal</h1>
                            <p className="text-gold/50 text-xs uppercase tracking-[0.2em] font-bold">Authorized Access Only</p>
                        </div>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">
                                    Email
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Admin email"
                                        required
                                        className="w-full bg-white/5 border border-gold/10 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-gold focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="w-full bg-white/5 border border-gold/10 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-gold focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                                    <p className="text-xs text-rose-400 font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-gold to-gold-dark text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-gold/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Shield size={18} />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-white/10 text-xs mt-6 uppercase tracking-widest">
                    Golden Tower Spa — Management System
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
