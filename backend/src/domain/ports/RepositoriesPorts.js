// Contratos de salida (Puertos de Arquitectura Hexagonal)
class UsuarioRepositoryPort {
  crear(usuario) { throw new Error("Método no implementado"); }
  buscarPorEmail(email) { throw new Error("Método no implementado"); }
  listar() { throw new Error("Método no implementado"); }
  actualizar(id, usuario) { throw new Error("Método no implementado"); }
  eliminar(id) { throw new Error("Método no implementado"); }
}

class ProductoRepositoryPort {
  listar() { throw new Error("Método no implementado"); }
  buscarPorId(id) { throw new Error("Método no implementado"); }
  crear(producto) { throw new Error("Método no implementado"); }
  actualizar(id, producto) { throw new Error("Método no implementado"); }
  eliminar(id) { throw new Error("Método no implementado"); }
}

class PedidoRepositoryPort {
  crearTransaccional(pedido) { throw new Error("Método no implementado"); }
  listar() { throw new Error("Método no implementado"); }
}

module.exports = {
  UsuarioRepositoryPort,
  ProductoRepositoryPort,
  PedidoRepositoryPort
};
