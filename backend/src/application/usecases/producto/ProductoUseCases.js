const Producto = require('../../../domain/entities/Producto');

class ProductoUseCases {
  constructor(productoRepo) {
    this.productoRepo = productoRepo;
  }

  async listar() {
    return await this.productoRepo.listarProductos();
  }

  async crear(datos) {
    const producto = new Producto(datos);
    return await this.productoRepo.crearProducto(producto);
  }

  async actualizar(id, datos) {
    return await this.productoRepo.actualizarProducto(id, datos);
  }

  async eliminar(id) {
    return await this.productoRepo.eliminarProducto(id);
  }
}

module.exports = ProductoUseCases;
