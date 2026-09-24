import { formatPrecio } from '../format';
import { FORMAS_ENTREGA, type CheckoutProvider, type Order } from './types';

// En el texto plano de WhatsApp usamos espacio común en vez del espacio duro de Intl.
const precio = (n: number) => formatPrecio(n).replace(/ /g, ' ');

export function mensajeDePedido(order: Order): string {
  const { cliente } = order;
  const lineas = [
    '¡Hola! Quiero comprar:',
    '',
    ...order.items.map((i) => `• ${i.nombre} · ${precio(i.precio)}`),
    '',
    `Total: ${precio(order.total)}`,
    '',
    `Nombre: ${cliente.nombre}`,
    `Entrega: ${FORMAS_ENTREGA[cliente.entrega]}`,
  ];
  if (cliente.entrega === 'envio' && cliente.direccion?.trim()) lineas.push(`Dirección: ${cliente.direccion.trim()}`);
  if (cliente.comentario?.trim()) lineas.push(`Comentario: ${cliente.comentario.trim()}`);
  return lineas.join('\n');
}

export function whatsappUrl(numero: string, texto: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function createWhatsappProvider(numero: string): CheckoutProvider {
  return {
    id: 'whatsapp',
    label: 'Enviar pedido por WhatsApp',
    async checkout(order, ctx) {
      const link = whatsappUrl(numero, mensajeDePedido(order));
      const ventana = ctx?.ventana;
      if (ventana && !ventana.closed) {
        ventana.opener = null;
        ventana.location.href = link;
      } else {
        // Pop-up bloqueado: abrimos en la misma pestaña.
        window.location.href = link;
      }
    },
  };
}
