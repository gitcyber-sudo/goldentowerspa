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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transform scale-100 transition-transform duration-500 animate-in fade-in zoom-in duration-300">

                {/* Header Decor */}
                <div className="absolute top-0 left-0 w-full h-1 flex">
                    <div className="flex-1 bg-gold/40" />
                    <div className="flex-1 bg-gold/60" />
                    <div className="flex-1 bg-gold/80" />
                    <div className="flex-1 bg-gold" />
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all duration-300 z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 md:p-12 overflow-y-auto max-h-[85vh]">
                    <div className="text-center mb-12">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-3 block">Product Showcase</span>
                        <h2 className="font-serif italic text-3xl md:text-4xl text-white mb-4">The Digital Masterpiece</h2>
                        <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
                            This website is more than just a page—it is a complete business management system designed for luxury and performance.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/[0.03] group hover:border-gold/20 hover:bg-gold/[0.02] transition-all duration-300">
                                <div className="mb-4 inline-block p-3 rounded-xl bg-white/5 group-hover:bg-gold/10 transition-colors duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-white font-bold tracking-wide mb-2 group-hover:text-gold transition-colors duration-300">{feature.title}</h3>
                                <p className="text-white/40 text-xs leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* B2B Transformation Section */}
                    <div className="relative rounded-3xl p-8 bg-gradient-to-br from-gold/20 via-transparent to-transparent border border-gold/10 overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h3 className="font-serif italic text-2xl text-gold mb-3">Ready to Build Your Business?</h3>
                            <p className="text-white/60 text-sm mb-8 max-w-sm">
                                I am looking for business partners. If you want a world-class website like this for your brand, let's talk.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <a
                                    href="mailto:valdezjohnpaul15.jv@gmail.com"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gold text-black font-bold text-sm tracking-widest uppercase hover:bg-gold-light transition-all duration-300 shadow-[0_10px_30px_rgba(197,160,89,0.3)] hover:-translate-y-1"
                                >
                                    <Mail size={18} />
                                    Start a Partnership
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturesModal;
