/** @type {import('tailwindcss').Config} */
module.exports = {
    // ATENÇÃO: Garanta que os caminhos das telas/componentes estejam mapeados aqui
    content: [
        "./App.{js,jsx,ts,tsx}",
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
                success: '#10b981', // Income / Receitas
                error: '#ef4444',   // Expense / Despesas
                variant: '#64748b',  // On-Surface-Variant
            },
        },
    },
    plugins: [],
}