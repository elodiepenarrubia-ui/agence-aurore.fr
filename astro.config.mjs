import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://agence-aurore.fr',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap({ filter: (page) => !page.includes('/devis-generateur/') })],
  compressHTML: true,
  build: {
    format: 'directory'
  },
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  }
});
