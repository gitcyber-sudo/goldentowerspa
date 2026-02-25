import React, { useLayoutEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import { Crown, Heart, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSEO } from '../hooks/useSEO';

gsap.registerPlugin(ScrollTrigger);

const About: React.FC = () => {
    useSEO({
        title: 'About Us — Traditional Hilot Spa in Quezon City',
        description: 'Learn about Golden Tower Spa, Quezon City\'s premier sanctuary for traditional Filipino Hilot massage and luxury wellness. Meet our master therapists in Project 6, QC.',
        keywords: 'about golden tower spa, hilot spa quezon city, traditional filipino massage, spa history quezon city, wellness center manila, project 6 spa',
        canonicalPath: '/about'
    });
    const heroRef = useRef<HTMLDivElement>(null);
    const storyRef = useRef<HTMLDivElement>(null);
    const valuesRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Hero Animation
            gsap.from(".hero-text", {
                opacity: 0,
                y: 50,
                duration: 1.5,
                ease: "power3.out",
                stagger: 0.2
            });

            // Story Section Animation
            gsap.from(".story-reveal", {
                opacity: 0,
                y: 30,
                duration: 1,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: storyRef.current,
                    start: "top 70%",
                }
            });

            // Values Animation
            // Values Animation - Robust Pattern
            const cards = gsap.utils.toArray(".value-card");

            // Set initial state
            gsap.set(cards, {
                autoAlpha: 0,
                y: 50
            });

            // Animate to final state
            gsap.to(cards, {
                autoAlpha: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: valuesRef.current,
                    start: "top 90%", // Start earlier (when top of section hits bottom 10% of viewport)
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });

        });
        return () => ctx.revert();
    }, []);

    return (
        <div className="bg-cream min-h-screen">
            <Header onBookClick={() => window.location.href = '/#book'} onLoginClick={() => { }} />

            {/* --- HERO SECTION --- */}
            <section ref={heroRef} className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop"
                        alt="Golden Tower Spa Interior"
                        className="w-full h-full object-cover brightness-[0.4]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-cream/90"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <div className="hero-text mb-6 flex justify-center">
                        <Logo color="white" className="w-16 h-16 md:w-24 md:h-24 opacity-90" />
                    </div>
                    <span className="hero-text block text-gold text-sm md:text-base font-bold uppercase tracking-[0.4em] mb-4">The Legacy</span>
                    <h1 className="hero-text font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight">
                        Our <span className="text-gold italic">Story</span>
                    </h1>
                    <p className="hero-text text-white/80 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                        Where ancient healing traditions meet modern architectural elegance in the heart of Quezon City.
                    </p>
                </div>
            </section>

            {/* --- THE NARRATIVE --- */}
            <section ref={storyRef} className="py-20 md:py-32 px-6">
                <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 story-reveal">
                        <h2 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight">
                            More than just a <span className="italic text-gold">Spa</span>.
                        </h2>
                        <div className="w-24 h-1 bg-gold opacity-50"></div>
                        <p className="text-charcoal-light text-lg leading-relaxed font-light">
                            Golden Tower Spa was born from a singular vision: to create a sanctuary where time stands still. Located in the bustling Project 6 district of Quezon City, we stand as a beacon of tranquility amidst the urban chaos.
                        </p>
                        <p className="text-charcoal-light text-lg leading-relaxed font-light">
                            We believe that true wellness lies in the harmony of space and touch. Our therapists are true artisans, masters of the traditional Hilot, trained to not just relieve tension, but to restore balance to your entire being.
                        </p>
                        <div className="pt-4">
                            <img src="/signature.png" alt="Founder's Signature" className="h-16 opacity-60" />
                        </div>
                    </div>
                    <div className="relative h-[600px] w-full story-reveal rounded-t-full rounded-b-2xl overflow-hidden shadow-2xl border-4 border-white">
                        <img
                            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1920&auto=format&fit=crop"
                            alt="Therapeutic Session"
                            className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 border-[20px] border-white/10 rounded-t-full rounded-b-2xl pointer-events-none"></div>
                    </div>
                </div>
            </section>

            {/* --- CORE VALUES --- */}
            <section ref={valuesRef} className="py-20 md:py-32 bg-white relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cream to-transparent"></div>
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <span className="text-gold text-xs font-bold uppercase tracking-[0.3em] block mb-4">Our Pillars</span>
                        <h2 className="font-serif text-4xl md:text-5xl text-charcoal">The Golden Standard</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Crown, title: "Excellence", desc: "We refuse to settle for anything less than perfection in every treatment." },
                            { icon: Heart, title: "Compassion", desc: "Every touch is guided by genuine care and a desire to heal." },
                            { icon: Shield, title: "Integrity", desc: "We use only premium, organic oils and maintain the highest hygiene standards." },
                            { icon: Logo, title: "Serenity", desc: "Our space is acoustically tuned to silence the noise of the outside world." }
                        ].map((item, i) => (
                            <div key={i} className="value-card bg-cream p-8 rounded-2xl border border-gold/20 hover:border-gold/40 shadow-sm hover:shadow-gold transition-all duration-300 group text-center">
                                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="text-gold" size={28} />
                                </div>
                                <h3 className="font-serif text-xl text-charcoal mb-4">{item.title}</h3>
                                <p className="text-charcoal-light text-sm font-light leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
