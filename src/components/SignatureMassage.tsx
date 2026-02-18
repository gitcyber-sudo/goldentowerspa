import React, { useEffect, useRef } from 'react';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SignatureMassageProps {
  onBookClick: (id: string) => void;
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: string;
  };
}

const SignatureMassage: React.FC<SignatureMassageProps> = ({ onBookClick, service }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    const content = contentRef.current;
    const logo = logoRef.current;

    if (!container || !image || !content || !logo) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.fromTo(
      container,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
      .fromTo(
        image,
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' },
        '-=0.6'
      )
      .fromTo(
        logo,
        { opacity: 0, rotation: -20, scale: 0.8 },
        { opacity: 0.15, rotation: 0, scale: 1, duration: 1.5, ease: 'elastic.out(1, 0.5)' },
        '-=1.0'
      )
      .fromTo(
        content.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)' },
        '-=0.8'
      );

    // Parallax effect for image
    gsap.to(image, {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl mb-24 group isolate"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        <img
          ref={imageRef}
          src="/services/signature-massage.png"
          alt="Golden Tower Signature Massage"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Decorative Golden Logo Watermark */}
      <svg
        ref={logoRef}
        viewBox="0 0 24 24"
        className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] text-gold pointer-events-none z-0 opacity-10"
        fill="currentColor"
      >
        <path d="M12,2L11.5,5.5H12.5L12,2ZM11.4,6.5L11,10.5H13L12.6,6.5H11.4ZM11.1,11.5L10,17H14L12.9,11.5H11.1ZM9.1,18.5L7.5,22H10.1C10.1,22 10.3,20.5 12,20.5C13.7,20.5 13.9,22 13.9,22H16.5L14.9,18.5H9.1ZM12,13.5H12C12,13.5 11,13.5 11,14.5C11,15.5 12,15.5 12,15.5H12V13.5ZM6.5,22L6,24.5H9L8.5,22H6.5ZM17.5,22L18,24.5H15L15.5,22H17.5Z" />
      </svg>

      {/* Content */}
      <div className="relative z-20 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 text-white">
        <div ref={contentRef} className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-gold text-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg backdrop-blur-sm">
              The Pinnacle of Relaxation
            </span>
            <div className="flex gap-1 text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" className="animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </div>

          <h3 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">
            Golden Tower <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold font-italic">
              Signature Massage
            </span>
          </h3>

          <p className="text-gray-200 text-lg md:text-xl font-light leading-relaxed mb-8 border-l-2 border-gold pl-6">
            "{service.description}"
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-2 pr-6 border border-white/10 hover:bg-white/20 transition-colors cursor-default">
              <div className="bg-gold p-3 rounded-xl shadow-inner">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-gold-light uppercase tracking-widest font-bold">Investment</p>
                <p className="text-2xl font-serif">P {service.price}</p>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-white/20 hidden sm:block" />

             <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Duration</p>
                <p className="text-lg font-light flex items-center gap-2">
                   {service.duration}
                </p>
              </div>
          </div>

        </div>

        <div className="mt-8 md:mt-0">
            <button
            onClick={() => onBookClick(service.id)}
            className="group relative px-8 py-4 bg-gradient-to-r from-gold to-yellow-600 rounded-full overflow-hidden shadow-[0_0_40px_-10px_rgba(255,215,0,0.6)] hover:shadow-[0_0_60px_-5px_rgba(255,215,0,0.8)] transition-all duration-500 transform hover:scale-105"
            >
            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors duration-500" />
            <div className="relative flex items-center gap-3 font-bold tracking-widest uppercase text-sm text-white">
                Book Experience
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureMassage;
