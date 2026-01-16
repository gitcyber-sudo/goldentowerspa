import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for the next tick to ensure DOM is ready
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
          delay: 0.2 // Small delay after load
        });
      }

      // 2. Standard Fade Up animations
      const fadeUps = document.querySelectorAll('.fade-up');
      if (fadeUps.length > 0) {
        gsap.fromTo(
          fadeUps,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: {
              trigger: fadeUps[0],
              start: 'top 95%', // Trigger slightly earlier
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 3. Stagger animations for Service Cards (Grids)
      const staggerContainers = document.querySelectorAll('.stagger-container');
      staggerContainers.forEach((container) => {
        const children = container.querySelectorAll('.stagger-item');
        gsap.fromTo(
          children,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2, // Distinct "pop up one by one" feel
            ease: 'power2.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
            },
          }
        );
      });

      // 4. Parallax Background Effect
      const parallaxBgs = document.querySelectorAll('.parallax-bg');
      parallaxBgs.forEach((bg) => {
        gsap.to(bg, {
          yPercent: 30, // Move down as user scrolls down
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