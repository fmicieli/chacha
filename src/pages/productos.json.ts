import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import { getProductos } from '../lib/productos';
import { url } from '../lib/url';

/**
 * Índice liviano de productos para el carrito. El carrito guarda solo slugs y
 * se "hidrata" contra este archivo para detectar cambios de precio, vendidos o eliminados.
 */
export const GET: APIRoute = async () => {
  const productos = await getProductos();
  const indice = await Promise.all(
    productos.map(async (p) => {
      const thumb = await getImage({ src: p.fotos[0].imagen, width: 240, format: 'webp' });
      return {
        slug: p.slug,
        nombre: p.nombre,
        precio: p.precio,
        estado: p.estado,
        imagen: thumb.src,
        url: url(`/producto/${p.slug}/`),
      };
    }),
  );
  return new Response(JSON.stringify(indice), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
