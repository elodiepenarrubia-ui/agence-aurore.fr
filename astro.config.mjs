// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://agence-aurore.fr',
  output: 'static',
  compressHTML: true,
  build: {
    // Génère des dossiers avec index.html pour les URLs propres (/page/ au lieu de /page.html)
    format: 'directory',
  },
});
