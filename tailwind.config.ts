import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#07090f",
          900: "#0e1525",
          800: "#15203a",
          700: "#223056"
        },
        accent: {
          500: "#2dd4bf",
          400: "#5eead4"
        }
      },
      boxShadow: {
        panel: "0 14px 48px rgba(7, 9, 15, 0.4)"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      backgroundImage: {
        atmosphere:
          "radial-gradient(circle at 10% 0%, rgba(45, 212, 191, 0.16), transparent 32%), radial-gradient(circle at 100% 20%, rgba(94, 234, 212, 0.12), transparent 27%)"
      }
    }
  },
  plugins: []
};

export default config;
