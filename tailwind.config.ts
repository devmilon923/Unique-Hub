import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        input: "var(--input)",
        ring: "var(--ring)",

        /* Approach 2: Dual-Accent Commerce Split */
        commerce: {
          DEFAULT: "var(--commerce)",
          hover: "var(--commerce-hover)",
          foreground: "var(--commerce-foreground)",
          accent: "var(--commerce-accent)",
          subtle: "var(--commerce-subtle)",
          "subtle-border": "var(--commerce-subtle-border)",
          "subtle-text": "var(--commerce-subtle-text)",
        },
        logistics: {
          DEFAULT: "var(--logistics)",
          hover: "var(--logistics-hover)",
          foreground: "var(--logistics-foreground)",
          accent: "var(--logistics-accent)",
          subtle: "var(--logistics-subtle)",
          "subtle-border": "var(--logistics-subtle-border)",
          "subtle-text": "var(--logistics-subtle-text)",
        },
        tech: {
          subtle: "var(--tech-subtle)",
          "subtle-border": "var(--tech-subtle-border)",
          "subtle-text": "var(--tech-subtle-text)",
        },

        /* Full 5 Raw Palettes */
        crimson: {
          50: "var(--color-classic-crimson-50)",
          100: "var(--color-classic-crimson-100)",
          200: "var(--color-classic-crimson-200)",
          300: "var(--color-classic-crimson-300)",
          400: "var(--color-classic-crimson-400)",
          500: "var(--color-classic-crimson-500)",
          600: "var(--color-classic-crimson-600)",
          700: "var(--color-classic-crimson-700)",
          800: "var(--color-classic-crimson-800)",
          900: "var(--color-classic-crimson-900)",
          950: "var(--color-classic-crimson-950)",
        },
        "blue-bell": {
          50: "var(--color-blue-bell-50)",
          100: "var(--color-blue-bell-100)",
          200: "var(--color-blue-bell-200)",
          300: "var(--color-blue-bell-300)",
          400: "var(--color-blue-bell-400)",
          500: "var(--color-blue-bell-500)",
          600: "var(--color-blue-bell-600)",
          700: "var(--color-blue-bell-700)",
          800: "var(--color-blue-bell-800)",
          900: "var(--color-blue-bell-900)",
          950: "var(--color-blue-bell-950)",
        },
        alabaster: {
          50: "var(--color-alabaster-grey-50)",
          100: "var(--color-alabaster-grey-100)",
          200: "var(--color-alabaster-grey-200)",
          300: "var(--color-alabaster-grey-300)",
          400: "var(--color-alabaster-grey-400)",
          500: "var(--color-alabaster-grey-500)",
          600: "var(--color-alabaster-grey-600)",
          700: "var(--color-alabaster-grey-700)",
          800: "var(--color-alabaster-grey-800)",
          900: "var(--color-alabaster-grey-900)",
          950: "var(--color-alabaster-grey-950)",
        },
        "powder-blue": {
          50: "var(--color-powder-blue-50)",
          100: "var(--color-powder-blue-100)",
          200: "var(--color-powder-blue-200)",
          300: "var(--color-powder-blue-300)",
          400: "var(--color-powder-blue-400)",
          500: "var(--color-powder-blue-500)",
          600: "var(--color-powder-blue-600)",
          700: "var(--color-powder-blue-700)",
          800: "var(--color-powder-blue-800)",
          900: "var(--color-powder-blue-900)",
          950: "var(--color-powder-blue-950)",
        },
        onyx: {
          50: "var(--color-onyx-50)",
          100: "var(--color-onyx-100)",
          200: "var(--color-onyx-200)",
          300: "var(--color-onyx-300)",
          400: "var(--color-onyx-400)",
          500: "var(--color-onyx-500)",
          600: "var(--color-onyx-600)",
          700: "var(--color-onyx-700)",
          800: "var(--color-onyx-800)",
          900: "var(--color-onyx-900)",
          950: "var(--color-onyx-950)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        card: "var(--shadow-card)",
        elevated: "var(--shadow-elevated)",
      },
    },
  },
  plugins: [],
};

export default config;
