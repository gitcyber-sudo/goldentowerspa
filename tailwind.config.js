/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./App.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: {
                    light: '#D4AF37',
                    DEFAULT: '#C5A059',
                    dark: '#997B3D',
                },
                cream: {
                    DEFAULT: '#F9F7F2',
                    dark: '#EBE5D9',
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
                }
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Inter"', 'sans-serif'],
            },
            backgroundImage: {
                'hero-pattern': "url('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop')",
            }
        },
    },
    plugins: [],
}
