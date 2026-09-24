/**
 * Taxonomía del catálogo. Única fuente de verdad para secciones y subcategorías:
 * la usan el schema (validación), las páginas y el CMS (mantener .pages.yml en sync).
 */
export const SECCIONES = {
  accesorios: {
    label: 'Accesorios',
    etiqueta: 'Pieza única · Pintada a mano',
    subcategorias: {
      abanicos: 'Abanicos',
      'tote-bags': 'Tote bags',
    },
  },
  home: {
    label: 'Home',
    etiqueta: 'Pieza única',
    subcategorias: {
      fundas: 'Fundas de almohadones',
      caminos: 'Caminos de mesa',
      posavasos: 'Posavasos',
    },
  },
} as const;

export type Seccion = keyof typeof SECCIONES;
export type Subcategoria = {
  [S in Seccion]: keyof (typeof SECCIONES)[S]['subcategorias'];
}[Seccion];

export const SECCION_IDS = Object.keys(SECCIONES) as [Seccion, ...Seccion[]];
export const SUBCATEGORIA_IDS = Object.values(SECCIONES).flatMap((s) =>
  Object.keys(s.subcategorias),
) as [Subcategoria, ...Subcategoria[]];

export function subcategoriasDe(seccion: Seccion): Subcategoria[] {
  return Object.keys(SECCIONES[seccion].subcategorias) as Subcategoria[];
}

/** Cada subcategoría pertenece a una sola sección: la sección se deduce de acá. */
export function seccionDe(sub: Subcategoria): Seccion {
  return SECCION_IDS.find((s) => sub in SECCIONES[s].subcategorias)!;
}

export function labelSubcategoria(seccion: Seccion, sub: Subcategoria): string {
  return (SECCIONES[seccion].subcategorias as Record<string, string>)[sub] ?? sub;
}
