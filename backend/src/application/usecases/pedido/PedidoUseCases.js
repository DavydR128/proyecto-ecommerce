class PedidoUseCases {
  constructor(commerceRepository, emailService = null, usuarioRepository = null) {
    this.commerceRepository = commerceRepository;
    this.emailService = emailService;
    this.usuarioRepository = usuarioRepository;
  }

  async listar() {
    return await this.commerceRepository.listarPedidos();
  }

  async crearPedido(usuarioId, items) {
    // 1. Invoca el método transaccional real del repositorio con estado 'PENDIENTE'
    const nuevoPedido = await this.commerceRepository.crearPedidoTransaccional(
      usuarioId,
      items,
      'PENDIENTE'
    );

    // 2. Dispara el correo mediante el puerto de salida
    if (this.emailService) {
      try {
        let cliente = { nombre: 'Cliente Registrado', email: 'cliente@unach.mx' };

        if (this.usuarioRepository && typeof this.usuarioRepository.obtenerPorId === 'function') {
          const userFound = await this.usuarioRepository.obtenerPorId(usuarioId);
          if (userFound) cliente = userFound;
        } else if (this.usuarioRepository && typeof this.usuarioRepository.listar === 'function') {
          const todos = await this.usuarioRepository.listar();
          const userFound = todos.find((u) => u.id === Number(usuarioId));
          if (userFound) cliente = userFound;
        }

        const prods = await this.commerceRepository.listarProductos();
        const productosDetalle = (items || []).map((it) => {
          const prodInfo = (prods || []).find((p) => p.id === Number(it.producto_id));
          return {
            producto_id: it.producto_id,
            nombre: prodInfo ? prodInfo.nombre : `Artículo #${it.producto_id}`,
            cantidad: it.cantidad,
            precio: prodInfo ? prodInfo.precio : 0,
          };
        });

        this.emailService.enviarConfirmacionPedido({
          pedido: nuevoPedido,
          cliente,
          items: productosDetalle,
        }).catch((err) => console.error('Error al enviar correo al cliente:', err.message));

        this.emailService.notificarNuevoPedidoAdmin({
          pedido: nuevoPedido,
          cliente,
          items: productosDetalle,
        }).catch((err) => console.error('Error al notificar admin:', err.message));

      } catch (errNotif) {
        console.error('Aviso notificación:', errNotif.message);
      }
    }

    return nuevoPedido;
  }
}

module.exports = PedidoUseCases;