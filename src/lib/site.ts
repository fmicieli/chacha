import sitio from '../content/config/sitio.json';

// Fase 2: esto pasa a validarse con zod dentro de una content collection.
export const site = sitio;

export const SITE_NAME = 'Chacha';
export const SITE_DESCRIPTION =
  'Accesorios pintados a mano y deco para tu casa. Piezas únicas, hechas en Mercedes, Buenos Aires.';

const WHATSAPP_PLACEHOLDER = '549XXXXXXXXXX';

if (import.meta.env.SSR && site.whatsapp === WHATSAPP_PLACEHOLDER) {
  console.warn(
    '\n\x1b[33m⚠  [chacha] El número de WhatsApp sigue siendo el placeholder (549XXXXXXXXXX).\n' +
      '   Cargalo en el CMS → Configuración del sitio antes de publicar.\x1b[0m\n',
  );
}

/** Link a WhatsApp con mensaje prearmado. */
export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
