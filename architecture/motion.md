# Motion & Transition SOP

## Overview
To achieve a "stunning" and "premium" feel, we use a hybrid approach combining **GSAP** and **Framer Motion**. This document outlines when and how to use each.

---

## 1. Tool Selection

| Animation Type | Recommended Library | Rationale |
|----------------|---------------------|-----------|
| **Scroll-Based** | GSAP (ScrollTrigger) | Best-in-class performance for complex scroll-driven effects and parallax. |
| **Component Entry** | Framer Motion | Declarative, easy to use for simple entrance (fade/slide) and mobile-friendly gestures. |
| **Micro-Interactions**| Framer Motion | Excellent for hover, tap, and layout-aware transitions. |
| **Page Transitions** | Framer Motion | Integration with `AnimatePresence` makes page-level exits and entries seamless. |

---

## 2. Guidelines for "Stunning" Motion

### A. Mobile-First Priority
- **Avoid Heavy Parallax**: On mobile, use subtle slides instead of complex multi-layered parallax to prevent jitter.
- **Touch Feedback**: Every interactive element must have a `whileTap` gesture in Framer Motion.
- **Staggered Lists**: Services and therapist lists must use staggered entry animations (`staggerChildren`).

### B. Timing & Easing
- **Preset**: Always use `ease: [0.22, 1, 0.36, 1]` (Custom Bezier) for a luxury feel.
- **Duration**: Entrance animations should be `0.6s` - `0.8s`. Micro-interactions should be `0.2s` - `0.3s`.

---

## 3. Implementation Checklist
- [ ] Section entry animations (GSAP ScrollTrigger).
- [ ] Interactive hover states for service cards.
- [ ] Smooth mobile menu drawer (Framer Motion).
- [ ] Subtle parallax in Hero section (GSAP).
