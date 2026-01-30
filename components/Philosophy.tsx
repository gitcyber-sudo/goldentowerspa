
import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const Philosophy: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  // The text content with escaped quotes
  const quote = "\"We believe that wellness is not a luxury, but a necessity for the soul. At Golden Tower Spa, we blend the architectural elegance of Paris with the warm, healing hands of Quezon City.\"";

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Select all the word spans we created
      const words = textRef.current?.querySelectorAll('.word-reveal');

      if (words && words.length > 0) {
        // Create a timeline linked to scroll
        gsap.fromTo(words,
          {
            opacity: 0.1, // Start very dim
            filter: "blur(2px)", // Slight blur for dreamier effect
          },
          {
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.1, // Staggering creates the left-to-right flow
            ease: "none", // Linear ease is best for scrub
            scrollTrigger: {
              trigger: textRef.current,
              // Adjusted start point to be closer to the center (60% down from top instead of 85%)
              // This delays the start of the reveal until the user has scrolled more.
              start: "top 60%",
              end: "bottom 30%", // Finishes when bottom of text is in upper third
              scrub: 1, // Smooth scrubbing effect
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="philosophy" className="py-24 md:py-32 bg-gradient-to-b from-cream via-[#f4efe6] to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-4 fade-up">
            <div className="w-16 h-1 bg-gold mb-8"></div>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight">
              Our <br /> <span className="italic text-gold-dark">Philosophy</span>
            </h2>
          </div>

          <div className="md:col-span-8">
            {/* 
              Animated Paragraph:
              Text is split into words to allow the stagger effect.
              We use flex-wrap to keep it behaving like a paragraph.
            */}
            <p ref={textRef} className="font-serif text-2xl md:text-3xl text-charcoal leading-relaxed mb-8 flex flex-wrap">
              {quote.split(" ").map((word, i) => (
                <span
                  key={i}
                  className="word-reveal mr-2 md:mr-3 inline-block origin-left will-change-[opacity,filter]"
                >
                  {word}
                </span>
              ))}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-charcoal/80 font-light leading-relaxed fade-up">
              <p>
                Every treatment is a journey, designed to elevate your senses and ground your spirit. We use only organic, gold-infused oils and locally sourced botanicals to ensure your skin receives nature's purest gifts.
              </p>
              <p>
                Located in the heart of Quezon City, we offer a sanctuary where time slows down, allowing you to reconnect with your inner balance amidst the chaos of modern life.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
