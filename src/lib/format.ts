const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/** 25000 -> "$ 25.000" */
export function formatPrecio(valor: number): string {
  return ars.format(valor);
}
