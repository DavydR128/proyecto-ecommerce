const Pedido = require('../../../domain/entities/Pedido');

class PedidoUseCases {
  constructor(commerceRepo) {
    this.commerceRepo = commerceRepo;
  }

  async crearPedido(usuarioId, items) {
    const pedido = new Pedido({ usuario_id: usuarioId, items });
    return await this.commerceRepo.crearPedidoTransaccional(usuarioId, items);
  }

  async listar() {
    return await this.commerceRepo.listarPedidos();
  }
}

module.exports = PedidoUseCases;
