/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NGPF Brand Colors
        'primary': '#2196f3',
        'primary-dark': '#1976d2',
        'primary-light': '#bbdefb',
        'accent': '#ff4081',
        'text-primary': '#333',
        'text-secondary': '#666',
        'text-light': '#666',
        'background': '#f5f5f5',
        'card-background': '#ffffff',
        'border-color': '#e0e0e0',
        'surface': '#ffffff',
        'success': '#4caf50',
        'error': '#f44336',
        
        // Legacy colors for compatibility
        'royal-blue': '#1976d2',
        'navy-blue': '#333',
        'bright-blue': '#2196f3',
        'sky-blue': '#1db8e8',
        'gold': '#f4ad00',
        'orange': '#ff4081',
        'soft-blue': '#bbdefb',
        'light-gray-blue': '#e0e0e0',
        'ice-blue': '#d2eff9',
        'soft-yellow': '#ffe5a2',
        'bright-green': '#4caf50',
      },
      fontFamily: {
        'heading': ['Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'h1': '2rem',
        'h2': '1.5rem',
        'h3': '1.25rem',
        'h4': '1.125rem',
        'h5': '1rem',
        'h6': '0.875rem',
        'regular': '16px',
        'small': '0.875rem',
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '0.75rem',
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '3rem',
      },
      borderRadius: {
        'sm': '4px',
        'md': '4px',
        'lg': '8px',
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 8px 16px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
} 