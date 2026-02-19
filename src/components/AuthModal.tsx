
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = React.useState(initialMode === 'signup');

    // Synchronize mode when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setIsSignUp(initialMode === 'signup');
        }
    }, [isOpen, initialMode]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Handle shorthand for admin login
        let loginEmail = formData.email.trim();
        if (loginEmail.toLowerCase() === 'admin') {
            loginEmail = 'admin@goldentowerspa.ph';
        }

        // Client-side email validation
        if (!validateEmail(loginEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email: loginEmail,
                    password: formData.password,
                    options: {
                        data: { full_name: formData.fullName }
                    }
                });
                if (signUpError) throw signUpError;
                setShowSuccess(true);
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

                    // Use window.location.href for reliable redirect (avoids React state race conditions)
                    window.location.href = dashboardPath;
                }
            }
        } catch (err: unknown) {
            // Robust error parsing for both standard Errors and cryptic Supabase objects
            let message = 'Authentication failed';

            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'object' && err !== null) {
                // Handle cases where err is a Supabase error object but not an instance of Error
                message = (err as any).message || (err as any).error_description || JSON.stringify(err);
            }

            if (message === "Invalid login credentials" || message.includes("Invalid login credentials")) {
                setError("Incorrect email or password. Please try again.");
            } else if (message.includes("User already registered")) {
                setError("An account with this email already exists.");
            } else if (message.toLowerCase().includes("email") && message.toLowerCase().includes("valid")) {
                setError("Please enter a valid email address.");
            } else if (message === "{}" || message === "undefined" || !message) {
                // Supabase often returns {} for dummy domains or generic validation failures
                setError("Please enter a valid, registered email address.");
            } else {
                setError(message);
            }

            // Standardized Telemetry
            import('../lib/errorLogger').then(({ logError }) => {
                logError({
                    message: `[GTS-301]: Authentication failed (${isSignUp ? 'signup' : 'login'}). ${message}`,
                    severity: 'error',
                    metadata: { email: loginEmail, isSignUp, originalError: err }
                });
            });
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
                    redirectTo: `${window.location.origin}/`
                }
            });
            if (error) throw error;
        } catch (err: unknown) {
            console.error("Google Sign In Error:", err);
            setError(err instanceof Error ? err.message : 'Google sign-in failed');
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
                    {showSuccess ? (
                        <div className="text-center py-8 animate-fade-in">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                                <Mail className="text-gold" size={32} />
                            </div>
                            <h2 className="font-serif text-3xl text-charcoal mb-4">Check Your Email</h2>
                            <p className="text-charcoal/60 mb-8 leading-relaxed">
                                We've sent a verification link to <span className="text-charcoal font-bold">{formData.email}</span>. Please confirm your email to activate your sanctuary experience.
                            </p>
                            <button
                                onClick={() => {
                                    setShowSuccess(false);
                                    setIsSignUp(false);
                                    setError(null);
                                }}
                                className="w-full bg-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gold-dark transition-all"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    ) : (
                        <>
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
                                        type="email"
                                        placeholder="Email address"
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

                            <div className="mt-6 text-center flex flex-col items-center gap-4">
                                <button
                                    onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                                    className="text-sm text-charcoal/60 hover:text-gold transition-colors underline decoration-gold/30 underline-offset-4"
                                >
                                    {isSignUp ? 'Already a member? Sign In' : 'New here? Create Account'}
                                </button>

                                {!isSignUp && (
                                    <button
                                        onClick={() => { navigate('/therapist-login'); onClose(); }}
                                        className="text-xs text-gold/60 hover:text-gold transition-colors font-bold uppercase tracking-widest pt-4 border-t border-gold/5 w-full"
                                    >
                                        Therapist Access
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
