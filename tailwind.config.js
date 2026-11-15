// Tailwind v4 is configured CSS-first (see src/index.css) via @tailwindcss/vite.
// This file is not loaded unless you add `@config "../tailwind.config.js";` to index.css.
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
