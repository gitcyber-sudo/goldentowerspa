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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity duration-500"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transform scale-100 transition-transform duration-500 animate-in fade-in zoom-in duration-300">

                {/* Header Decor */}
                <div className="absolute top-0 left-0 w-full h-1 flex">
                    <div className="flex-1 bg-gold/40" />
                    <div className="flex-1 bg-gold/60" />
                    <div className="flex-1 bg-gold/80" />
                    <div className="flex-1 bg-gold" />
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all duration-300 z-10"
                >
                    <X size={16} />
                </button>

                <div className="p-4 md:p-8 overflow-y-auto max-h-[95vh]">
                    <div className="text-center mb-4">
                        <span className="text-[7px] uppercase tracking-[0.3em] text-gold font-bold mb-0.5 block">Highlights</span>
                        <h2 className="font-serif italic text-lg md:text-2xl text-white mb-1">Website Features</h2>
                        <p className="text-white/40 text-[9px] max-w-xs mx-auto">
                            Complete business management for wellness.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg border border-white/5 bg-white/[0.03] group hover:border-gold/20 transition-all duration-300 flex flex-col items-center text-center">
                                <div className="mb-1.5 text-gold">
                                    {React.cloneElement(feature.icon as React.ReactElement, { size: 16 })}
                                </div>
                                <h3 className="text-white text-[9px] font-bold tracking-wide mb-0.5 group-hover:text-gold transition-colors duration-300">{feature.title}</h3>
                                <p className="text-white/40 text-[8px] leading-tight line-clamp-2">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* B2B Transformation Section */}
                    <div className="relative rounded-lg p-3 bg-gradient-to-br from-gold/15 via-transparent to-transparent border border-gold/10 overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h3 className="font-serif italic text-base text-gold mb-0.5">Interested?</h3>
                            <p className="text-white/50 text-[9px] mb-3">Let's discuss your project.</p>

                            <a
                                href="mailto:valdezjohnpaul15.jv@gmail.com"
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gold text-black font-bold text-[9px] tracking-widest uppercase hover:bg-gold-light transition-all duration-300"
                            >
                                <Mail size={10} />
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
