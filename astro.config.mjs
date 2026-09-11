import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL || 'https://alex-musgrove-portfolio-concept.amuzzy.chatgpt.site',
  output: 'static',
  vite: { plugins: [tailwindcss()] },
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
