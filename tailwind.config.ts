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
        heading: ["Montserrat", "sans-serif"],
        serif: ["Montserrat", "sans-serif"], // keep alias for any remaining serif references
      },
      colors: {
        brand: {
          pink: "#FF6B8A",
          green: "#2ECC71",
          yellow: "#FFD93D",
          blue: "#4EADFF",
          dark: "#1A1A2E",
          bg: "#FFFBF7",
          footer: "#1A1A2E",
          // legacy aliases
          cyan: "#2ECC71",
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
        "3xl": "1.5rem",
        "4xl": "2rem",
        pill: "9999px",
      },
      boxShadow: {
        "glow-pink": "0 0 20px rgba(255, 107, 138, 0.4), 0 0 60px rgba(255, 107, 138, 0.15)",
        "glow-green": "0 0 20px rgba(46, 204, 113, 0.4), 0 0 60px rgba(46, 204, 113, 0.15)",
        "glow-blue": "0 0 20px rgba(78, 173, 255, 0.4), 0 0 60px rgba(78, 173, 255, 0.15)",
        "glow-yellow": "0 0 20px rgba(255, 217, 61, 0.4), 0 0 60px rgba(255, 217, 61, 0.15)",
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
