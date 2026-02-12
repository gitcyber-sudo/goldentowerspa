
import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const Philosophy: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  const quote = "We believe that wellness is not a luxury, but a necessity for the soul. At Golden Tower Spa, we blend the architectural elegance of Paris with the warm, healing hands of Oriental Mindoro.";

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const words = textRef.current?.querySelectorAll('.word-reveal');

      if (words && words.length > 0) {
        gsap.fromTo(words,
          {
            opacity: 0.1,
            y: 10,
            filter: "blur(4px)",
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: textRef.current,
              start: "top 80%",
              end: "bottom 40%",
              scrub: 1,
            }
          }
        );
      }

      // Decorative line animation
      gsap.fromTo('.phil-line',
        { width: 0 },
        {
          width: '100%',
          duration: 1.5,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: '.phil-line',
            start: "top 90%",
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="philosophy" className="py-32 md:py-48 bg-cream relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4"
          >
            <div className="phil-line h-[1px] bg-gold/30 mb-12"></div>
            <h2 className="text-luxury text-4xl md:text-6xl text-charcoal leading-none mb-6">
              Our <br /> <span className="italic font-light text-gold">Philosophy</span>
            </h2>
            <p className="text-[10px] uppercase tracking-[0.5em] text-gold/60 font-bold mb-4">Establishing a New Standard</p>
          </motion.div>

          <div className="lg:col-span-8">
            <p ref={textRef} className="text-luxury text-3xl md:text-5xl lg:text-6xl text-charcoal leading-[1.15] mb-16 flex flex-wrap">
              {quote.split(" ").map((word, i) => (
                <span
                  key={i}
                  className="word-reveal mr-3 md:mr-5 inline-block will-change-[opacity,transform,filter]"
                >
                  {word === 'luxury,' ? <span className="italic text-gold">{word}</span> : word}
                </span>
              ))}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 text-charcoal/70 font-sans text-sm md:text-base leading-relaxed tracking-wide"
            >
              <div className="space-y-6">
                <p>
                  Every treatment is a ritual, designed to elevate your senses and ground your spirit. We use only organic, gold-infused oils and locally sourced botanicals to ensure your skin receives nature's purest gifts.
                </p>
                <div className="w-12 h-[1px] bg-gold/40" />
              </div>
              <p>
                Located in the heart of Mansalay, we offer a sanctuary where time slows down, allowing you to reconnect with your inner balance amidst the chaos of modern life.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
