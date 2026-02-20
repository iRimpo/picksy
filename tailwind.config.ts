import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
      },
      colors: {
        // Legacy brand colors (kept for backward compat)
        brand: {
          pink: "#ea580c",
          cyan: "#fb923c",
          yellow: "#fed7aa",
          dark: "#1c1917",
          bg: "#fafaf9",
          footer: "#0c0a09",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-15px) rotate(5deg)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        gaugefill: {
          "0%": { strokeDashoffset: "283" },
          "100%": { strokeDashoffset: "var(--gauge-target)" },
        },
        plopIn: {
          "0%": { opacity: "0", transform: "scale(0.8) translateY(10px)" },
          "60%": { transform: "scale(1.05) translateY(-2px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        gradient: "gradient 20s ease infinite",
        float: "float 3s ease-in-out infinite",
        floatSlow: "floatSlow 4s ease-in-out infinite",
        floatDelay: "float 3.5s ease-in-out 1s infinite",
        floatDelay2: "floatSlow 5s ease-in-out 0.5s infinite",
        fadeInUp: "fadeInUp 0.6s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        scaleIn: "scaleIn 0.5s ease-out forwards",
        slideInLeft: "slideInLeft 0.5s ease-out forwards",
        slideInRight: "slideInRight 0.5s ease-out forwards",
        gaugeIn: "gaugeFill 1.5s ease-out forwards",
        plopIn: "plopIn 0.4s ease-out forwards",
        spinSlow: "spinSlow 10s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
