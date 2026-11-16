/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F7F6F3',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#16202A',
          muted: '#5B6672',
        },
        border: {
          DEFAULT: '#E3E1DB',
          subtle: '#EDEBE6',
        },
        accent: {
          DEFAULT: '#1F4E5F',
          hover: '#163946',
          light: '#E8EFF1',
          subtle: '#D3DFE2',
        },
        status: {
          optimal: {
            DEFAULT: '#2F7D57',
            light: '#EAF5EE',
            border: '#BFE3CE',
          },
          warn: {
            DEFAULT: '#B7791F',
            light: '#FEF7EC',
            border: '#F8DCAC',
          },
          infeasible: {
            DEFAULT: '#B3382C',
            light: '#FDF2F0',
            border: '#F6C5C0',
          },
        },
        data: {
          1: '#1F4E5F',
          2: '#C2793A',
          3: '#6B7A3A',
          4: '#8A3B4A',
          5: '#5E6C84',
          6: '#8F8A7E',
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(22, 32, 42, 0.05), 0 1px 2px rgba(22, 32, 42, 0.03)',
        'card': '0 2px 8px rgba(22, 32, 42, 0.04), 0 1px 3px rgba(22, 32, 42, 0.06)',
        'modal': '0 12px 32px rgba(22, 32, 42, 0.12), 0 4px 8px rgba(22, 32, 42, 0.06)',
      }
    },
  },
  plugins: [],
}
