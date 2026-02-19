import React, { useEffect } from 'react';
import { X, CheckCircle2, Zap, ShieldCheck, BarChart3, Mail, ExternalLink } from 'lucide-react';

interface FeaturesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeaturesModal: React.FC<FeaturesModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const features = [
        {
            title: "Smart Booking System",
            description: "Fast and easy booking for guests and spa members. Handles schedules without conflicts.",
            icon: <Zap className="text-gold" size={24} />
        },
        {
            title: "Business Admin Dashboard",
            description: "A private control panel to manage staff, view revenue reports, and track business growth.",
            icon: <BarChart3 className="text-gold" size={24} />
        },
        {
            title: "Premium Cinematic Design",
            description: "High-end animations and responsive layout that works perfectly on every device.",
            icon: <ExternalLink className="text-gold" size={24} />
        },
        {
            title: "Secure Cloud Database",
            description: "Powered by Supabase for safe data handling and ultra-fast loading speeds.",
            icon: <ShieldCheck className="text-gold" size={24} />
        }
    ];

    return (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center p-4 pb-32 md:pb-48 overflow-y-auto custom-scrollbar">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500"
                onClick={onClose}
            />

            {/* Modal Container - Bottom Anchored Sheet */}
            <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-full duration-500 flex flex-col">

                {/* Header Decor */}
                <div className="absolute top-0 left-0 w-full h-1 flex shrink-0 z-20">
                    <div className="flex-1 bg-gold/40" />
                    <div className="flex-1 bg-gold/60" />
                    <div className="flex-1 bg-gold/80" />
                    <div className="flex-1 bg-gold" />
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all duration-300 z-30"
                >
                    <X size={16} />
                </button>

                {/* Content Area */}
                <div className="p-5">
                    <div className="text-center mb-5 mt-2">
                        <span className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold mb-1 block">Highlights</span>
                        <h2 className="font-serif italic text-2xl text-white mb-1">Website Features</h2>
                        <p className="text-white/40 text-xs max-w-xs mx-auto">
                            Complete business management.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 mb-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-white/5 bg-white/[0.03] group hover:border-gold/20 transition-all duration-300 flex items-start gap-3 text-left">
                                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-gold/10 transition-colors duration-300 shrink-0 text-gold">
                                    {React.cloneElement(feature.icon as React.ReactElement, { size: 16 })}
                                </div>
                                <div>
                                    <h3 className="text-white text-xs font-bold tracking-wide mb-0.5 group-hover:text-gold transition-colors duration-300">{feature.title}</h3>
                                    <p className="text-white/40 text-[10px] leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* B2B Transformation Section */}
                    <div className="relative rounded-xl p-4 bg-gradient-to-br from-gold/15 via-transparent to-transparent border border-gold/10 overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h3 className="font-serif italic text-base text-gold mb-0.5">Interested?</h3>
                            <p className="text-white/50 text-[10px] mb-3">Let's discuss your project.</p>

                            <a
                                href="mailto:valdezjohnpaul15.jv@gmail.com?subject=Project%20Inquiry%20-%20Golden%20Tower%20Spa%20Platform&body=Hello%20John%20Paul%2C%0A%0AI%20am%20interested%20in%20discussing%20a%20potential%20project%20related%20to%20the%20Golden%20Tower%20Spa%20digital%20platform.%0A%0AI%20specifically%20liked%20the%20website%20features%20mentioned%20in%20your%20highlights.%0A%0ALooking%20forward%20to%20hearing%20from%20you.%0A%0ABest%20regards%2C%0A%5BYour%20Name%5D"
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gold text-black font-bold text-[10px] tracking-widest uppercase hover:bg-gold-light transition-all duration-300"
                            >
                                <Mail size={12} />
                                Inquire Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturesModal;
