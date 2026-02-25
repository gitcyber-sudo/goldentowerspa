import React, { useEffect, useState, useCallback } from 'react';
import { ArrowRight, Loader2, ChevronDown, ChevronUp, Clock, MapPin, Phone, Star, Home, HelpCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import { formatDuration } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface ServiceItem {
    id: string;
    title: string;
    description: string;
    image_url: string;
    duration: number;
    price: number;
    category?: string;
}

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "What types of massage does Golden Tower Spa offer?",
        answer: "We offer a comprehensive range of massage treatments including our premium Golden Tower Signature Massage, traditional Filipino Hilot, Swedish massage, Shiatsu, deep tissue massage, Ventosa cupping therapy, and home service massage. We also have express treatments and luxury spa packages."
    },
    {
        question: "Is there a home service massage available in Quezon City?",
        answer: "Yes! Golden Tower Spa offers home service massage throughout Quezon City and Metro Manila. Our professional therapists bring the full luxury spa experience to your doorstep, complete with premium oils, aromatherapy, and expert equipment. Book online or call us at 09228262336."
    },
    {
        question: "How much do spa services cost at Golden Tower Spa?",
        answer: "Our prices are designed to be affordable luxury. Express treatments start from ₱500, regular massages like Swedish and Shiatsu start at ₱700, traditional Hilot at ₱800, and our premium Golden Tower Signature Massage is ₱1,500. Home service massage starts at ₱1,200."
    },
    {
        question: "Is Golden Tower Spa open late at night?",
        answer: "Yes! We are one of the few late-night spas in Quezon City. Golden Tower Spa is open daily from 4:00 PM until 4:00 AM, seven days a week including holidays. Perfect for after-work relaxation or late-night wellness."
    },
    {
        question: "Where exactly is Golden Tower Spa located?",
        answer: "Golden Tower Spa is located at #1 C2 Road 9, Project 6, Quezon City, 1100 Philippines. We are easily accessible from major roads in Quezon City and the rest of Metro Manila. Click 'Get Directions' on our homepage for Google Maps navigation."
    },
    {
        question: "What is traditional Hilot massage?",
        answer: "Hilot is an ancient Filipino healing art that has been practiced for centuries. It involves the use of banana leaves to diagnose body imbalances and virgin coconut oil applied through specialized massage techniques. At Golden Tower Spa, our therapists are trained masters of this traditional healing method, providing an authentic Hilot experience."
    },
    {
        question: "How do I book an appointment at Golden Tower Spa?",
        answer: "You can book an appointment through our website by clicking the 'Book Now' button — it takes just a few taps to select your preferred service, date, and time. You can also call us directly at 09228262336, message us on Facebook, or simply walk in during our operating hours (4 PM – 4 AM)."
    },
    {
        question: "Do I need to make a reservation or can I walk in?",
        answer: "Both are welcome! While walk-ins are accepted, we recommend booking online or calling ahead to guarantee your preferred time slot, especially during evenings and weekends when we tend to be busiest."
    }
];

