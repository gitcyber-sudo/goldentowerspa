import React, { useEffect, useRef } from 'react';
import { MoveRight, ArrowRight, ChevronRight } from 'lucide-react';
import Logo from './Logo';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatDuration } from '../lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface ServiceItem {
    id: string;
    title: string;
    description: string;
    image_url: string;
    duration: number;
    price: number;
    category?: string;
}

interface ExpressSectionProps {
    expressMassages: ServiceItem[];
    onBookClick: (id: string) => void;
    loading: boolean;
}

const ExpressSection: React.FC<ExpressSectionProps> = ({ expressMassages, onBookClick, loading }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Desktop Animation
    useEffect(() => {
        if (loading || !expressMassages.length || window.innerWidth < 768) return;

        const ctx = gsap.context(() => {
            gsap.from(containerRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                },
                opacity: 0,
                y: 50,
                duration: 0.8
            });
        });

        return () => ctx.revert();
    }, [loading, expressMassages]);

    // Mobile 3D Cover Flow Animation
    useEffect(() => {
        if (loading || !expressMassages.length || window.innerWidth >= 768 || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const cards = gsap.utils.toArray('.mobile-express-card') as HTMLElement[];

        // Initial setup
        gsap.set(container, {
            perspective: 1000,
            transformStyle: "preserve-3d"
        });

        const updateCards = () => {
            const centerPoint = container.scrollLeft + container.offsetWidth / 2;

            cards.forEach((card) => {
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const dist = centerPoint - cardCenter;

                // Normalize distance based on viewport width
                const normalize = Math.abs(dist) / (container.offsetWidth * 0.65);
                const factor = Math.min(Math.max(normalize, 0), 1);

                const scale = 1 - (factor * 0.15);    // 1.0 -> 0.85
                // Rotate: Left cards rotate Y+, Right cards rotate Y-
                const rotation = dist > 0 ? 30 * factor : -30 * factor;

                const opacity = 1 - (factor * 0.3);   // 1.0 -> 0.7
                const zIndex = 100 - Math.round(factor * 100);

                gsap.set(card, {
                    transform: `scale(${scale}) rotateY(${rotation}deg)`,
                    opacity: opacity,
                    zIndex: zIndex,
                    filter: `grayscale(${factor * 0.8}) brightness(${1 - factor * 0.2})`,
                    transformOrigin: "center center",
                    overwrite: "auto"
                });
            });
        };

        container.addEventListener('scroll', updateCards);
        updateCards();
        setTimeout(updateCards, 100); // settling

        return () => {
            container.removeEventListener('scroll', updateCards);
        };
    }, [loading, expressMassages]);

    if (loading) return null;

    return (
        <div
            id="express"
            ref={containerRef}
            className="relative mt-24 mb-24 py-20 md:py-32 bg-[#1A1A1A] w-screen left-1/2 -ml-[50vw] px-0 md:px-12 overflow-hidden"
        >
            {/* Subtle Shimmer Background Layer */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(197,160,89,0.15),transparent_70%)] animate-pulse"></div>

            <div className="container mx-auto relative z-10 px-6 md:px-0">
                <div className="flex flex-col mb-8 md:mb-16 lg:text-center">
                    <span className="text-gold text-[10px] md:text-xs uppercase tracking-[0.4em] font-black mb-3 block flex lg:justify-center items-center gap-2">
                        <Logo className="w-4 h-4 animate-spin-slow" color="#C5A059" /> Timeless Efficiency
                    </span>
                    <h2 className="font-serif text-4xl md:text-7xl text-white leading-tight">
                        Express <span className="italic text-gold">Massage</span>
                    </h2>
                    <p className="text-cream/40 mt-4 md:mt-6 max-w-2xl lg:mx-auto font-light leading-relaxed text-sm md:text-base">
                        Curated precision. Targeted treatments reimagined for those with
                        limited time but high standards. Experience total restoration in 30 minutes.
                    </p>
                </div>

                <div className="relative">
                    {/* Desktop Grid Layout (Visible on MD+) */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        {expressMassages.map((service, index) => (
                            <div
                                key={service.id}
                                className="group/card"
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all duration-700 hover:bg-white/10 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 flex flex-col relative overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
                                    <div className="relative h-[280px] w-full overflow-hidden mb-8 rounded-2xl ring-1 ring-white/10 group-hover/card:ring-gold/20">
                                        <img
                                            src={service.image_url}
                                            alt={`Express therapy: ${service.title}`}
                                            loading="lazy"
                                            className="w-full h-full object-cover grayscale-[30%] group-hover/card:grayscale-0 group-hover/card:scale-105 transition-all duration-1000"
                                        />
                                        <div className="absolute bottom-6 right-6 bg-gold text-white px-5 py-2 text-base font-black shadow-[0_8px_30px_rgb(197,160,89,0.3)] rounded-lg">
                                            P {service.price}
                                        </div>
                                        <div className="absolute top-6 left-6 bg-charcoal/80 backdrop-blur-md px-3 py-1.5 text-[10px] text-gold uppercase font-black tracking-[0.2em] rounded-full border border-gold/20">
                                            {formatDuration(service.duration)} Ritual
                                        </div>
                                    </div>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-serif text-3xl text-white group-hover/card:text-gold transition-colors leading-tight">{service.title}</h3>
                                        </div>
                                        <p className="text-cream/60 text-sm font-light leading-relaxed italic line-clamp-3 pl-4 border-l border-gold/20">
                                            {service.description.toLowerCase().charAt(0).toUpperCase() + service.description.toLowerCase().slice(1)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onBookClick(service.id)}
                                        className="mt-auto w-full py-4 bg-transparent border border-gold/40 text-gold text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gold hover:text-white transition-all duration-500 btn-tactile group/btn rounded-xl"
                                    >
                                        Express Booking <MoveRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile Horizontal Snap Carousel (Visible on < MD) */}
                    <div className="md:hidden relative w-screen -ml-6">
                        <div
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 pb-12 w-full no-scrollbar relative z-20 py-8"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {expressMassages.map((service, index) => (
                                <div
                                    key={service.id}
                                    className="mobile-express-card snap-center shrink-0 w-[75vw] perspective-1000"
                                    style={{ willChange: 'transform, opacity, filter' }}
                                >
                                    <div className="bg-[#111111] border border-gold/30 rounded-[2.5rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.6)] h-full flex flex-col ring-1 ring-white/5 relative overflow-hidden group">
                                        {/* Card Glow Effect */}
                                        <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-gold/10 to-transparent opacity-50"></div>

                                        <div className="relative h-[260px] w-full overflow-hidden mb-5 rounded-2xl shadow-xl ring-1 ring-white/10 flex-shrink-0">
                                            <img
                                                src={service.image_url}
                                                alt={`Express therapy: ${service.title}`}
                                                loading="lazy"
                                                className="w-full h-full object-cover grayscale-[10%]"
                                            />
                                            <div className="absolute top-3 left-3 bg-gold text-white px-3 py-1 text-[9px] uppercase font-black tracking-widest rounded-full shadow-lg z-20">
                                                0{index + 1} / 0{expressMassages.length}
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#111111] to-transparent"></div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2 text-gold mb-1.5">
                                                    <Logo className="w-3 h-3" color="#C5A059" />
                                                    <span className="text-[9px] uppercase tracking-[0.2em] font-black">Express Mastery</span>
                                                </div>
                                                <h3 className="font-serif text-2xl text-white mb-2 leading-tight">{service.title}</h3>
                                                <p className="text-cream/50 text-xs font-light leading-relaxed line-clamp-3">
                                                    {service.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 mt-6">
                                                <div className="text-white font-serif text-xl font-bold">P {service.price}</div>
                                                <button
                                                    onClick={() => onBookClick(service.id)}
                                                    className="flex-1 py-3.5 bg-gold text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 rounded-xl active:scale-95 transition-transform shadow-lg shadow-gold/10"
                                                >
                                                    Reserve <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Spacer at the end for comfortable scrolling */}
                            <div className="w-6 shrink-0"></div>
                        </div>

                        {/* Scroll Indicator Hint - Renovated */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-2 w-full">
                            <div className="bg-gold/90 backdrop-blur-md text-[#1A1A1A] px-6 py-2 rounded-full border border-white/20 shadow-[0_4px_20px_rgba(197,160,89,0.3)] flex items-center gap-3 animate-pulse-slow">
                                <ChevronRight className="w-4 h-4 rotate-180 opacity-50" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Swipe to Explore</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ExpressSection;
