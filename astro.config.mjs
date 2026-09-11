import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL || 'https://alexmuzzy.dev',
  output: 'static',
  vite: { plugins: [tailwindcss()] },
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
