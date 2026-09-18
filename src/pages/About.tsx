import React, { useLayoutEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import { Crown, Heart, Shield, Sparkles, Feather, Users, Award, MapPin, Clock, Phone } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSEO } from '../hooks/useSEO';

gsap.registerPlugin(ScrollTrigger);

const About: React.FC = () => {
    useSEO({
        title: 'Our Story & Philosophy — Golden Tower Spa Quezon City',
        description: 'Discover the legacy of Golden Tower Spa. A sanctuary where traditional Filipino Hilot meets modern luxury. Experience the touch of mastery in the heart of Quezon City.',
        keywords: 'about golden tower spa, hilot tradition, wellness philosophy, luxury spa qc, master therapists philippines, project 6 wellness',
        canonicalPath: '/about'
    });

    const rootRef = useRef<HTMLDivElement>(null);
    const heroImageRef = useRef<HTMLImageElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Hero Image Ken Burns Effect
            gsap.to(heroImageRef.current, {
                scale: 1.1,
                duration: 20,
                repeat: -1,
                yoyo: true,
                ease: "none"
            });

            // Hero Text Reveal
            const tl = gsap.timeline();
            tl.fromTo(".about-hero-reveal",
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "expo.out" }
            ).fromTo(".scroll-indicator",
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
                "-=0.5"
            );

            // Section Reveals — use fromTo to explicitly set opacity: 1 as target
            const reveals = gsap.utils.toArray('.about-reveal');
            reveals.forEach((el: any) => {
                gsap.fromTo(el,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 1, ease: "power3.out",
                        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" }
                    }
                );
            });

            // Image Parallax/Reveal
            gsap.fromTo(".about-image-reveal",
                { scale: 1.1, opacity: 0 },
                {
                    scale: 1, opacity: 1, duration: 1.5, ease: "expo.out",
                    scrollTrigger: { trigger: ".about-image-reveal", start: "top 80%" }
                }
            );

            // Value Cards Grid Animation
            gsap.fromTo(".value-card",
                { scale: 0.9, opacity: 0, y: 30 },
                {
                    scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.4)",
                    scrollTrigger: { trigger: ".values-grid", start: "top 85%" }
                }
            );

            // Stat counter animation
            gsap.fromTo(".stat-item",
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: "power2.out",
                    scrollTrigger: { trigger: ".stats-row", start: "top 85%" }
                }
            );

        }, rootRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={rootRef} className="bg-cream min-h-screen selection:bg-gold selection:text-white overflow-x-hidden">
            <Header onBookClick={() => window.location.href = '/#book'} onLoginClick={() => { }} />

            {/* ═══ CINEMATIC HERO ═══ */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 bg-charcoal-dark">
                    <img
                        ref={heroImageRef}
                        src="https://images.unsplash.com/photo-1544161515-4af6b1d4640b?q=80&w=2070&auto=format&fit=crop"
                        alt="Golden Tower Spa Sanctuary"
                        className="w-full h-full object-cover brightness-[0.4]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-charcoal/20 to-cream"></div>
                </div>

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <div className="about-hero-reveal mb-8 flex justify-center" style={{ opacity: 0 }}>
                        <div className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                            <Logo color="white" className="w-12 h-12 md:w-16 md:h-16 opacity-90" />
                        </div>
                    </div>
                    <h1 className="about-hero-reveal font-serif text-6xl md:text-8xl lg:text-9xl text-white mb-8 leading-[0.9] tracking-tighter" style={{ opacity: 0 }}>
                        The touch of <span className="text-gold italic font-normal">Legacy.</span>
                    </h1>
                    <p className="about-hero-reveal text-white/70 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed uppercase tracking-widest" style={{ opacity: 0 }}>
                        Crafting silence and rejuvenation in the heart of Quezon City since 2018.
                    </p>
                </div>


            </section>

            {/* ═══ OUR ORIGINS ═══ */}
            <section className="py-24 md:py-40 px-6 relative">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative h-[500px] md:h-[700px] group about-reveal" style={{ opacity: 0 }}>
                            <div className="absolute -inset-4 bg-gold/5 rounded-[40px] translate-x-4 translate-y-4 -z-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700"></div>
                            <div className="w-full h-full overflow-hidden rounded-[40px] border border-gold/10 shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1920&auto=format&fit=crop"
                                    alt="Traditional Healing Service"
                                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                                />
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 space-y-8 about-reveal" style={{ opacity: 0 }}>
                            <span className="text-gold font-bold uppercase tracking-[0.4em] text-xs block">Our Origins</span>
                            <h2 className="font-serif text-5xl md:text-6xl text-charcoal leading-[1.1]">
                                A Beacon of <span className="italic text-gold-dark">Tranquility.</span>
                            </h2>
                            <div className="w-24 h-1 bg-gold opacity-50"></div>
                            <div className="space-y-6 text-charcoal-light text-lg md:text-xl font-light leading-relaxed">
                                <p>
                                    Golden Tower Spa was born from a singular vision: to create a sanctuary where time stands still. Located in the bustling Project 6 district, we provide an escape from the relentless pace of urban life.
                                </p>
                                <p>
                                    We believe that true wellness is an architectural experience—one that begins with the silence of the space and ends with the transformative power of touch.
                                </p>
                            </div>
                            <div className="pt-8 flex items-center gap-6 group cursor-default">
                                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                                    <Sparkles className="text-gold" size={24} />
                                </div>
                                <div>
                                    <p className="font-serif text-xl text-charcoal italic">"Elegance is the only beauty that never fades."</p>
                                    <p className="text-[10px] uppercase tracking-widest text-gold font-bold mt-1">— Our Founding Philosophy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ THE ART OF HILOT ═══ */}
            <section className="py-24 md:py-40 bg-charcoal text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold via-transparent to-transparent pointer-events-none"></div>
                <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
                    <div className="about-reveal flex justify-center mb-6 text-gold/60" style={{ opacity: 0 }}>
                        <Feather size={40} />
                    </div>
                    <h2 className="about-reveal font-serif text-4xl md:text-6xl mb-12 leading-tight" style={{ opacity: 0 }}>
                        The Wisdom of <span className="text-gold italic font-normal underline decoration-gold/30 underline-offset-8">Ancestral</span> Healing
                    </h2>
                    <p className="about-reveal text-white/60 text-lg md:text-2xl font-light leading-relaxed mb-16 italic" style={{ opacity: 0 }}>
                        "In every Hilot session, we don't just move muscles; we listen to the body's hidden narrative, diagnosing through the pulse and healing through the soul."
                    </p>
                    <div className="about-reveal grid grid-cols-1 md:grid-cols-3 gap-12 text-center border-t border-white/10 pt-16 stats-row" style={{ opacity: 0 }}>
                        <div className="space-y-4 stat-item" style={{ opacity: 0 }}>
                            <span className="text-gold font-bold text-4xl block font-serif italic">800+</span>
                            <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Years of Tradition</span>
                        </div>
                        <div className="space-y-4 stat-item" style={{ opacity: 0 }}>
                            <span className="text-gold font-bold text-4xl block font-serif italic">Pure</span>
                            <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Organic Ingredients</span>
                        </div>
                        <div className="space-y-4 stat-item" style={{ opacity: 0 }}>
                            <span className="text-gold font-bold text-4xl block font-serif italic">Master</span>
                            <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Trained Artisans</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ THE HANDS BEHIND THE GOLD ═══ */}
            <section className="py-24 md:py-40 bg-white relative">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-1 hidden lg:block">
                            <div className="vertical-text text-gold/20 font-serif text-8xl pointer-events-none select-none italic whitespace-nowrap -rotate-90">Mastery.</div>
                        </div>

                        <div className="lg:col-span-5 space-y-8 about-reveal" style={{ opacity: 0 }}>
                            <span className="text-gold text-xs font-bold uppercase tracking-[0.4em] block">Our Workforce</span>
                            <h2 className="font-serif text-4xl md:text-6xl text-charcoal leading-tight">
                                Meet the <span className="italic text-gold-dark">Curators</span> of Calm.
                            </h2>
                            <p className="text-charcoal-light text-lg font-light leading-relaxed">
                                At Golden Tower Spa, we don't just employ therapists; we cultivate artisans. Every member of our team undergoes rigorous training in both traditional Philippine Hilot and modern therapeutic sciences.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    { icon: Award, text: "NCII Certified Practitioners" },
                                    { icon: Users, text: "Specialized in Pre-natal & Sports Therapy" },
                                    { icon: Shield, text: "Commitment to Ethical Wellness" }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-charcoal/80 font-medium">
                                        <div className="bg-gold/10 p-2 rounded-lg text-gold"><item.icon size={18} /></div>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-6">
                                <button
                                    onClick={() => window.location.href = '/#therapists'}
                                    className="bg-charcoal text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-gold transition-colors shadow-xl"
                                >
                                    Meet the Team
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-6 about-reveal" style={{ opacity: 0 }}>
                            <div className="aspect-[4/5] bg-cream rounded-[40px] overflow-hidden relative group shadow-2xl border border-gold/10">
                                <img
                                    src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=2070&auto=format&fit=crop"
                                    alt="Master Therapist at Work"
                                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-10 left-10 text-white translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <p className="font-serif text-2xl italic">Precision & Grace.</p>
                                    <p className="text-xs uppercase tracking-widest text-gold/80 mt-1">The Golden touch</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CORE VALUES ═══ */}
            <section className="py-24 md:py-40 bg-cream/50 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24 about-reveal" style={{ opacity: 0 }}>
                        <span className="text-gold text-xs font-bold uppercase tracking-[0.4em] block mb-4">The Golden Standard</span>
                        <h2 className="font-serif text-4xl md:text-6xl text-charcoal">Our Core Pillars</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 values-grid">
                        {[
                            { icon: Crown, title: "Excellence", desc: "Crafting perfection in every stroke, ensuring an unmatched sanctuary experience." },
                            { icon: Heart, title: "Compassion", desc: "Every session is a conversation of care, healing both the body and the spirit." },
                            { icon: Shield, title: "Integrity", desc: "Using only nature's finest ingredients with the highest clinical standards." },
                            { icon: Sparkles, title: "Serenity", desc: "Acoustically tuned spaces designed to whisper silence to your soul." }
                        ].map((item, i) => (
                            <div key={i} className="value-card bg-white p-10 rounded-[32px] border border-gold/10 hover:border-gold/40 shadow-sm hover:shadow-2xl hover:shadow-gold/10 transition-all duration-500 group relative overflow-hidden" style={{ opacity: 0 }}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-gold/10 transition-colors"></div>
                                <div className="bg-cream w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:bg-gold transition-all duration-500">
                                    <item.icon className="text-gold group-hover:text-white transition-colors" size={32} />
                                </div>
                                <h3 className="font-serif text-2xl text-charcoal mb-4">{item.title}</h3>
                                <p className="text-charcoal-light text-sm font-light leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ VISIT US — LOCATION INFO ═══ */}
            <section className="py-24 md:py-32 bg-charcoal-dark text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="container mx-auto px-6 max-w-5xl relative z-10">
                    <div className="text-center mb-16 about-reveal" style={{ opacity: 0 }}>
                        <span className="text-gold text-xs font-bold uppercase tracking-[0.4em] block mb-4">Find Your Sanctuary</span>
                        <h2 className="font-serif text-4xl md:text-5xl">Visit Us</h2>
                    </div>
                    <div className="about-reveal grid grid-cols-1 md:grid-cols-3 gap-8" style={{ opacity: 0 }}>
                        {[
                            { icon: MapPin, label: "Location", value: "Project 6, Quezon City, Metro Manila" },
                            { icon: Clock, label: "Hours", value: "Open 24/7 — Everyday" },
                            { icon: Phone, label: "Contact", value: "Walk-ins Welcome · By Appointment" }
                        ].map((item, i) => (
                            <div key={i} className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-gold/30 transition-colors duration-300">
                                <item.icon className="mx-auto text-gold mb-4" size={28} />
                                <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70 font-bold mb-2">{item.label}</p>
                                <p className="text-white/80 font-light">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FINAL CTA ═══ */}
            <section className="py-24 md:py-40 bg-white text-center flex items-center justify-center px-6">
                <div className="max-w-3xl about-reveal" style={{ opacity: 0 }}>
                    <h2 className="font-serif text-4xl md:text-6xl text-charcoal mb-8 leading-tight">
                        Experience the <span className="italic text-gold">Rebirth.</span>
                    </h2>
                    <p className="text-charcoal-light text-lg md:text-xl font-light mb-12 leading-relaxed">
                        Step into our sanctuary and discover that wellness is not just a destination—it's the journey of coming home to yourself.
                    </p>
                    <button
                        onClick={() => window.location.href = '/#book'}
                        className="bg-gold text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-gold-dark transition-all shadow-2xl hover:shadow-gold/30 hover:-translate-y-1 active:scale-95"
                    >
                        Book Your Session
                    </button>
                </div>
            </section>

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
                .vertical-text {
                    writing-mode: vertical-rl;
                }
            ` }} />
        </div>
    );
};

export default About;
