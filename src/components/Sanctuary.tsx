
import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, ArrowUpRight, Smartphone, Facebook } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Sanctuary: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const infoRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Info column reveal
            gsap.from(".sanctuary-info > *", {
                opacity: 0,
                x: -50,
                y: 20,
                stagger: 0.1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".sanctuary-info",
                    start: "top 80%",
                }
            });

            // Map column reveal
            gsap.from(mapRef.current, {
                opacity: 0,
                scale: 0.95,
                x: 50,
                duration: 1.2,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: mapRef.current,
                    start: "top 80%",
                }
            });

            // Header reveal
            gsap.from(".sanctuary-header", {
                opacity: 0,
                y: 30,
                duration: 1,
                scrollTrigger: {
                    trigger: ".sanctuary-header",
                    start: "top 90%",
                }
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.924793657672!2d121.04155779999998!3d14.6602093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b6e16c1c7e09%3A0xdfb38c349bc040fd!2sGoldenTower%20Spa!5e0!3m2!1sen!2sph!4v1770972781276!5m2!1sen!2sph";

    return (
        <section
            ref={sectionRef}
            id="sanctuary"
            className="py-24 md:py-32 bg-gradient-to-b from-cream via-[#f4efe6] to-white relative overflow-hidden"
        >
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="sanctuary-header mb-16 md:mb-24">
                    <span className="text-gold font-bold uppercase tracking-[0.4em] text-xs mb-3 block">Our Physical Space</span>
                    <h2 className="font-serif text-5xl md:text-7xl text-charcoal leading-tight">
                        Visit the <span className="italic text-gold-dark">Sanctuary</span>
                    </h2>
                    <div className="w-24 h-1 bg-gold mt-8 opacity-50"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Info Column */}
                    <div ref={infoRef} className="lg:col-span-5 sanctuary-info space-y-10">
                        <div className="space-y-4">
                            <h3 className="font-serif text-3xl text-charcoal flex items-center gap-3">
                                <MapPin className="text-gold" size={28} />
                                Our Location
                            </h3>
                            <p className="text-xl text-charcoal-light leading-relaxed font-light pl-10">
                                #1 C2 Road 9, Project 6,<br />
                                Quezon City, 1100 Philippines
                            </p>
                            <div className="pt-4 pl-0 md:pl-10 w-full">
                                <a
                                    href="https://maps.app.goo.gl/RFCcVV3BNYQpedC17"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full md:w-auto flex items-center gap-4 bg-gradient-to-r from-charcoal to-charcoal/90 text-white py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-gold/20 transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden border border-gold/10"
                                >
                                    {/* Shimmer effect on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transition: 'transform 0.8s ease, opacity 0.3s ease' }} />

                                    <div className="bg-gold/20 p-3 rounded-xl group-hover:bg-gold/30 transition-colors">
                                        <MapPin size={22} className="text-gold" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-bold text-sm tracking-wide block">Click here for directions</span>
                                        <span className="text-[11px] text-white/50 font-light">Opens in Google Maps · Just minutes away</span>
                                    </div>
                                    <ArrowUpRight size={20} className="text-gold group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 md:gap-12 lg:gap-10">
                            <div className="space-y-4">
                                <h3 className="font-serif text-2xl text-charcoal flex items-center gap-3">
                                    <Clock className="text-gold" size={24} />
                                    Business Hours
                                </h3>
                                <div className="pl-9 space-y-2 text-charcoal-light font-light">
                                    <div className="flex justify-between border-b border-gold/10 pb-1">
                                        <span>Monday - Sunday</span>
                                        <span className="font-medium text-charcoal">4:00 PM - 4:00 AM</span>
                                    </div>
                                    <p className="text-xs italic text-gold/60 mt-2">Available for home services within the same hours.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-serif text-2xl text-charcoal flex items-center gap-3">
                                    <Phone className="text-gold" size={24} />
                                    Connect
                                </h3>
                                <div className="pl-9 space-y-3">
                                    <a href="mailto:gtowerspa@gmail.com" className="flex items-center gap-3 text-charcoal-light hover:text-gold transition-colors font-light">
                                        <Mail size={16} className="text-gold/50" />
                                        gtowerspa@gmail.com
                                    </a>
                                    <a href="tel:09228262336" className="flex items-center gap-3 text-charcoal-light hover:text-gold transition-colors font-light">
                                        <Smartphone size={16} className="text-gold/50" />
                                        09228262336
                                    </a>
                                    <p className="text-xs text-charcoal/40 uppercase tracking-widest font-bold pt-2">Social Hubs</p>
                                    <div className="flex gap-4">
                                        <a href="https://www.facebook.com/profile.php?id=100063262268519" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-charcoal-light hover:text-gold transition-colors font-medium border border-gold/20 px-4 py-2 rounded-full hover:bg-gold/5">
                                            <Facebook size={16} className="text-gold" />
                                            Facebook
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gold/5 border-l-4 border-gold p-6 rounded-r-2xl mt-12">
                            <p className="text-sm italic text-charcoal-light leading-relaxed">
                                "We believe that wellness is not a luxury, but a necessity for the soul. At Golden Tower Spa, we blend architectural elegance with the warm, healing hands of Quezon City."
                            </p>
                        </div>
                    </div>

                    {/* Map Column */}
                    <div
                        ref={mapRef}
                        className="lg:col-span-7 h-[500px] lg:h-[700px] w-full relative group"
                    >
                        <div className="absolute inset-0 bg-gold/10 rounded-[40px] translate-x-4 translate-y-4 -z-10 transition-transform group-hover:translate-x-6 group-hover:translate-y-6 duration-700"></div>
                        <div className="w-full h-full overflow-hidden rounded-[40px] border border-gold/20 shadow-2xl relative">
                            <iframe
                                src={mapSrc}
                                className="w-full h-full grayscale-[20%] contrast-[1.1] hover:grayscale-0 transition-all duration-1000 border-none"
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Golden Tower Spa Location"
                            ></iframe>
                            {/* Luxury Frame Overlay */}
                            <div className="absolute inset-0 pointer-events-none border-[20px] border-white/10 ring-1 ring-gold/20 rounded-[40px]"></div>
                        </div>

                        <div className="absolute -bottom-6 -right-6 md:right-12 bg-white p-6 rounded-2xl shadow-xl border border-gold/10 max-w-[200px] hidden md:block">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-gold mb-1">Quezon City</p>
                            <p className="text-xs text-charcoal/60 leading-relaxed font-light">A sanctuary within the heart of the city, designed for your rebirth.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Sanctuary;