const ServicesPage: React.FC = () => {
    useSEO({
        title: 'Spa Services & Prices — Massage in Quezon City',
        description: 'Browse all Golden Tower Spa services and prices. Traditional Hilot massage, Swedish, Shiatsu, deep tissue, Ventosa cupping, and home service massage in Quezon City. Book online now!',
        keywords: 'spa services quezon city, massage prices manila, hilot massage price, swedish massage quezon city, shiatsu massage price philippines, home service massage cost, spa menu quezon city, affordable massage manila',
        canonicalPath: '/services'
    });

    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .order('price', { ascending: true });

                if (error) throw error;
                setServices(data || []);
            } catch {
                // Silently handle
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const toggleFAQ = useCallback((index: number) => {
        setExpandedFAQ(prev => prev === index ? null : index);
    }, []);

    const signatureServices = services.filter(s => s.title?.toLowerCase().includes('signature') || s.title?.toLowerCase().includes('golden tower'));
    const regularServices = services.filter(s =>
        !s.title?.toLowerCase().includes('signature') &&
        !s.title?.toLowerCase().includes('golden tower') &&
        !s.title?.toLowerCase().includes('package') &&
        !s.title?.toLowerCase().includes('express') &&
        !s.title?.toLowerCase().includes('home service')
    );
    const packages = services.filter(s => s.title?.toLowerCase().includes('package'));
    const expressServices = services.filter(s => s.title?.toLowerCase().includes('express'));
    const homeServices = services.filter(s => s.title?.toLowerCase().includes('home service'));

    const renderServiceCard = (service: ServiceItem) => (
        <article key={service.id} className="bg-white rounded-2xl border border-gold/10 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="relative h-56 overflow-hidden">
                <img
                    src={service.image_url}
                    alt={`${service.title} — massage service at Golden Tower Spa Quezon City`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="bg-gold text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
                        ₱{service.price?.toLocaleString()}
                    </span>
                    <span className="bg-white/90 text-charcoal text-xs font-medium px-3 py-1 rounded-lg backdrop-blur-sm">
                        {formatDuration(service.duration)}
                    </span>
                </div>
            </div>
            <div className="p-6">
                <h3 className="font-serif text-xl text-charcoal mb-2 group-hover:text-gold transition-colors">
                    {service.title}
                </h3>
                <p className="text-charcoal-light text-sm font-light leading-relaxed mb-4">
                    {service.description}
                </p>
                <button
                    onClick={() => navigate('/', { state: { scrollTo: 'services' } })}
                    className="inline-flex items-center text-gold text-sm font-bold uppercase tracking-wider hover:gap-3 gap-2 transition-all"
                >
                    Book This Service <ArrowRight size={14} />
                </button>
            </div>
        </article>
    );

    const renderSection = (title: string, subtitle: string, items: ServiceItem[], icon?: React.ReactNode) => {
        if (items.length === 0) return null;
        return (
            <section className="mb-20" aria-label={title}>
                <div className="flex items-center gap-3 mb-2">
                    {icon}
                    <span className="text-gold text-xs font-bold uppercase tracking-[0.3em]">{subtitle}</span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-8">{title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map(renderServiceCard)}
                </div>
            </section>
        );
    };

    return (
        <div className="bg-cream min-h-screen">
            <Header onBookClick={() => navigate('/', { state: { scrollTo: 'services' } })} onLoginClick={() => { }} />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 bg-gradient-to-b from-charcoal via-charcoal/95 to-cream overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gold/20 rounded-full blur-3xl" />
                </div>
                <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
                    <span className="text-gold text-xs font-bold uppercase tracking-[0.4em] block mb-4">Complete Menu</span>
                    <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight">
                        Our Spa <span className="italic text-gold">Services</span>
                    </h1>
                    <p className="text-white/70 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                        Discover the full range of luxury massage and wellness treatments at Golden Tower Spa, Quezon City's premier relaxation destination.
                    </p>
                </div>
            </section>

            {/* Quick Info Bar */}
            <div className="bg-white border-b border-gold/10 py-4">
                <div className="container mx-auto px-6 flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-charcoal-light">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gold" />
                        <span>Project 6, Quezon City</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gold" />
                        <span>Open Daily 4 PM – 4 AM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gold" />
                        <a href="tel:09228262336" className="hover:text-gold transition-colors">09228262336</a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Home size={16} className="text-gold" />
                        <span>Home Service Available</span>
                    </div>
                </div>
            </div>

            {/* Services Content */}
            <main className="container mx-auto px-6 md:px-12 py-16 md:py-24">
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <Loader2 className="animate-spin text-gold" size={40} />
                    </div>
                ) : (
                    <>
                        {renderSection(
                            "Signature Treatments",
                            "The Crown Jewel",
                            signatureServices,
                            <Star size={16} className="text-gold" />
                        )}

                        {renderSection(
                            "Massage & Therapy",
                            "The Art of Healing",
                            regularServices
                        )}

                        {renderSection(
                            "Home Service Massage",
                            "Elite Convenience",
                            homeServices,
                            <Home size={16} className="text-gold" />
                        )}

                        {renderSection(
                            "Luxury Packages",
                            "Premium Bundles",
                            packages
                        )}

                        {renderSection(
                            "Express Treatments",
                            "Quick Revive",
                            expressServices
                        )}
                    </>
                )}

                {/* FAQ Section */}
                <section className="mt-8 md:mt-16 max-w-3xl mx-auto" aria-label="Frequently Asked Questions">
                    <div className="text-center mb-12">
                        <div className="flex justify-center items-center gap-2 mb-2">
                            <HelpCircle size={16} className="text-gold" />
                            <span className="text-gold text-xs font-bold uppercase tracking-[0.3em]">Got Questions?</span>
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl text-charcoal">Frequently Asked Questions</h2>
                        <p className="text-charcoal-light font-light mt-3">Everything you need to know about Golden Tower Spa</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${expandedFAQ === index ? 'border-gold/40 shadow-md' : 'border-gold/10 hover:border-gold/20 shadow-sm'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full text-left p-6 flex items-start justify-between gap-4"
                                    aria-expanded={expandedFAQ === index}
                                >
                                    <h3 className="font-serif text-lg text-charcoal pr-4">{faq.question}</h3>
                                    <span className="flex-shrink-0 mt-1 text-gold">
                                        {expandedFAQ === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </span>
                                </button>
                                <div
                                    className={`transition-all duration-300 ease-in-out ${expandedFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        } overflow-hidden`}
                                >
                                    <p className="px-6 pb-6 text-charcoal-light font-light leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="mt-20 text-center bg-gradient-to-r from-charcoal to-charcoal/90 rounded-3xl p-12 md:p-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gold/5 animate-pulse opacity-50" />
                    <div className="relative z-10">
                        <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Ready to Experience the Golden Touch?</h2>
                        <p className="text-white/60 font-light mb-8 max-w-xl mx-auto">Book your wellness treatment now and discover why Golden Tower Spa is Quezon City's most loved spa destination.</p>
                        <button
                            onClick={() => navigate('/', { state: { scrollTo: 'services' } })}
                            className="inline-flex items-center gap-3 bg-gold text-white px-10 py-4 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-gold-dark transition-colors shadow-xl hover:shadow-2xl"
                        >
                            Book Now <ArrowRight size={18} />
                        </button>
                        <div className="flex justify-center gap-8 mt-8 text-white/40 text-xs">
                            <span>✓ Online Booking</span>
                            <span>✓ Home Service</span>
                            <span>✓ Open Until 4 AM</span>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ServicesPage;
