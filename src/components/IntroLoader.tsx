import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Logo from './Logo';
import { useAssetPreloader } from '../hooks/useAssetPreloader';

interface IntroLoaderProps {
    onComplete: () => void;
}

const CRITICAL_ASSETS = [
    '/hero.mp4',
    '/hero.webm',
    '/endless-still-water.mp3',
    '/images/hero-bg.jpg'
];

const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const { totalProgress, isReady } = useAssetPreloader(CRITICAL_ASSETS);
    const [animationSequenceDone, setAnimationSequenceDone] = useState(false);
    const [visualProgress, setVisualProgress] = useState(0);
    const [visualProgressDone, setVisualProgressDone] = useState(false);

    useEffect(() => {
        // Lock scroll while intro is playing
        document.body.style.overflow = 'hidden';

        // Cinematic sequence timeline
        const mainTl = gsap.timeline({
            onComplete: () => setAnimationSequenceDone(true)
        });

        // 1. Content Fade In
        mainTl.to(logoRef.current, {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: "power4.out",
            delay: 0.3
        })
            // 3. Text Reveal (Staggered)
            .to(textRef.current?.children || [], {
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

    const totalProgressRef = useRef(totalProgress);
    useEffect(() => {
        totalProgressRef.current = totalProgress;
    }, [totalProgress]);

    // Sync Visual Progress: Smoothly animate to 100% over a 2.5s duration
    useEffect(() => {
        const proxy = { value: 0 };

        const anim = gsap.to(proxy, {
            value: 100,
            duration: 2.5,
            ease: "power2.inOut",
            onUpdate: () => {
                // Set visual progress based on animated proxy, capped by real download progress
                setVisualProgress(Math.min(Math.round(proxy.value), totalProgressRef.current));
            },
            onComplete: () => setVisualProgressDone(true)
        });

        return () => {
            anim.kill();
        };
    }, []); // Run once on mount

    // Sync Progress Bar Width
    useEffect(() => {
        if (progressBarRef.current) {
            gsap.to(progressBarRef.current, {
                width: `${visualProgress}%`,
                duration: 0.1,
                ease: "none"
            });
        }
    }, [visualProgress]);

    // Final Transition Logic: Wait for ALL sequences to be ready
    useEffect(() => {
        if (animationSequenceDone && isReady && visualProgressDone) {
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
    }, [animationSequenceDone, isReady, visualProgressDone, onComplete]);

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
                            <span style={{ opacity: 0, transform: 'translateY(20px)' }}>Golden</span>
                            <span style={{ opacity: 0, transform: 'translateY(20px)' }}>Tower</span>
                        </h1>
                    </div>
                    <div className="overflow-hidden">
                        <span className="text-gold italic font-serif text-3xl md:text-4xl tracking-widest block" style={{ opacity: 0, transform: 'translateY(20px)' }}>Spa</span>
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
