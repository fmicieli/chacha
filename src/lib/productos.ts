import { getCollection, type CollectionEntry } from 'astro:content';
import { subcategoriasDe, labelSubcategoria, type Seccion, type Subcategoria } from './catalogo';

export type Producto = CollectionEntry<'productos'>['data'];

const porFechaDesc = (a: Producto, b: Producto) => b.fecha_alta.getTime() - a.fecha_alta.getTime();
/** Disponibles primero (más nuevos primero), después vendidos. */
const disponiblesPrimero = (a: Producto, b: Producto) =>
  a.estado === b.estado ? porFechaDesc(a, b) : a.estado === 'disponible' ? -1 : 1;

let cache: Producto[] | undefined;

/** Todos los productos, validando que no haya slugs repetidos. */
export async function getProductos(): Promise<Producto[]> {
  if (cache) return cache;
  const entries = await getCollection('productos');
  const vistos = new Map<string, string>();
  for (const { id, data } of entries) {
    const otro = vistos.get(data.slug);
    if (otro) {
      throw new Error(
        `[chacha] Hay dos productos con el mismo slug "${data.slug}" (${otro} y ${id}). Cambiá uno de los dos.`,
      );
    }
    vistos.set(data.slug, id);
  }
  cache = entries.map((e) => e.data).sort(disponiblesPrimero);
  return cache;
}

export const estaDisponible = (p: Producto) => p.estado === 'disponible';

/** Novedades para Inicio: disponibles, destacados primero y después por fecha. */
export async function getNovedades(limite = 8): Promise<Producto[]> {
  const disponibles = (await getProductos()).filter(estaDisponible);
  return disponibles
    .sort((a, b) => Number(b.destacado) - Number(a.destacado) || porFechaDesc(a, b))
    .slice(0, limite);
}

export interface GrupoSubcategoria {
  id: Subcategoria;
  label: string;
  productos: Producto[];
}

/** Productos de una sección agrupados por subcategoría (sin grupos vacíos). */
export async function getSeccionAgrupada(seccion: Seccion): Promise<GrupoSubcategoria[]> {
  const productos = (await getProductos()).filter((p) => p.seccion === seccion);
  return subcategoriasDe(seccion)
    .map((id) => ({
      id,
      label: labelSubcategoria(seccion, id),
      productos: productos.filter((p) => p.subcategoria === id),
    }))
    .filter((g) => g.productos.length > 0);
}

/** Hasta `limite` disponibles de la misma subcategoría; completa con la misma sección. */
export async function getRelacionados(producto: Producto, limite = 4): Promise<Producto[]> {
  const otros = (await getProductos()).filter((p) => estaDisponible(p) && p.slug !== producto.slug);
  const misma = otros.filter((p) => p.subcategoria === producto.subcategoria);
  const seccion = otros.filter((p) => p.seccion === producto.seccion && p.subcategoria !== producto.subcategoria);
  return [...misma, ...seccion].slice(0, limite);
}

