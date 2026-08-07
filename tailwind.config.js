/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                indigo: {
                    PRIMARY: '#4f46e5',
                    SECONDARY: '#818cf8',
                },
                background: '#fcf8ff',
                surface: '#ffffff',
                success: '#10b981',
                error: '#ef4444',
                variant: '#64748b',
            },
        },
    },
    plugins: [],
};