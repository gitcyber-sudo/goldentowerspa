
import React from 'react';
import { Logo } from './Logo';

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "Restoring your session" }) => {
    const [showInitialText, setShowInitialText] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowInitialText(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className="min-h-screen bg-cream flex items-center justify-center overflow-hidden"
            role="status"
            aria-label="Loading"
        >
            <div className="relative flex flex-col items-center px-6">
                {/* Initial Fading Text Effect */}
                {showInitialText ? (
                    <div className="animate-fade-in-out">
                        <h1 className="font-serif text-4xl md:text-7xl text-gold text-center tracking-tighter">
                            Golden Tower <span className="italic">Spa</span>
                        </h1>
                    </div>
                ) : (
                    <div className="animate-fade-in flex flex-col items-center">
                        {/* Animated Background Elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] md:w-[300px] h-[250px] md:h-[300px] bg-gold/5 rounded-full blur-3xl animate-pulse" aria-hidden="true" />

                        {/* Logo with Animation */}
                        <div className="relative mb-8 animate-float" aria-hidden="true">
                            <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl scale-125 animate-pulse" />
                            <div className="relative bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-full border border-gold/10 shadow-2xl">
                                <Logo className="h-16 w-16 md:h-20 md:w-20" color="#997B3D" />
                            </div>
                        </div>

                        {/* Text and Spinner */}
                        <div className="text-center z-10">
                            <h2 className="font-serif text-3xl md:text-5xl text-charcoal mb-4 tracking-tight">
                                Golden Tower <span className="text-gold italic">Spa</span>
                            </h2>
                            <div className="flex items-center justify-center gap-3">
                                <div className="flex gap-1.5" aria-hidden="true">
                                    <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" />
                                </div>
                                <p
                                    className="text-[10px] md:text-xs text-charcoal/50 uppercase tracking-[0.3em] font-black ml-2"
                                    aria-live="polite"
                                >
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <span className="sr-only">{message}</span>
        </div>
    );
};

export default LoadingScreen;
