const nodemailer = require('nodemailer');
const EmailServicePort = require('../../../domain/ports/EmailServicePort');

class NodemailerEmailAdapter extends EmailServicePort {
  constructor() {
    super();
    this.transporter = null;
    this.transporterReady = this.initTransporter();
  }

  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async initTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Nodemailer listo con buzon virtual Ethereal:', testAccount.user);
    }
  }

  async asegurarTransporter() {
    if (!this.transporter) {
      await this.transporterReady;
    }
    if (!this.transporter) {
      this.transporterReady = this.initTransporter();
      await this.transporterReady;
    }
  }

  async enviarConfirmacionPedido({ pedido, cliente, items }) {
    await this.asegurarTransporter();

    const filasTabla = (items || [])
      .map(
        (i) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${this.escapeHtml(i.nombre || 'Producto #' + i.producto_id)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${this.escapeHtml(i.cantidad)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${Number(i.precio || 0).toFixed(2)}</td>
        </tr>`
      )
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px; background-color: #ffffff;">
        <h2 style="color: #111827; margin-top: 0;">¡Gracias por tu compra, ${this.escapeHtml(cliente.nombre)}!</h2>
        <p style="color: #4b5563; font-size: 15px;">Tu pedido <strong>#${this.escapeHtml(pedido.id)}</strong> ha sido registrado con estado: <span style="color: #d97706; font-weight: bold;">Pendiente de Pago</span>.</p>
        
        <h3 style="color: #1f2937; margin-top: 20px;">Resumen de Articulos</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6; text-align: left; color: #4b5563;">
              <th style="padding: 10px;">Articulo</th>
              <th style="padding: 10px; text-align: center;">Cantidad</th>
              <th style="padding: 10px; text-align: right;">Precio Unitario</th>
            </tr>
          </thead>
          <tbody>
            ${filasTabla}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 25px;">
          <h3 style="margin: 0; color: #111827;">Total a Pagar: <span style="color: #059669; font-size: 20px;">$${Number(pedido.total).toFixed(2)} MXN</span></h3>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px;">
          <h4 style="margin-top: 0; color: #92400e; font-size: 15px;">Instrucciones para Liquidar tu Pago:</h4>
          <p style="margin: 4px 0 8px 0; font-size: 13px; color: #78350f;">Realiza una transferencia electronica (SPEI) o deposito bancario con la siguiente informacion:</p>
          <ul style="font-size: 13px; margin: 0; padding-left: 20px; color: #78350f; line-height: 1.6;">
            <li><strong>Banco Receptor:</strong> BBVA Mexico</li>
            <li><strong>Beneficiario:</strong> HexaCommerce S.A. de C.V.</li>
            <li><strong>CLABE Interbancaria:</strong> 012 180 00123456789 0</li>
            <li><strong>Concepto / Referencia:</strong> PEDIDO-${this.escapeHtml(pedido.id)}</li>
          </ul>
          <p style="font-size: 12px; color: #92400e; margin: 10px 0 0 0;">Una vez validado el pago, tu pedido cambiara a estado Pagado para su despacho.</p>
        </div>
      </div>
    `;

    const info = await this.transporter.sendMail({
      from: '"HexaCommerce" <notificaciones@hexacommerce.unach.mx>',
      to: cliente.email,
      subject: `Confirmacion de Pedido #${pedido.id} - Pendiente de Pago`,
      html: htmlContent,
    });

    console.log(`\n======================================================`);
    console.log(`✉️ Correo emitido a: ${cliente.email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 LINK PARA VER EL CORREO (Ethereal Preview):`);
      console.log(`${previewUrl}`);
    }
    console.log(`======================================================\n`);

    return { messageId: info.messageId, previewUrl };
  }

  async notificarNuevoPedidoAdmin({ pedido, cliente, items }) {
    await this.asegurarTransporter();

    return await this.transporter.sendMail({
      from: '"HexaCommerce Notificaciones" <sistema@hexacommerce.unach.mx>',
      to: process.env.ADMIN_EMAIL || 'admin@hexacommerce.unach.mx',
      subject: `[Alerta Admin] Nueva Orden #${pedido.id} Registrada`,
      text: `Se ha registrado el pedido #${pedido.id} por el cliente ${cliente.nombre} (${cliente.email}). Monto: $${pedido.total}. Estado: Pendiente de Pago.`,
    });
  }
}

module.exports = NodemailerEmailAdapter;
