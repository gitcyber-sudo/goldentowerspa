/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: {
                    50: '#FBF7EE',
                    100: '#F5ECDA',
                    200: '#EBD9B5',
                    300: '#E0C48C',
                    400: '#D4AF37',
                    DEFAULT: '#C5A059',
                    500: '#C5A059',
                    600: '#A6803E',
                    700: '#997B3D',
                    800: '#7A6231',
                    900: '#5C4A25',
                    light: '#D4AF37',
                    dark: '#997B3D',
                },
                cream: {
                    DEFAULT: '#F9F7F2',
                    dark: '#EBE5D9',
                    light: '#FDFCF9',
                },
                charcoal: {
                    light: '#2C2C2C',
                    DEFAULT: '#1A1A1A',
                    dark: '#0F0F0F',
                },
                sepia: {
                    100: '#F5F2EA',
                    200: '#EBE5D9',
                    600: '#8B7355',
                    800: '#5D4D3A',
                    900: '#3D3326',
                },
                rose: {
                    50: '#FFF1F2',
                    100: '#FFE4E6',
                    500: '#F43F5E',
                    600: '#E11D48',
                },
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Inter"', 'sans-serif'],
            },
            fontSize: {
                // Fluid type scale — mobile-first
                'fluid-xs': 'clamp(0.7rem, 0.65rem + 0.25vw, 0.8rem)',
                'fluid-sm': 'clamp(0.8rem, 0.75rem + 0.3vw, 0.95rem)',
                'fluid-base': 'clamp(0.9rem, 0.85rem + 0.3vw, 1.05rem)',
                'fluid-lg': 'clamp(1.1rem, 1rem + 0.5vw, 1.3rem)',
                'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.6rem)',
                'fluid-2xl': 'clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)',
                'fluid-3xl': 'clamp(1.8rem, 1.4rem + 2vw, 3rem)',
                'fluid-4xl': 'clamp(2.2rem, 1.6rem + 3vw, 3.75rem)',
                'fluid-5xl': 'clamp(2.5rem, 1.8rem + 3.5vw, 4.5rem)',
                'fluid-6xl': 'clamp(3rem, 2rem + 5vw, 6rem)',
            },
            backgroundImage: {
                'hero-pattern': "url('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop')",
                'gold-gradient': 'linear-gradient(135deg, #C5A059 0%, #E5C585 50%, #C5A059 100%)',
                'gold-shine': 'linear-gradient(90deg, transparent 0%, rgba(197,160,89,0.3) 50%, transparent 100%)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 3s linear infinite',
                'float': 'float 4s ease-in-out infinite',
                'fade-in': 'fade-in 0.8s ease-out forwards',
                'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
                'shimmer': 'shimmer 2s linear infinite',
                'fade-in-out': 'fade-in-out 1.2s ease-in-out forwards',
            },
            keyframes: {
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'fade-in-up': {
                    from: { opacity: '0', transform: 'translateY(16px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'fade-in-out': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '50%': { opacity: '1', transform: 'scale(1)' },
                    '100%': { opacity: '0', transform: 'scale(1.05)' },
                },
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            boxShadow: {
                'gold': '0 4px 30px rgba(197, 160, 89, 0.15)',
                'gold-lg': '0 10px 40px rgba(197, 160, 89, 0.2)',
                'gold-xl': '0 20px 60px rgba(197, 160, 89, 0.25)',
                'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '30': '7.5rem',
            },
        },
    },
    plugins: [],
}
