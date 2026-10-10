const express = require('express');
const cors = require('cors');

// Adaptadores de infraestructura
const usuarioRepo = require('./src/infrastructure/adapters/repositories/PostgresUsuarioRepository');
const commerceRepo = require('./src/infrastructure/adapters/repositories/PostgresCommerceRepository');
const bcryptAdapter = require('./src/infrastructure/adapters/security/BcryptAdapter');

// Adaptador analitico
const AnalyticsPostgresAdapter = require('./src/infrastructure/database/postgres/AnalyticsPostgresAdapter');
const analyticsRepo = new AnalyticsPostgresAdapter(commerceRepo.pool || commerceRepo);

// Adaptador de Correo (Nodemailer)
const NodemailerEmailAdapter = require('./src/infrastructure/adapters/email/NodemailerEmailAdapter');
const emailAdapter = new NodemailerEmailAdapter();

// Casos de uso
const UsuarioUseCases = require('./src/application/usecases/usuario/UsuarioUseCases');
const ProductoUseCases = require('./src/application/usecases/producto/ProductoUseCases');
const PedidoUseCases = require('./src/application/usecases/pedido/PedidoUseCases');
const AnalyticsService = require('./src/application/use-cases/analytics/AnalyticsService');

const usuarioService = new UsuarioUseCases(usuarioRepo, bcryptAdapter);
const productoService = new ProductoUseCases(commerceRepo);
const pedidoService = new PedidoUseCases(commerceRepo, emailAdapter, usuarioRepo);
const analyticsService = new AnalyticsService(analyticsRepo);

const app = express();
app.use(cors());
app.use(express.json());

// CONTROLADOR: USUARIOS
app.post('/api/usuarios/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await usuarioService.login(email, password);
    res.json({ usuario });
  } catch (err) {
    res.status(401).json({ msg: err.message || 'Credenciales invalidas' });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const nuevo = await usuarioService.registrar(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ msg: err.message || 'Error al registrar usuario' });
  }
});

app.get('/api/usuarios', async (req, res) => {
  try {
    const listado = await usuarioService.listar();
    res.json(listado);
  } catch (err) {
    res.status(500).json({ msg: 'Error al listar usuarios' });
  }
});

app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const actualizado = await usuarioService.actualizar(req.params.id, req.body);
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ msg: err.message || 'Error al actualizar' });
  }
});

app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    await usuarioService.eliminar(req.params.id);
    res.json({ msg: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar usuario' });
  }
});

// CONTROLADOR: PRODUCTOS
app.get('/api/productos', async (req, res) => {
  try {
    const prods = await productoService.listar();
    res.json(prods);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener productos' });
  }
});

app.post('/api/productos', async (req, res) => {
  try {
    const nuevo = await productoService.crear(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ msg: 'Error al crear producto' });
  }
});

app.put('/api/productos/:id', async (req, res) => {
  try {
    const act = await productoService.actualizar(req.params.id, req.body);
    res.json(act);
  } catch (err) {
    res.status(400).json({ msg: 'Error al modificar producto' });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  try {
    await productoService.eliminar(req.params.id);
    res.json({ msg: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar producto' });
  }
});

// CONTROLADOR: PEDIDOS
app.get('/api/pedidos', async (req, res) => {
  try {
    const pedidos = await pedidoService.listar();
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ msg: 'Error al consultar pedidos' });
  }
});

app.post('/api/pedidos', async (req, res) => {
  try {
    const { usuario_id, items } = req.body;
    const nuevoPedido = await pedidoService.crearPedido(usuario_id, items);
    res.status(201).json({
      ...nuevoPedido,
      mensaje: 'Pedido registrado correctamente. Se ha iniciado el envio de las instrucciones de pago por correo electronico.',
    });
  } catch (err) {
    res.status(400).json({ msg: err.message || 'Error al procesar el pedido' });
  }
});

// CONTROLADOR: ANALITICAS
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const { range, start, end } = req.query;
    const data = await analyticsService.getDashboardSummary({
      range,
      customStart: start,
      customEnd: end,
    });
    res.json(data);
  } catch (err) {
    console.error('Error al generar metricas:', err);
    res.status(500).json({ msg: 'Error al consultar metricas analiticas' });
  }
});

app.listen(3000, () => {
  console.log('Servidor Hexagonal activo en http://localhost:3000');
});
