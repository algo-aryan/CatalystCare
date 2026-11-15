/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        senior: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          text: "#0F172A",
          muted: "#334155",
          primary: "#1D4ED8",
          primaryHover: "#1E40AF",
          success: "#047857",
          warning: "#B45309",
          danger: "#B91C1C",
          border: "#CBD5E1",
        },
      },
      fontSize: {
        'senior-body': ['1.25rem', { lineHeight: '1.75rem' }],
        'senior-title': ['1.875rem', { lineHeight: '2.25rem' }],
        'senior-display': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      minHeight: {
        'touch-senior': '64px',
      },
    },
  },
  plugins: [],
};
