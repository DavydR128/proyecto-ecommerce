class Pedido {
  constructor({ id, usuario_id, total = 0, estado = 'PENDIENTE', items = [], creado_en }) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.total = parseFloat(total);
    this.estado = estado;
    this.items = items;
    this.creado_en = creado_en;
  }

  calcularTotal() {
    this.total = this.items.reduce((acumulado, item) => {
      return acumulado + (parseFloat(item.precio_unitario) * parseInt(item.cantidad));
    }, 0);
    return this.total;
  }
}

module.exports = Pedido;
