/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0D16",
          900: "#0E1220",
          800: "#131829",
          700: "#1A2136",
        },
        mist: "#8C94AB",
        haze: "#E7EAF3",
        electric: {
          400: "#6C86FF",
          500: "#4F6BFF",
          600: "#3D54DB",
        },
        violet: {
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C4FE0",
        },
        mint: "#34D399",
        coral: "#F87171",
        amber: "#FBBF24",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -20px rgba(79,107,255,0.35)",
        "glow-lg": "0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px -20px rgba(79,107,255,0.5)",
        "glow-violet": "0 0 0 1px rgba(139,92,246,0.2), 0 20px 60px -20px rgba(139,92,246,0.4)",
        electric: "0 0 12px rgba(79,107,255,0.4)",
        violet: "0 0 12px rgba(139,92,246,0.4)",
        coral: "0 0 12px rgba(248,113,113,0.4)",
        mint: "0 0 12px rgba(52,211,153,0.4)",
      },
      backgroundImage: {
        aurora:
          "radial-gradient(60% 50% at 20% 0%, rgba(79,107,255,0.18) 0%, rgba(10,13,22,0) 60%), radial-gradient(50% 40% at 90% 10%, rgba(139,92,246,0.16) 0%, rgba(10,13,22,0) 60%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "gradient-x": "gradient-x 4s ease infinite",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "ping-slow": "ping-slow 2s cubic-bezier(0,0,0.2,1) infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(-0.3deg)" },
          "50%": { transform: "translateY(-12px) rotate(0.3deg)" },
        },
        "glow-pulse": {
          "0%, 100%": { "box-shadow": "0 0 20px rgba(79,107,255,0.2)" },
          "50%": { "box-shadow": "0 0 40px rgba(79,107,255,0.5), 0 0 80px rgba(139,92,246,0.2)" },
        },
        shimmer: {
          "0%": { "background-position": "-200% 0" },
          "100%": { "background-position": "200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "ping-slow": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.75" },
          "50%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
