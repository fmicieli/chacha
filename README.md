# Chacha · Tienda online

Sitio estático en [Astro](https://astro.build), publicado en GitHub Pages.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:4321/chacha/
npm run build    # genera dist/
```

## Deploy

Cada push a `main` corre `.github/workflows/deploy.yml` y publica en
https://fmicieli.github.io/chacha/.

Primera vez: en GitHub → Settings → Pages → Source, elegir **GitHub Actions**.

## Rutas y `base`

El sitio vive bajo `/chacha/`. Todos los links internos y assets de `public/` pasan
por `url()` en `src/lib/url.ts`. No escribir rutas absolutas a mano.

### Pasar a dominio propio

1. En `astro.config.mjs`: `site: 'https://tudominio.com'` y `base: '/'`.
2. Crear `public/CNAME` con el dominio.
3. Configurar el DNS según la guía de GitHub Pages.

> Documentación completa: fase 6.
