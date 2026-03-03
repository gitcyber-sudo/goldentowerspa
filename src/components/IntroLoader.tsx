import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Logo from './Logo';

interface IntroLoaderProps {
    onComplete: () => void;
}

// Minimum time (ms) the loader stays visible so the animation always plays
const MIN_DISPLAY_TIME = 3000;

const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const [animationSequenceDone, setAnimationSequenceDone] = useState(false);
    const [minTimePassed, setMinTimePassed] = useState(false);
    const [visualProgress, setVisualProgress] = useState(0);

    // ── Minimum display timer ──
    useEffect(() => {
        const timer = setTimeout(() => setMinTimePassed(true), MIN_DISPLAY_TIME);
        return () => clearTimeout(timer);
    }, []);

    // ── Cinematic entrance animation ──
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const spans = textRef.current?.querySelectorAll('span') || [];

        const mainTl = gsap.timeline({
            onComplete: () => setAnimationSequenceDone(true)
        });

        // Logo fade in
        mainTl.to(logoRef.current, {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: "power4.out",
            delay: 0.3
        })
            // Text reveal (staggered)
            .to([...spans], {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.15,
                ease: "power2.out"
            }, "-=0.8");

        return () => {
            mainTl.kill();
            document.body.style.overflow = '';
        };
    }, []);

    // ── Smooth visual progress bar (purely cosmetic, independent of real assets) ──
    useEffect(() => {
        const proxy = { value: 0 };

        const anim = gsap.to(proxy, {
            value: 100,
            duration: 2.8,
            ease: "power2.inOut",
            onUpdate: () => {
                setVisualProgress(Math.round(proxy.value));
            },
        });

        return () => { anim.kill(); };
    }, []);

    // ── Sync progress bar width ──
    useEffect(() => {
        if (progressBarRef.current) {
            gsap.to(progressBarRef.current, {
                width: `${visualProgress}%`,
                duration: 0.1,
                ease: "none"
            });
        }
    }, [visualProgress]);

    // ── Exit transition — waits for BOTH animation + minimum time ──
    useEffect(() => {
        if (animationSequenceDone && minTimePassed) {
            const exitTl = gsap.timeline({
                onComplete: () => {
                    document.body.style.overflow = '';
                    onComplete();
                }
            });

            exitTl.to(logoRef.current, {
                scale: 1.05,
                duration: 0.8,
                ease: "sine.inOut"
            })
                .to(contentRef.current, {
                    y: -50,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.in"
                })
                .to(containerRef.current, {
                    yPercent: -100,
                    duration: 1.1,
                    ease: "expo.inOut"
                }, "-=0.3");
        }
    }, [animationSequenceDone, minTimePassed, onComplete]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] bg-cream flex flex-col items-center justify-center overflow-hidden"
        >
            <div ref={contentRef} className="relative flex flex-col items-center">
                {/* Cinematic ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] animate-pulse" />

                <div ref={logoRef} className="mb-10 relative" style={{ opacity: 0, transform: 'scale(0.8) translateY(10px)' }}>
                    <div className="absolute inset-0 bg-gold/20 rounded-full blur-2xl scale-125 opacity-50" />
                    <Logo className="h-28 w-28 md:h-40 md:w-40 relative z-10" color="#C5A059" />
                </div>

                <div ref={textRef} className="flex flex-col items-center relative z-10">
                    <div className="overflow-hidden mb-2">
                        <h1 className="font-serif text-5xl md:text-7xl text-charcoal tracking-tight flex gap-4">
                            <span style={{ opacity: 0, transform: 'translateY(25px)' }}>Golden</span>
                            <span style={{ opacity: 0, transform: 'translateY(25px)' }}>Tower</span>
                        </h1>
                    </div>
                    <div className="overflow-hidden">
                        <span className="text-gold italic font-serif text-3xl md:text-4xl tracking-widest block" style={{ opacity: 0, transform: 'translateY(25px)' }}>Spa</span>
                    </div>

                    {/* Progress Section */}
                    <div className="mt-12 flex flex-col items-center w-64 md:w-80">
                        <div className="w-full h-[2px] bg-gold/10 rounded-full overflow-hidden relative">
                            <div
                                ref={progressBarRef}
                                className="absolute top-0 left-0 h-full bg-gold shadow-[0_0_10px_rgba(197,160,89,0.5)]"
                                style={{ width: '0%' }}
                            />
                        </div>
                        <div className="mt-4 flex items-center justify-between w-full">
                            <span className="text-[10px] text-charcoal/30 uppercase tracking-[0.2em] font-black">Loading Experience</span>
                            <span className="text-[10px] text-gold font-black tabular-nums">{visualProgress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative corners for a "frame" feel */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-gold/20 rounded-tl-2xl" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-gold/20 rounded-tr-2xl" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-gold/20 rounded-bl-2xl" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-gold/20 rounded-br-2xl" />
        </div>
    );
};

export default IntroLoader;
