const pool = require('../../config/db');

class PostgresUsuarioRepository {
  async crear({ nombre, email, password, rol }) {
    const res = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, password, rol',
      [nombre, email, password, rol || 'CLIENTE']
    );
    return res.rows[0];
  }

  async buscarPorEmail(email) {
    const res = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return res.rows[0];
  }

  async listar() {
    const res = await pool.query('SELECT id, nombre, email, rol, password FROM usuarios ORDER BY id ASC');
    return res.rows;
  }

  async actualizar(id, { nombre, email, password, rol }) {
    if (password) {
      const res = await pool.query(
        'UPDATE usuarios SET nombre = $1, email = $2, password = $3, rol = $4 WHERE id = $5 RETURNING id, nombre, email, rol',
        [nombre, email, password, rol, id]
      );
      return res.rows[0];
    } else {
      const res = await pool.query(
        'UPDATE usuarios SET nombre = $1, email = $2, rol = $3 WHERE id = $4 RETURNING id, nombre, email, rol',
        [nombre, email, rol, id]
      );
      return res.rows[0];
    }
  }

  async eliminar(id) {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return true;
  }
}

module.exports = new PostgresUsuarioRepository();
