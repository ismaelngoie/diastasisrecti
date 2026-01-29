import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pink: {
          brand: "#E65473"
        },
        navy: {
          brand: "#1A1A26"
        },
        clinical: {
          white: "#FFFFFF",
          gray: "#F8FAFC"
        },
        success: "#33B373",
        warning: "#F59E0B"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0,0,0,0.25)"
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "translateZ(0) scale(1)" },
          "50%": { transform: "translateZ(0) scale(1.02)" }
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        breathe: "breathe 2.6s ease-in-out infinite",
        fadeUp: "fadeUp 700ms ease-out both"
      }
    }
  },
  plugins: []
} satisfies Config;
