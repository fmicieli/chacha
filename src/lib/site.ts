import { getEntry } from 'astro:content';

export const SITE_NAME = 'Chacha';
export const SITE_DESCRIPTION =
  'Accesorios pintados a mano y deco para tu casa. Piezas únicas, hechas en Mercedes, Buenos Aires.';

const WHATSAPP_PLACEHOLDER = /^549X+$/;
let warned = false;

/** Configuración general editable desde el CMS (src/content/config/sitio.json). */
export async function getSite() {
  const entry = await getEntry('config', 'sitio');
  if (!entry) throw new Error('[chacha] Falta src/content/config/sitio.json');
  const site = entry.data;

  if (!warned && WHATSAPP_PLACEHOLDER.test(site.whatsapp)) {
    warned = true;
    console.warn(
      '\n\x1b[33m⚠  [chacha] El número de WhatsApp sigue siendo el placeholder (549XXXXXXXXXX).\n' +
        '   Cargalo en el CMS → Configuración del sitio antes de publicar.\x1b[0m\n',
    );
  }
  return site;
}

export type Site = Awaited<ReturnType<typeof getSite>>;

/** Link a WhatsApp con mensaje prearmado. */
export function whatsappLink(numero: string, text?: string): string {
  const base = `https://wa.me/${numero}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
