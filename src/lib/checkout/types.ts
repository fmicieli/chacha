/** El cliente no elige forma de entrega: envío o retiro se coordina por WhatsApp. */
export const ENTREGA = 'A coordinar por WhatsApp';

export interface OrderItem {
  slug: string;
  nombre: string;
  precio: number;
  /** URL absoluta del producto (se comparte en el mensaje). */
  url: string;
}

export interface Order {
  items: OrderItem[];
  total: number;
  /** URL absoluta de /pedido/ con las fotos de todas las piezas. */
  resumenUrl?: string;
  cliente: {
    nombre: string;
    comentario?: string;
  };
}

export interface CheckoutContext {
  /**
   * Pestaña abierta de forma sincrónica en el click (antes de validar contra el servidor),
   * para que el navegador no la bloquee como pop-up.
   */
  ventana?: Window | null;
}

/**
 * Un medio para cerrar la compra. Hoy: WhatsApp.
 * Para sumar Mercado Pago: crear otro provider que llame a un backend (ver README).
 */
export interface CheckoutProvider {
  id: string;
  label: string;
  checkout(order: Order, ctx?: CheckoutContext): Promise<void>;
}
