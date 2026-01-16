import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay to ensure all elements are rendered and images have layout
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Fade Up animations
        const fadeUps = document.querySelectorAll('.fade-up');
        fadeUps.forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        // Stagger animations for grids
        const staggerContainers = document.querySelectorAll('.stagger-container');
        staggerContainers.forEach((container) => {
          const children = container.querySelectorAll('.stagger-item');
          gsap.fromTo(
            children,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.2,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: container,
                start: 'top 85%',
              },
            }
          );
        });

        // Parallax effect for hero backgrounds
        const parallaxBgs = document.querySelectorAll('.parallax-bg');
        parallaxBgs.forEach((bg) => {
          gsap.to(bg, {
            yPercent: 15,
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

      return () => {
        ctx.revert();
      };
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return containerRef;
};