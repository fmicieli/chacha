// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Mientras el sitio viva en GitHub Pages bajo /chacha/, `base` tiene que ser '/chacha'.
// Con dominio propio: site = 'https://tudominio.com', base = '/' y agregar public/CNAME.
export default defineConfig({
  site: 'https://fmicieli.github.io',
  base: '/chacha',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !/\/(carrito|404)\/?$/.test(new URL(page).pathname),
    }),
  ],
});
