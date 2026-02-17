import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Share } from 'lucide-react';
import Logo from './Logo';

export const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Detect iOS
        const isIphone = /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;

        setIsIOS(isIphone);

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (!isStandalone) {
                setTimeout(() => setShowPrompt(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        if (isIphone && !isStandalone) {
            setTimeout(() => setShowPrompt(true), 3000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // Entrance animation
    useEffect(() => {
        if (showPrompt && cardRef.current) {
            const el = cardRef.current;
            el.style.opacity = '0';
            el.style.transform = 'translateX(-50%) translateY(40px) scale(0.95)';
            requestAnimationFrame(() => {
                el.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
                el.style.opacity = '1';
                el.style.transform = 'translateX(-50%) translateY(0) scale(1)';
            });
        }
    }, [showPrompt]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        if (cardRef.current) {
            const el = cardRef.current;
            el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            el.style.opacity = '0';
            el.style.transform = 'translateX(-50%) translateY(40px) scale(0.95)';
            setTimeout(() => setShowPrompt(false), 300);
        } else {
            setShowPrompt(false);
        }
    };

    if (!showPrompt) return null;

    return (
        <div
            ref={cardRef}
            className="fixed bottom-5 left-1/2 z-[9999] w-[92%] max-w-[420px]"
            style={{ transform: 'translateX(-50%)' }}
        >
            <style>{`
                @keyframes pwa-shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes pwa-glow-pulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(153,123,61,0.15), 0 0 60px rgba(153,123,61,0.05); }
                    50% { box-shadow: 0 0 30px rgba(153,123,61,0.3), 0 0 80px rgba(153,123,61,0.1); }
                }
                @keyframes pwa-logo-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes pwa-ring-rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .pwa-card {
                    background: linear-gradient(145deg, rgba(20,20,20,0.97) 0%, rgba(30,25,18,0.98) 50%, rgba(20,20,20,0.97) 100%);
                    backdrop-filter: blur(24px) saturate(1.5);
                    -webkit-backdrop-filter: blur(24px) saturate(1.5);
                    border: 1px solid rgba(153,123,61,0.25);
                    border-radius: 24px;
                    animation: pwa-glow-pulse 3s ease-in-out infinite;
                }
                .pwa-shimmer-bar {
                    background: linear-gradient(90deg, transparent, rgba(153,123,61,0.12), transparent);
                    background-size: 200% 100%;
                    animation: pwa-shimmer 3s ease-in-out infinite;
                }
                .pwa-logo-icon {
                    animation: pwa-logo-float 3s ease-in-out infinite;
                }
                .pwa-ring {
                    animation: pwa-ring-rotate 8s linear infinite;
                }
                .pwa-install-btn {
                    background: linear-gradient(135deg, #997B3D 0%, #C9A84C 50%, #997B3D 100%);
                    background-size: 200% 200%;
                    transition: all 0.3s ease;
                }
                .pwa-install-btn:hover {
                    background-position: 100% 100%;
                    transform: translateY(-1px);
                    box-shadow: 0 8px 24px rgba(153,123,61,0.4);
                }
                .pwa-install-btn:active {
                    transform: scale(0.97);
                }
            `}</style>

            <div className="pwa-card relative overflow-hidden p-5">
                {/* Top shimmer line */}
                <div className="pwa-shimmer-bar absolute top-0 left-0 right-0 h-[1px]" />

                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3.5 right-3.5 p-1.5 rounded-full transition-all duration-200 z-10"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Background orbs */}
                <div
                    className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(153,123,61,0.12) 0%, transparent 70%)' }}
                />
                <div
                    className="absolute -bottom-20 -left-10 w-36 h-36 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(153,123,61,0.08) 0%, transparent 70%)' }}
                />

                <div className="flex items-start gap-4 relative z-[1]">
                    {/* Logo area with animated ring */}
                    <div className="relative flex-shrink-0" style={{ width: '56px', height: '56px' }}>
                        {/* Rotating ring */}
                        <svg className="pwa-ring absolute inset-0 w-full h-full" viewBox="0 0 56 56">
                            <defs>
                                <linearGradient id="pwa-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#997B3D" stopOpacity="0.8" />
                                    <stop offset="50%" stopColor="#C9A84C" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#997B3D" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx="28" cy="28" r="26"
                                fill="none"
                                stroke="url(#pwa-ring-grad)"
                                strokeWidth="1.5"
                                strokeDasharray="40 120"
                                strokeLinecap="round"
                            />
                        </svg>
                        {/* Logo container */}
                        <div
                            className="pwa-logo-icon absolute inset-[6px] rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(145deg, rgba(153,123,61,0.2) 0%, rgba(153,123,61,0.08) 100%)',
                                border: '1px solid rgba(153,123,61,0.2)'
                            }}
                        >
                            <Logo className="h-6 w-6" color="#C9A84C" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                        {/* Title */}
                        <h3
                            className="font-serif text-base font-bold leading-tight mb-1"
                            style={{ color: 'rgba(255,255,255,0.92)' }}
                        >
                            {isIOS ? 'Add to Home Screen' : 'Golden Tower Spa'}
                        </h3>

                        {isIOS ? (
                            <div className="space-y-2.5 mt-2.5">
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: '1.4' }}>
                                    Get the full luxury experience:
                                </p>
                                {/* Step 1 */}
                                <div
                                    className="flex items-center gap-3 p-2.5 rounded-xl"
                                    style={{ background: 'rgba(153,123,61,0.08)', border: '1px solid rgba(153,123,61,0.12)' }}
                                >
                                    <div
                                        className="flex items-center justify-center rounded-lg flex-shrink-0"
                                        style={{ width: '30px', height: '30px', background: 'rgba(153,123,61,0.15)' }}
                                    >
                                        <Share className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                        Tap <strong style={{ color: '#C9A84C' }}>Share</strong> in your browser
                                    </span>
                                </div>
                                {/* Step 2 */}
                                <div
                                    className="flex items-center gap-3 p-2.5 rounded-xl"
                                    style={{ background: 'rgba(153,123,61,0.08)', border: '1px solid rgba(153,123,61,0.12)' }}
                                >
                                    <div
                                        className="flex items-center justify-center rounded-lg flex-shrink-0"
                                        style={{ width: '30px', height: '30px', background: 'rgba(153,123,61,0.15)' }}
                                    >
                                        <span style={{ color: '#C9A84C', fontSize: '16px', fontWeight: 'bold' }}>+</span>
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                        Select <strong style={{ color: '#C9A84C' }}>Add to Home Screen</strong>
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', lineHeight: '1.5', marginBottom: '14px' }}>
                                    Install for instant booking access &amp; exclusive offers
                                </p>

                                <button
                                    onClick={handleInstallClick}
                                    className="pwa-install-btn w-full text-white font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-2.5"
                                    style={{ fontSize: '13px', letterSpacing: '0.05em' }}
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Install App</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom accent */}
                <div
                    className="absolute bottom-0 left-[10%] right-[10%] h-[1px]"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(153,123,61,0.2), transparent)' }}
                />
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
