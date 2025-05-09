import type { Config } from "tailwindcss";
import daisyui from "daisyui";

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
        darkgray: '#ebebeb',
        lightgray: '#252728'
      },
      fontFamily: {
        'special-gothic': ['"Special Gothic Expanded One"', 'serif'],
      },
    },
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    base: false, // applies background color and foreground color for root element by default
    themes: ["light", "autumn", "winter"],
  },
};
export default config;