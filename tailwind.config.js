/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563EB',
                    hover: '#1D4ED8',
                    active: '#1E40AF',
                },
                secondary: {
                    DEFAULT: '#10B981',
                    hover: '#059669',
                    active: '#047857',
                },
                accent: {
                    DEFAULT: '#F59E0B',
                    hover: '#D97706',
                    active: '#B45309',
                },
                danger: {
                    DEFAULT: '#EF4444',
                    hover: '#DC2626',
                    active: '#B91C1C',
                },
                neutral: {
                    dark: '#1E293B',
                    medium: '#475569',
                    light: '#F1F5F9',
                },
                border: '#E2E8F0',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'h1': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
                'h2': ['28px', { lineHeight: '36px', letterSpacing: '-0.01em', fontWeight: '600' }],
                'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
                'h4': ['20px', { lineHeight: '28px', fontWeight: '600' }],
                'body-lg': ['18px', { lineHeight: '28px' }],
                'body': ['16px', { lineHeight: '24px' }],
                'body-sm': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
                'caption': ['12px', { lineHeight: '16px', letterSpacing: '0.02em' }],
            },
            borderRadius: {
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                'full': '9999px',
            },
            boxShadow: {
                'card': '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)',
                'card-hover': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                'modal': '0 25px 50px -12px rgba(0,0,0,0.25)',
            },
        },
    },
    plugins: [],
}
