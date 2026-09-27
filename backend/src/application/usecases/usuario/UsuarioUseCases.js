const Usuario = require('../../../domain/entities/Usuario');

class UsuarioUseCases {
  constructor(usuarioRepo, hashAdapter) {
    this.usuarioRepo = usuarioRepo;
    this.hashAdapter = hashAdapter;
  }

  async registrar(datos) {
    const usuario = new Usuario(datos);
    usuario.validarPasswordLongitud();

    const existe = await this.usuarioRepo.buscarPorEmail(usuario.email);
    if (existe) throw new Error("El correo electrónico ya se encuentra registrado");

    const hashedPassword = await this.hashAdapter.hash(usuario.password);
    usuario.password = hashedPassword;

    return await this.usuarioRepo.crear(usuario);
  }

  async login(email, password) {
    const usuario = await this.usuarioRepo.buscarPorEmail(email);
    if (!usuario) throw new Error("Credenciales inválidas");

    const valido = await this.hashAdapter.compare(password, usuario.password);
    if (!valido) throw new Error("Credenciales inválidas");

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    };
  }

  async listar() {
    return await this.usuarioRepo.listar();
  }

  async actualizar(id, datos) {
    if (datos.password && datos.password.trim() !== "") {
      datos.password = await this.hashAdapter.hash(datos.password);
    }
    return await this.usuarioRepo.actualizar(id, datos);
  }

  async eliminar(id) {
    return await this.usuarioRepo.eliminar(id);
  }
}

module.exports = UsuarioUseCases;
