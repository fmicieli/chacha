/**
 * Arma una URL interna respetando `base` (ej. '/chacha/').
 * Usar SIEMPRE este helper para links, imágenes de /public y assets.
 *   url('/')                 -> '/chacha/'
 *   url('/producto/abanico') -> '/chacha/producto/abanico/'
 *   url('/favicon.svg')      -> '/chacha/favicon.svg'
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path = '/'): string {
  const [pathname, hash = ''] = path.split('#');
  let p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  // Rutas de página llevan barra final (trailingSlash: 'always'); archivos no.
  const isFile = /\.[a-z0-9]+$/i.test(p);
  if (!isFile && !p.endsWith('/')) p += '/';
  return `${BASE}${p}${hash ? `#${hash}` : ''}`;
}

/** URL absoluta (para Open Graph, links compartidos). */
export function absoluteUrl(path = '/', site?: URL | string): string {
  return new URL(url(path), site ?? import.meta.env.SITE).toString();
}

/** true si `current` (Astro.url.pathname) corresponde a `path`. */
export function isActive(current: string, path: string): boolean {
  const target = url(path);
  return current === target || (target !== url('/') && current.startsWith(target));
}
