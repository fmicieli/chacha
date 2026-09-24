export type FormaEntrega = 'envio' | 'retiro';

export const FORMAS_ENTREGA: Record<FormaEntrega, string> = {
  envio: 'Envío en Mercedes',
  retiro: 'Retiro en Mercedes',
};

export interface OrderItem {
  slug: string;
  nombre: string;
  precio: number;
  url: string;
}

export interface Order {
  items: OrderItem[];
  total: number;
  cliente: {
    nombre: string;
    entrega: FormaEntrega;
    direccion?: string;
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
