/** @type {import('tailwindcss').Config} */
export default {
content: [
    "./*.html",
    "./blog/**/*.html",
    "./redesign/**/*.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
    theme: {
        extend: {
            colors: {
                primary: '#0d9488', // Teal 600
                secondary: '#f43f5e', // Rose 500
                accent: '#f0fdfa', // Teal 50
                dark: '#0f172a', // Slate 900
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 8px rgba(13, 148, 136, 0.3)' },
                    '50%': { boxShadow: '0 0 24px rgba(13, 148, 136, 0.7)' },
                },
            },
        },
    },
    plugins: [],
}
