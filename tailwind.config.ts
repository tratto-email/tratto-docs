import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/fumadocs-ui/dist/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
