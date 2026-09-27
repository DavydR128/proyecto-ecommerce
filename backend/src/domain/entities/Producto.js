class Producto {
  constructor({ id, nombre, descripcion, precio, stock, imagen_url, creado_en }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = parseFloat(precio);
    this.stock = parseInt(stock);
    this.imagen_url = imagen_url;
    this.creado_en = creado_en;
  }

  validarStockDisponible(cantidadRequerida) {
    if (this.stock < cantidadRequerida) {
      throw new Error(`Stock insuficiente para el producto ${this.nombre}. Existencias: ${this.stock}`);
    }
  }

  descontarStock(cantidad) {
    this.validarStockDisponible(cantidad);
    this.stock -= cantidad;
  }
}

module.exports = Producto;
