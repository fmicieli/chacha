import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { SUBCATEGORIA_IDS } from './lib/catalogo';

// Las imágenes se referencian con rutas relativas al archivo de contenido,
// ej. "../../assets/productos/abanico-1.jpg" (así las escribe Pages CMS).

/** "Abanico Jardín de Naranjos.json" -> "abanico-jardin-de-naranjos" */
function slugify(nombreArchivo: string): string {
  return nombreArchivo
    .replace(/\.json$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const productos = defineCollection({
  // El slug (y la URL) sale del nombre del archivo, que Pages CMS arma a partir del nombre
  // del producto al crearlo. Así es único por definición y nadie tiene que escribirlo.
  // La sección no se guarda: se deduce de la subcategoría (ver src/lib/productos.ts).
  loader: glob({
    pattern: '*.json',
    base: './src/content/productos',
    generateId: ({ entry }) => slugify(entry),
  }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string().trim().min(1, 'Falta el nombre'),
      subcategoria: z.enum(SUBCATEGORIA_IDS),
      precio: z.number().int('El precio va sin decimales').positive('El precio tiene que ser mayor a 0'),
      descripcion: z.string().trim().min(1, 'Falta la descripción'),
      medidas: z.string().trim().min(1, 'Faltan las medidas'),
      material: z.string().trim().min(1, 'Falta el material'),
      fotos: z
        .array(
          z.object({
            imagen: image(),
            alt: z.string().trim().min(1, 'Cada foto necesita una descripción (texto alternativo)'),
          }),
        )
        .min(1, 'Cargá al menos 1 foto')
        .max(3, 'Máximo 3 fotos'),
      estado: z.enum(['disponible', 'vendido']).default('disponible'),
      fecha_alta: z.coerce.date(),
      destacado: z.boolean().default(false),
    }),
});

const config = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/config' }),
  schema: ({ image }) =>
    z.object({
    whatsapp: z
      .string()
      .regex(/^(\d{10,15}|549X+)$/, 'WhatsApp: solo números, formato internacional sin "+" (ej. 5492324123456)'),
    instagram_url: z.url(),
    zona_entrega: z.string().min(1),
    texto_entregas: z.string().min(1),
    hero: z.object({
      titulo: z.string().min(1),
      subtitulo: z.string().nullish(),
      imagen: image(),
      alt: z.string().min(1),
    }),
      bajada_accesorios: z.string().min(1),
      bajada_home: z.string().min(1),
      // Imágenes de las tarjetas de sección en Inicio. Si faltan, se usa la foto del último producto.
      imagen_accesorios: image().nullish(),
      imagen_home: image().nullish(),
      instagram_grid: z
        .array(
          z.object({
            imagen: image(),
            link: z.url(),
            alt: z
              .string()
              .nullish()
              .transform((v) => v || 'Posteo de Chacha en Instagram'),
          }),
        )
        .max(6, 'La grilla de Instagram tiene máximo 6 fotos')
        .nullish()
        .transform((v) => v ?? []),
    }),
});

const paginas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/paginas' }),
  schema: ({ image }) =>
    z.object({
    titulo: z.string().min(1),
    // Bajada corta para el bloque "Sobre nosotras" de Inicio (2 o 3 líneas).
    resumen: z.string().nullish(),
    fotos: z
      .array(z.object({ imagen: image(), alt: z.string().min(1) }))
      .max(2, 'Máximo 2 fotos')
      .default([]),
  }),
});

export const collections = { productos, config, paginas };
