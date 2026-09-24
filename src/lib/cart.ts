/**
 * Carrito (solo cliente). Guarda únicamente slugs en localStorage; nombre, precio y
 * estado salen siempre de /productos.json, así nunca se muestra un dato viejo.
 * Cada pieza es única: cada slug puede estar una sola vez.
 */
import { url } from './url';

export interface ItemIndice {
  slug: string;
  nombre: string;
  precio: number;
  estado: 'disponible' | 'vendido';
  imagen: string;
  url: string;
}

const KEY = 'chacha-carrito';
const EVENTO_CAMBIO = 'chacha:carrito';
const EVENTO_AVISO = 'chacha:aviso';

// Si localStorage no está disponible (modo privado, bloqueado), el carrito vive en memoria.
let memoria: string[] = [];

function normalizar(valor: unknown): string[] {
  return Array.isArray(valor) ? [...new Set(valor.filter((s): s is string => typeof s === 'string'))] : [];
}

export function getCarrito(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw === null ? memoria : normalizar(JSON.parse(raw));
  } catch {
    return memoria;
  }
}

function guardar(slugs: string[]) {
  memoria = slugs;
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    /* seguimos en memoria */
  }
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO, { detail: slugs }));
}

export const estaEnCarrito = (slug: string) => getCarrito().includes(slug);

/** Agrega si no está. Devuelve false si ya estaba. */
export function agregar(slug: string): boolean {
  const slugs = getCarrito();
  if (slugs.includes(slug)) return false;
  guardar([...slugs, slug]);
  return true;
}

export function quitar(slug: string) {
  guardar(getCarrito().filter((s) => s !== slug));
}

export function vaciar() {
  guardar([]);
}

/** Escucha cambios del carrito (en esta pestaña y en otras). */
export function onCambio(cb: (slugs: string[]) => void) {
  window.addEventListener(EVENTO_CAMBIO, (e) => cb((e as CustomEvent<string[]>).detail));
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) cb(getCarrito());
  });
}

/* ---------- Índice de productos ---------- */

let indice: Promise<ItemIndice[]> | undefined;

export function cargarIndice(fresco = false): Promise<ItemIndice[]> {
  if (!indice || fresco) {
    indice = fetch(url('/productos.json'), { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error(`productos.json: ${r.status}`);
      return r.json() as Promise<ItemIndice[]>;
    });
    indice.catch(() => (indice = undefined));
  }
  return indice;
}

export interface Hidratacion {
  items: ItemIndice[];
  /** Avisos por productos que se sacaron (vendidos o eliminados). */
  avisos: string[];
}

let hidratacionInicial: Promise<Hidratacion> | undefined;

/**
 * Cruza el carrito con el índice y saca lo que ya no está disponible.
 * Sin `fresco`, se calcula una sola vez por carga de página (lo comparten todos los scripts).
 */
export function hidratar(fresco = false): Promise<Hidratacion> {
  if (!fresco && hidratacionInicial) return hidratacionInicial;
  const p = (async () => {
    const slugs = getCarrito();
    if (slugs.length === 0) return { items: [], avisos: [] };
    const porSlug = new Map((await cargarIndice(fresco)).map((i) => [i.slug, i]));
    const items: ItemIndice[] = [];
    const avisos: string[] = [];
    for (const slug of slugs) {
      const item = porSlug.get(slug);
      if (item?.estado === 'disponible') items.push(item);
      else avisos.push(avisoNoDisponible(item?.nombre));
    }
    if (items.length !== slugs.length) guardar(items.map((i) => i.slug));
    return { items, avisos };
  })();
  if (!fresco) {
    hidratacionInicial = p;
    p.catch(() => (hidratacionInicial = undefined));
  }
  return p;
}

export function avisoNoDisponible(nombre?: string): string {
  return nombre
    ? `${nombre} ya no está disponible y lo sacamos de tu carrito.`
    : 'Un producto de tu carrito ya no está disponible y lo sacamos.';
}

/* ---------- Avisos (toast global) ---------- */

export function avisar(mensaje: string) {
  window.dispatchEvent(new CustomEvent(EVENTO_AVISO, { detail: mensaje }));
}

export function onAviso(cb: (mensaje: string) => void) {
  window.addEventListener(EVENTO_AVISO, (e) => cb((e as CustomEvent<string>).detail));
}
