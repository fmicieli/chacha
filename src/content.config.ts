import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { SECCIONES, SECCION_IDS, SUBCATEGORIA_IDS } from './lib/catalogo';

// Las imágenes se referencian con rutas relativas al archivo de contenido,
// ej. "../../assets/productos/abanico-1.jpg" (así las escribe Pages CMS).

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const productos = defineCollection({
  // El id es el nombre del archivo, así dos archivos con el mismo `slug` no se pisan en silencio:
  // src/lib/productos.ts detecta el duplicado y corta el build. La URL usa `slug`.
  loader: glob({
    pattern: '**/*.json',
    base: './src/content/productos',
    generateId: ({ entry }) => entry.replace(/\.json$/, ''),
  }),
  schema: ({ image }) =>
    z
      .object({
        nombre: z.string().trim().min(1, 'Falta el nombre'),
        slug: z
          .string()
          .regex(slugRegex, 'El slug solo puede tener minúsculas, números y guiones (ej. "abanico-jardin")'),
        seccion: z.enum(SECCION_IDS),
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
      })
      .superRefine((p, ctx) => {
        if (!(p.subcategoria in SECCIONES[p.seccion].subcategorias)) {
          ctx.addIssue({
            code: 'custom',
            path: ['subcategoria'],
            message: `"${p.subcategoria}" no pertenece a la sección "${p.seccion}"`,
          });
        }
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
        subtitulo: z.string().optional(),
        imagen: image(),
        alt: z.string().min(1),
      }),
      bajada_accesorios: z.string().min(1),
      bajada_home: z.string().min(1),
      // Imágenes de las tarjetas de sección en Inicio. Si faltan, se usa la foto del último producto.
      imagen_accesorios: image().optional(),
      imagen_home: image().optional(),
      instagram_grid: z
        .array(
          z.object({
            imagen: image(),
            link: z.url(),
            alt: z.string().default('Posteo de Chacha en Instagram'),
          }),
        )
        .max(6, 'La grilla de Instagram tiene máximo 6 fotos')
        .default([]),
    }),
});

const paginas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/paginas' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string().min(1),
      fotos: z
        .array(z.object({ imagen: image(), alt: z.string().min(1) }))
        .max(2, 'Máximo 2 fotos')
        .default([]),
    }),
});

export const collections = { productos, config, paginas };
