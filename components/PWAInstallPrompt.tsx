import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Automatically show our custom prompt after a short delay
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white/90 backdrop-blur-xl border border-gold/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                {/* Decorative Background Element */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all duration-700" />

                <button
                    onClick={() => setShowPrompt(false)}
                    className="absolute top-4 right-4 p-2 text-charcoal/40 hover:text-charcoal/80 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-5">
                    <div className="bg-gold/10 p-3.5 rounded-2xl">
                        <Sparkles className="w-8 h-8 text-gold" />
                    </div>

                    <div className="flex-1 pr-4">
                        <h3 className="text-xl font-serif font-bold text-charcoal mb-2 leading-tight">
                            Bring the Luxury to Your Home Screen
                        </h3>
                        <p className="text-charcoal/60 text-sm mb-6 leading-relaxed">
                            Install the Golden Tower Spa app today for faster booking and exclusive premium offers.
                        </p>

                        <button
                            onClick={handleInstallClick}
                            className="w-full bg-gold hover:bg-gold/90 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-gold/20"
                        >
                            <Download className="w-5 h-5" />
                            <span>Install Now</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
