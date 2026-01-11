import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['var(--font-primary)', 'system-ui', 'sans-serif'],
        secondary: ['var(--font-secondary)', 'Georgia', 'serif'],
        tertiary: ['var(--font-tertiary)', 'cursive'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: '#D4AF37',
          50: '#fef9e7',
          100: '#fdf3cf',
          200: '#fbe79f',
          300: '#f9db6f',
          400: '#D4AF37',
          500: '#D4AF37',
          600: '#b8941f',
          700: '#9a7a1a',
          800: '#7c6015',
          900: '#5e4610',
        },
        sage: {
          DEFAULT: '#FF9933',
          50: '#fff4e6',
          100: '#ffe9cc',
          200: '#ffd399',
          300: '#ffbd66',
          400: '#FF9933',
          500: '#FF9933',
          600: '#e67a00',
          700: '#cc6b00',
          800: '#b35c00',
          900: '#994d00',
        },
        beige: {
          DEFAULT: '#CD7F32',
          50: '#faf5f0',
          100: '#f5ebe1',
          200: '#ebd7c3',
          300: '#e1c3a5',
          400: '#CD7F32',
          500: '#CD7F32',
          600: '#b86f2b',
          700: '#a35f24',
          800: '#8e4f1d',
          900: '#793f16',
        },
        secondary: {
          DEFAULT: '#8B4513',
          50: '#f5ede5',
          100: '#ebdbcb',
          200: '#d7b797',
          300: '#c39363',
          400: '#8B4513',
          500: '#8B4513',
          600: '#7a3d10',
          700: '#69350d',
          800: '#582d0a',
          900: '#472507',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Legacy pink colors kept for compatibility, but new design uses primary/sage/beige
        pink: {
          50: '#fef9e7',
          100: '#fdf3cf',
          200: '#fbe79f',
          300: '#f9db6f',
          400: '#D4AF37',
          500: '#D4AF37',
          600: '#b8941f',
          700: '#9a7a1a',
          800: '#7c6015',
          900: '#5e4610',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
export default config

