import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // 1. Character Split Animations (Hero Title)
      const chars = document.querySelectorAll('.char-animate');
      if (chars.length > 0) {
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power4.out',
          stagger: 0.05,
          delay: 0.2
        });
      }

      // 2. Polished Section Transitions (Requested Change)
      // We target all elements with 'section-reveal' class
      const sections = document.querySelectorAll('.section-reveal');
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { 
            opacity: 0, 
            scale: 0.95,
            y: 30 // Subtle lift to accompany the scale
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%', // Triggers when top of section hits 85% of viewport height
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // 3. Stagger animations for items within sections
      const staggerContainers = document.querySelectorAll('.stagger-container');
      staggerContainers.forEach((container) => {
        const children = container.querySelectorAll('.stagger-item');
        gsap.fromTo(
          children,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 80%',
            },
          }
        );
      });

      // 4. Parallax Background Effect
      const parallaxBgs = document.querySelectorAll('.parallax-bg');
      parallaxBgs.forEach((bg) => {
        gsap.to(bg, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: bg.parentElement,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
};