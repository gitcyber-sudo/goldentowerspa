import React, { useEffect, useState } from 'react';
import { Home, ArrowRight, Loader2, Sparkles, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ServiceItem {
    id: string;
    title: string;
    description: string;
    image_url: string;
    duration: string;
    price: number;
}

interface HomeServiceProps {
    onBookClick: (id: string) => void;
}

const HomeService: React.FC<HomeServiceProps> = ({ onBookClick }) => {
    const [service, setService] = useState<ServiceItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeService = async () => {
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('title', 'Home Service Massage')
                    .single();

                if (error) throw error;
                setService(data);
            } catch (error) {
                console.error('Error fetching Home Service:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeService();
    }, []);

    useEffect(() => {
        if (loading || !service) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        const elements = document.querySelectorAll('#home-service .reveal');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [loading, service]);

    if (loading) {
        return (
            <div className="py-24 flex justify-center items-center">
                <Loader2 className="animate-spin text-gold" size={32} />
            </div>
        );
    }

    if (!service) return null;

    return (
        <section id="home-service" className="py-24 relative overflow-hidden bg-white">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 -skew-x-12 transform origin-top-right"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Visual Side */}
                    <div className="w-full lg:w-1/2 relative group">
                        <div className="absolute -inset-4 bg-gold/10 rounded-3xl blur-2xl group-hover:bg-gold/20 transition-all duration-700"></div>
                        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-3xl border border-gold/20 shadow-2xl">
                            <img
                                src={service.image_url}
                                alt={service.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent"></div>

                            {/* Badge Overlay */}
                            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-gold/20">
                                <Home size={16} className="text-gold" />
                                <span className="text-charcoal text-[10px] uppercase font-bold tracking-widest">Home Service</span>
                            </div>

                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="flex items-center gap-4 text-white">
                                    <div className="bg-gold px-4 py-2 rounded-lg font-bold text-lg shadow-xl">
                                        P {service.price}
                                    </div>
                                    <div className="text-sm font-medium tracking-wide uppercase opacity-90 border-l border-white/30 pl-4">
                                        {service.duration} Session
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full lg:w-1/2 flex flex-col">
                        <div className="reveal">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-[1px] w-8 bg-gold"></div>
                                <span className="text-gold text-sm uppercase tracking-[0.3em] font-black">Elite Convenience</span>
                            </div>

                            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-charcoal mb-8 leading-tight">
                                {service.title}
                            </h2>

                            <div className="bg-cream/40 backdrop-blur-sm border-l-4 border-gold p-8 rounded-r-2xl mb-10 shadow-sm hover:shadow-md transition-shadow duration-500">
                                <p className="text-charcoal-light text-lg md:text-xl leading-relaxed italic">
                                    "{service.description}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                <div className="flex items-start gap-4">
                                    <div className="bg-gold/10 p-3 rounded-xl">
                                        <MapPin className="text-gold" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal text-sm uppercase tracking-wider mb-1">Your Doorstep</h4>
                                        <p className="text-charcoal-light text-xs">We bring the luxury spa ambiance to your residence.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-gold/10 p-3 rounded-xl">
                                        <Sparkles className="text-gold" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal text-sm uppercase tracking-wider mb-1">Full Setup</h4>
                                        <p className="text-charcoal-light text-xs">Including oils, aromatherapy, and expert equipment.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => onBookClick(service.id)}
                                className="group relative inline-flex items-center gap-4 px-10 py-5 bg-charcoal text-white rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:bg-gold btn-tactile w-fit"
                            >
                                <span className="relative z-10 font-bold uppercase tracking-widest text-sm">Schedule Home Ritual</span>
                                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                            </button>

                            <p className="mt-6 text-[10px] text-charcoal/40 uppercase tracking-widest font-medium">
                                * Note: Minimal transportation fee may apply based on location.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HomeService;
