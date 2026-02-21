import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AvailabilityCTA: React.FC = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-charcoal text-white">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="container relative z-10 px-6 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-fade-in-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest mb-6">
                            <Calendar size={14} /> Plan Your Session
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Find the Perfect <span className="text-gold italic">Time & Specialist</span></h2>
                        <p className="text-white/70 text-lg mb-8 max-w-xl leading-relaxed">
                            Prefer a specific day for your wellness journey? Check our live calendar to see which of our expert therapists are available on your chosen date.
                        </p>
                        <Link
                            to="/availability"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-white rounded-full font-bold uppercase tracking-widest hover:bg-gold-light hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/20 transition-all duration-300 group"
                        >
                            Check Therapist Schedules
                            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="relative animate-fade-in-right hidden lg:block">
                        <div className="absolute inset-0 bg-gold/20 rounded-3xl rotate-3 scale-105" />
                        <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                                <div>
                                    <h3 className="font-serif text-2xl text-white">Live Availability</h3>
                                    <p className="text-gold/80 text-sm mt-1">Real-time schedule synchronization</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                                    <Calendar className="text-gold" size={24} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-gold/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-charcoal flex items-center justify-center border border-gold/20">
                                                <span className="text-gold font-serif">S</span>
                                            </div>
                                            <div>
                                                <div className="w-24 h-4 rounded bg-white/20 mb-2"></div>
                                                <div className="w-16 h-3 rounded bg-white/10"></div>
                                            </div>
                                        </div>
                                        <div className="w-20 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <div className="w-12 h-2 rounded bg-emerald-500/50"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AvailabilityCTA;
