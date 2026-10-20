// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Canonical URL for sitemap + Open Graph tags. Netlify sets URL on every build;
// set SITE_URL to override it (e.g. once a custom domain is connected).
// Local builds fall back to the dev server address.
const site = process.env.SITE_URL || process.env.URL || 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [sitemap()],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Figtree',
      cssVariable: '--font-figtree',
      weights: ['300 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
