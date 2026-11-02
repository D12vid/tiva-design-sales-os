/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                tiva: {
                    bg: '#090A0F',
                    card: '#12141D',
                    border: '#1F2433',
                    accent: '#7C3AED',
                    cyan: '#06B6D4'
                }
            }
        }
    },
    plugins: []
};