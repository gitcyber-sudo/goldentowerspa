
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Handle shorthand for admin login
            let loginEmail = formData.email.trim();
            if (loginEmail.toLowerCase() === 'admin') {
                loginEmail = 'admin@goldentowerspa.ph';
            }

            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email: loginEmail,
                    password: formData.password,
                    options: {
                        data: { full_name: formData.fullName }
                    }
                });
                if (signUpError) throw signUpError;
                // Depending on Supabase settings, signup might require email confirmation.
                // For this demo, assuming auto-confirm or instructing user.
                alert('Account created! Please check your email to confirm, then sign in.');
                setIsSignUp(false); // Switch to sign in
            } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email: loginEmail,
                    password: formData.password
                });

                if (signInError) throw signInError;

                // Success - Redirect based on role
                if (data.user) {
                    // Check profile for role-based redirect
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single();

                    const role = profileData?.role || 'user';
                    const dashboardPath = role === 'admin' ? '/admin' : (role === 'therapist' ? '/therapist' : '/dashboard');

                    onSuccess();
                    onClose();
                    navigate(dashboardPath);
                }
            }
        } catch (err: any) {
            // Improved error message for specific Supabase error "Invalid login credentials"
            if (err.message === "Invalid login credentials") {
                setError("Incorrect email or password. Please try again.");
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            console.error("Google Sign In Error:", err);
            setError(err.message || 'Google sign-in failed');
        }
    };


    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-charcoal/80 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="relative bg-[#F9F7F2] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gold/20 animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="font-serif text-3xl text-charcoal mb-2">
                            {isSignUp ? 'Join the Sanctuary' : 'Welcome Back'}
                        </h2>
                        <p className="text-charcoal/60 text-sm">
                            {isSignUp ? 'Begin your journey to relaxation' : 'Sign in to manage your experiences'}
                        </p>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gold/40 px-4 py-3 rounded-xl transition-all hover:shadow-md"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-sm font-medium text-charcoal">Continue with Google</span>
                        </button>

                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gold/20"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#F9F7F2] px-2 text-charcoal/40 tracking-widest">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    className="w-full bg-white border border-gold/20 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-gold transition-colors"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                            <input
                                type="text"
                                placeholder="Email or 'admin'"
                                required
                                className="w-full bg-white border border-gold/20 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-gold transition-colors"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                minLength={6}
                                className="w-full bg-white border border-gold/20 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-gold transition-colors"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg border border-rose-200">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gold text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-gold-dark transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                            className="text-sm text-charcoal/60 hover:text-gold transition-colors underline decoration-gold/30 underline-offset-4"
                        >
                            {isSignUp ? 'Already a member? Sign In' : 'New here? Create Account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
