/**
 * Puerto de Salida (Driven Port): Servicio de Notificaciones por Correo Electrónico
 * Define el contrato que cualquier adaptador de correo (Nodemailer, SendGrid, etc.) debe implementar.
 */
class EmailServicePort {
  async enviarConfirmacionPedido({ pedido, cliente, items }) {
    throw new Error('Método enviarConfirmacionPedido() no implementado.');
  }

  async notificarNuevoPedidoAdmin({ pedido, cliente, items }) {
    throw new Error('Método notificarNuevoPedidoAdmin() no implementado.');
  }
}

module.exports = EmailServicePort;