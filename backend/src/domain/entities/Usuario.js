class Usuario {
  constructor({ id, nombre, email, password, rol = 'CLIENTE', creado_en }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.rol = rol;
    this.creado_en = creado_en;
  }

  validarPasswordLongitud() {
    if (!this.password || this.password.length < 4) {
      throw new Error("La contraseña debe contener al menos 4 caracteres.");
    }
  }
}

module.exports = Usuario;
