import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Kannada glyphs fall through to Tiro Kannada / Noto Sans Kannada (Latin
        // stays Cormorant / Inter). Google Fonts unicode-range means the Kannada
        // files only download on pages that actually render Kannada.
        serif: ["var(--font-serif)", "Tiro Kannada", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Noto Sans Kannada", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
