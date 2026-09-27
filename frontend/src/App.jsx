import { useState, useEffect } from "react";

function App() {
  // --- ESTADO DE SESIÓN (LOGIN) ---
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [modoAuth, setModoAuth] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authNombre, setAuthNombre] = useState("");
  const [authRol, setAuthRol] = useState("CLIENTE");

  // --- NAVEGACIÓN ---
  const [pestana, setPestana] = useState("catalogo");

  // --- ESTADOS: USUARIOS (Solo ADMIN) ---
  const [usuarios, setUsuarios] = useState([]);
  const [uNombre, setUNombre] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uRol, setURol] = useState("CLIENTE");
  const [uIdEditando, setUIdEditando] = useState(null);

  // --- ESTADOS: PRODUCTOS ---
  const [productos, setProductos] = useState([]);
  const [pNombre, setPNombre] = useState("");
  const [pDescripcion, setPDescripcion] = useState("");
  const [pPrecio, setPPrecio] = useState("");
  const [pStock, setPStock] = useState("");
  const [pImagenUrl, setPImagenUrl] = useState("");
  const [pIdEditando, setPIdEditando] = useState(null);

  // --- ESTADOS: PEDIDOS / COMPRAS ---
  const [pedidos, setPedidos] = useState([]);
  const [cantidadesSeleccionadas, setCantidadesSeleccionadas] = useState({});

  const API_BASE = "http://localhost:3000/api";

  useEffect(() => {
    if (usuarioActual) {
      if (usuarioActual.rol === "ADMIN") {
        cargarUsuarios();
      }
      cargarProductos();
      cargarPedidos();
      // Asignar pestaña por defecto según rol
      setPestana(usuarioActual.rol === "ADMIN" ? "usuarios" : "catalogo");
    }
  }, [usuarioActual]);

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (modoAuth === "registro") {
      try {
        const res = await fetch(`${API_BASE}/usuarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: authNombre, email: authEmail, password: authPassword, rol: authRol }),
        });
        if (res.ok) {
          alert("Usuario registrado exitosamente. Ya puedes iniciar sesión.");
          setModoAuth("login");
          setAuthPassword("");
        } else {
          const err = await res.json();
          alert(err.msg || "Error en el registro");
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const res = await fetch(`${API_BASE}/usuarios/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        });
        if (res.ok) {
          const data = await res.json();
          setUsuarioActual(data.usuario);
        } else {
          const err = await res.json();
          alert(err.msg || "Credenciales incorrectas");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleLogout = () => {
    setUsuarioActual(null);
    setAuthEmail("");
    setAuthPassword("");
    setAuthNombre("");
    setCantidadesSeleccionadas({});
  };

  // ==========================================
  // CRUD USUARIOS (ADMINISTRADOR)
  // ==========================================
  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`${API_BASE}/usuarios`);
      if (res.ok) setUsuarios(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    const url = uIdEditando ? `${API_BASE}/usuarios/${uIdEditando}` : `${API_BASE}/usuarios`;
    const method = uIdEditando ? "PUT" : "POST";
    const bodyData = { nombre: uNombre, email: uEmail, rol: uRol };
    if (uPassword.trim() !== "") bodyData.password = uPassword;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      if (res.ok) {
        setUIdEditando(null);
        setUNombre("");
        setUEmail("");
        setUPassword("");
        cargarUsuarios();
      } else {
        const err = await res.json();
        alert(err.msg || "Error al procesar usuario");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (!confirm(`¿Eliminar usuario ID ${id}?`)) return;
    await fetch(`${API_BASE}/usuarios/${id}`, { method: "DELETE" });
    cargarUsuarios();
  };

  // ==========================================
  // GESTIÓN PRODUCTOS (ADMIN)
  // ==========================================
  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_BASE}/productos`);
      if (res.ok) setProductos(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    const url = pIdEditando ? `${API_BASE}/productos/${pIdEditando}` : `${API_BASE}/productos`;
    const method = pIdEditando ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: pNombre,
          descripcion: pDescripcion,
          precio: parseFloat(pPrecio),
          stock: parseInt(pStock),
          imagen_url: pImagenUrl || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=60",
        }),
      });
      if (res.ok) {
        setPIdEditando(null);
        setPNombre("");
        setPDescripcion("");
        setPPrecio("");
        setPStock("");
        setPImagenUrl("");
        cargarProductos();
      } else {
        const err = await res.json();
        alert(err.msg || "Error al guardar producto");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEliminarProducto = async (id) => {
    if (!confirm(`¿Eliminar producto ID ${id}?`)) return;
    await fetch(`${API_BASE}/productos/${id}`, { method: "DELETE" });
    cargarProductos();
  };

  // ==========================================
  // PEDIDOS (TRANSACCIONAL)
  // ==========================================
  const cargarPedidos = async () => {
    try {
      const res = await fetch(`${API_BASE}/pedidos`);
      if (res.ok) {
        const data = await res.json();
        // Separación estricta de datos
        if (usuarioActual?.rol === "CLIENTE") {
          setPedidos(data.filter((ped) => ped.usuario_id === usuarioActual.id));
        } else {
          setPedidos(data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compra directa para el cliente
  const handleComprarProducto = async (productoId) => {
    const cantidad = cantidadesSeleccionadas[productoId] || 1;
    try {
      const res = await fetch(`${API_BASE}/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuarioActual.id,
          items: [{ producto_id: productoId, cantidad: parseInt(cantidad) }],
        }),
      });

      if (res.ok) {
        alert("¡Compra realizada con éxito!");
        cargarPedidos();
        cargarProductos();
      } else {
        const err = await res.json();
        alert(err.msg || "Error al procesar la compra");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // =========================================================
  // ESTILOS COMUNES
  // =========================================================
  const cardStyle = {
    background: "#161b22",
    borderRadius: "14px",
    border: "1px solid #30363d",
    padding: "24px",
    boxShadow: "0 10px 28px rgba(0,0,0,0.3)",
    marginBottom: "24px",
  };

  const inputStyle = {
    padding: "10px 14px",
    background: "#0d1117",
    color: "#e6edf3",
    border: "1px solid #30363d",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  };

  const btnPrimary = {
    padding: "10px 18px",
    background: "#238636",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  };

  // =========================================================
  // VISTA: LOGIN / REGISTRO
  // =========================================================
  if (!usuarioActual) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", padding: "20px" }}>
        <div style={{ ...cardStyle, width: "100%", maxWidth: "420px", marginBottom: 0 }}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <div style={{ width: "48px", height: "48px", background: "rgba(31, 111, 235, 0.15)", borderRadius: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#58a6ff", marginBottom: "12px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            </div>
            <h2 style={{ color: "#f0f6fc", margin: "0 0 6px 0", fontSize: "22px" }}>
              {modoAuth === "login" ? "Iniciar Sesión" : "Crear Nueva Cuenta"}
            </h2>
            <span style={{ color: "#8b949e", fontSize: "13px" }}>E-Commerce con Arquitectura Hexagonal</span>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {modoAuth === "registro" && (
              <>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#8b949e", display: "block", marginBottom: "6px" }}>Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={authNombre}
                    onChange={(e) => setAuthNombre(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#8b949e", display: "block", marginBottom: "6px" }}>Rol Asignado</label>
                  <select
                    value={authRol}
                    onChange={(e) => setAuthRol(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  >
                    <option value="CLIENTE">CLIENTE (Solo Catálogo y Compras)</option>
                    <option value="ADMIN">ADMIN (Acceso Total)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#8b949e", display: "block", marginBottom: "6px" }}>Correo Institucional</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="ejemplo@unach.mx"
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#8b949e", display: "block", marginBottom: "6px" }}>Contraseña Segura</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
              />
            </div>

            <button type="submit" style={{ ...btnPrimary, width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}>
              {modoAuth === "login" ? "Ingresar al Panel" : "Completar Registro"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#8b949e" }}>
            {modoAuth === "login" ? (
              <p style={{ margin: 0 }}>
                ¿No tienes cuenta?{" "}
                <span onClick={() => setModoAuth("registro")} style={{ color: "#58a6ff", cursor: "pointer", fontWeight: "600" }}>
                  Crear una aquí
                </span>
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                ¿Ya tienes cuenta?{" "}
                <span onClick={() => setModoAuth("login")} style={{ color: "#58a6ff", cursor: "pointer", fontWeight: "600" }}>
                  Inicia sesión
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PANEL AUTENTICADO CON RBAC
  // =========================================================
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* SIDEBAR IZQUIERDO */}
      <aside style={{ width: "260px", background: "#161b22", borderRight: "1px solid #30363d", display: "flex", flexDirection: "column", padding: "24px 16px", boxSizing: "border-box", flexShrink: 0 }}>
        {/* Identidad */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "26px", paddingLeft: "6px" }}>
          <div style={{ width: "36px", height: "36px", background: "#1f6feb", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#f0f6fc" }}>HexaCommerce</h4>
            <span style={{ fontSize: "11px", color: "#8b949e" }}>PostgreSQL + Node.js</span>
          </div>
        </div>

        {/* Tarjeta del Rol */}
        <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: "10px", padding: "14px", marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>SESIÓN ACTIVA</div>
          <div style={{ fontWeight: "600", color: "#f0f6fc", fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{usuarioActual.nombre}</div>
          <div style={{ marginTop: "6px", display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: usuarioActual.rol === "ADMIN" ? "rgba(240, 136, 62, 0.2)" : "rgba(46, 160, 67, 0.2)", color: usuarioActual.rol === "ADMIN" ? "#f0883e" : "#3fb950", border: usuarioActual.rol === "ADMIN" ? "1px solid rgba(240, 136, 62, 0.4)" : "1px solid rgba(46, 160, 67, 0.4)" }}>
            ROL: {usuarioActual.rol}
          </div>
        </div>

        {/* Menú de Navegación según Rol */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flexGrow: 1 }}>
          <div style={{ fontSize: "11px", color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.5px", padding: "6px 12px" }}>MÓDULOS</div>

          {/* SOLO ADMIN: MÓDULO DE USUARIOS */}
          {usuarioActual.rol === "ADMIN" && (
            <button
              onClick={() => setPestana("usuarios")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                background: pestana === "usuarios" ? "#1f6feb" : "transparent",
                color: pestana === "usuarios" ? "#ffffff" : "#c9d1d9",
                cursor: "pointer",
                fontWeight: pestana === "usuarios" ? "600" : "500",
                fontSize: "14px",
                textAlign: "left",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Usuarios (Admin)
            </button>
          )}

          {/* ADMIN: Gestión Inventario | CLIENTE: Catálogo Tienda */}
          <button
            onClick={() => setPestana(usuarioActual.rol === "ADMIN" ? "productos_admin" : "catalogo")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "none",
              background: (pestana === "productos_admin" || pestana === "catalogo") ? "#1f6feb" : "transparent",
              color: (pestana === "productos_admin" || pestana === "catalogo") ? "#ffffff" : "#c9d1d9",
              cursor: "pointer",
              fontWeight: (pestana === "productos_admin" || pestana === "catalogo") ? "600" : "500",
              fontSize: "14px",
              textAlign: "left",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            {usuarioActual.rol === "ADMIN" ? "Gestión de Productos" : "Catálogo y Tienda"}
          </button>

          {/* ADMIN: Historial Global | CLIENTE: Mis Compras */}
          <button
            onClick={() => setPestana("pedidos")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "none",
              background: pestana === "pedidos" ? "#1f6feb" : "transparent",
              color: pestana === "pedidos" ? "#ffffff" : "#c9d1d9",
              cursor: "pointer",
              fontWeight: pestana === "pedidos" ? "600" : "500",
              fontSize: "14px",
              textAlign: "left",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            {usuarioActual.rol === "ADMIN" ? "Historial Global Pedidos" : "Mis Compras Realizadas"}
          </button>
        </nav>

        {/* Desconexión */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid rgba(248, 81, 73, 0.4)",
            background: "rgba(248, 81, 73, 0.1)",
            color: "#f85149",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Cerrar Sesión
        </button>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main style={{ flexGrow: 1, padding: "32px 40px", overflowY: "auto" }}>
        
        {/* ========================================================= */}
        {/* VISTA ADMIN 1: GESTIÓN DE USUARIOS */}
        {/* ========================================================= */}
        {pestana === "usuarios" && usuarioActual.rol === "ADMIN" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px 0", color: "#f0f6fc" }}>Gestión de Usuarios (Exclusivo Administrador)</h2>
              <p style={{ margin: 0, color: "#8b949e", fontSize: "14px" }}>Control de cuentas y credenciales encriptadas con algoritmo Bcrypt.</p>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: "16px", marginTop: 0, marginBottom: "16px", color: "#f0f6fc" }}>
                {uIdEditando ? "Modificar Usuario" : "Registrar Nuevo Usuario"}
              </h3>
              <form onSubmit={handleGuardarUsuario} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#8b949e", display: "block", marginBottom: "4px" }}>Nombre</label>
                  <input
                    type="text"
                    required
                    value={uNombre}
                    onChange={(e) => setUNombre(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#8b949e", display: "block", marginBottom: "4px" }}>Email</label>
                  <input
                    type="email"
                    required
                    value={uEmail}
                    onChange={(e) => setUEmail(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#8b949e", display: "block", marginBottom: "4px" }}>Contraseña {uIdEditando && "(Opcional)"}</label>
                  <input
                    type="password"
                    required={!uIdEditando}
                    value={uPassword}
                    onChange={(e) => setUPassword(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#8b949e", display: "block", marginBottom: "4px" }}>Rol</label>
                  <select
                    value={uRol}
                    onChange={(e) => setURol(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  >
                    <option value="CLIENTE">CLIENTE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="submit" style={{ ...btnPrimary, background: uIdEditando ? "#1f6feb" : "#238636", flex: 1, justifyContent: "center" }}>
                    {uIdEditando ? "Actualizar" : "Registrar"}
                  </button>
                  {uIdEditando && (
                    <button type="button" onClick={() => { setUIdEditando(null); setUNombre(""); setUEmail(""); }} style={{ ...btnPrimary, background: "#30363d" }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#21262d", borderBottom: "1px solid #30363d", color: "#8b949e" }}>
                    <th style={{ padding: "12px 16px" }}>ID</th>
                    <th style={{ padding: "12px 16px" }}>Nombre</th>
                    <th style={{ padding: "12px 16px" }}>Email</th>
                    <th style={{ padding: "12px 16px" }}>Rol</th>
                    <th style={{ padding: "12px 16px" }}>Hash Bcrypt</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #21262d" }}>
                      <td style={{ padding: "14px 16px", color: "#8b949e" }}>#{u.id}</td>
                      <td style={{ padding: "14px 16px", fontWeight: "600", color: "#f0f6fc" }}>{u.nombre}</td>
                      <td style={{ padding: "14px 16px" }}>{u.email}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", background: u.rol === "ADMIN" ? "rgba(240, 136, 62, 0.15)" : "rgba(46, 160, 67, 0.15)", color: u.rol === "ADMIN" ? "#f0883e" : "#3fb950" }}>
                          {u.rol}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "11px", color: "#8b949e", maxWidth: "220px", wordBreak: "break-all" }}>{u.password}</td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => { setUIdEditando(u.id); setUNombre(u.nombre); setUEmail(u.email); setURol(u.rol || "CLIENTE"); }}
                          style={{ background: "#d29922", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", marginRight: "6px", fontSize: "12px" }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarUsuario(u.id)}
                          style={{ background: "#da3633", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VISTA ADMIN 2: GESTIÓN DE PRODUCTOS (CRUD TOTAL) */}
        {/* ========================================================= */}
        {pestana === "productos_admin" && usuarioActual.rol === "ADMIN" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px 0", color: "#f0f6fc" }}>Gestión de Artículos (Administrador)</h2>
              <p style={{ margin: 0, color: "#8b949e", fontSize: "14px" }}>Panel con permisos para agregar, modificar o eliminar productos del inventario.</p>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: "16px", marginTop: 0, marginBottom: "16px", color: "#f0f6fc" }}>
                {pIdEditando ? "Actualizar Artículo" : "Agregar Artículo al Catálogo"}
              </h3>
              <form onSubmit={handleGuardarProducto} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#8b949e", display: "block", marginBottom: "4px" }}>Nombre</label>
                  <input
                    type="text"
                    required
                    value={pNombre}
                    onChange={(e) => setPNombre(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#8b949e", display: "block", marginBottom: "4px" }}>Descripción</label>
                  <input
                    type="text"
                    value={pDescripcion}
                    onChange={(e) => setPDescripcion(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#8b949e", display: "block", marginBottom: "4px" }}>URL Imagen</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={pImagenUrl}
                    onChange={(e) => setPImagenUrl(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#8b949e", display: "block", marginBottom: "4px" }}>Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pPrecio}
                    onChange={(e) => setPPrecio(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#8b949e", display: "block", marginBottom: "4px" }}>Stock</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="submit" style={{ ...btnPrimary, background: pIdEditando ? "#1f6feb" : "#238636", flex: 1, justifyContent: "center" }}>
                    {pIdEditando ? "Actualizar" : "Guardar"}
                  </button>
                  {pIdEditando && (
                    <button type="button" onClick={() => { setPIdEditando(null); setPNombre(""); setPDescripcion(""); setPImagenUrl(""); }} style={{ ...btnPrimary, background: "#30363d" }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#21262d", borderBottom: "1px solid #30363d", color: "#8b949e" }}>
                    <th style={{ padding: "12px 16px", width: "70px" }}>Imagen</th>
                    <th style={{ padding: "12px 16px" }}>Artículo</th>
                    <th style={{ padding: "12px 16px" }}>Descripción</th>
                    <th style={{ padding: "12px 16px" }}>Precio Unitario</th>
                    <th style={{ padding: "12px 16px" }}>Stock</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #21262d" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <img
                          src={p.imagen_url || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=120&auto=format&fit=crop&q=60"}
                          alt={p.nombre}
                          style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "10px", border: "1px solid #30363d" }}
                        />
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: "600", color: "#f0f6fc" }}>{p.nombre}</td>
                      <td style={{ padding: "14px 16px", color: "#8b949e", maxWidth: "260px" }}>{p.descripcion || "Sin descripción"}</td>
                      <td style={{ padding: "14px 16px", fontWeight: "700", color: "#58a6ff", fontSize: "14px" }}>${parseFloat(p.precio).toFixed(2)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", background: p.stock > 0 ? "rgba(46, 160, 67, 0.15)" : "rgba(248, 81, 73, 0.15)", color: p.stock > 0 ? "#3fb950" : "#f85149" }}>
                          {p.stock} unidades
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => { setPIdEditando(p.id); setPNombre(p.nombre); setPDescripcion(p.descripcion); setPPrecio(p.precio); setPStock(p.stock); setPImagenUrl(p.imagen_url || ""); }}
                          style={{ background: "#d29922", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", marginRight: "6px", fontSize: "12px" }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarProducto(p.id)}
                          style={{ background: "#da3633", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VISTA CLIENTE: VITRINA DIGITAL DE COMPRA (SIN CRUD) */}
        {/* ========================================================= */}
        {pestana === "catalogo" && usuarioActual.rol === "CLIENTE" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px 0", color: "#f0f6fc" }}>Tienda y Catálogo Disponible</h2>
              <p style={{ margin: 0, color: "#8b949e", fontSize: "14px" }}>Selecciona los productos y la cantidad que desees adquirir.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {productos.map((prod) => (
                <div key={prod.id} style={{ ...cardStyle, padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: 0 }}>
                  <div>
                    <img
                      src={prod.imagen_url || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=60"}
                      alt={prod.nombre}
                      style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "10px", marginBottom: "14px" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <h3 style={{ margin: 0, fontSize: "17px", color: "#f0f6fc", fontWeight: "600" }}>{prod.nombre}</h3>
                      <span style={{ fontSize: "17px", fontWeight: "700", color: "#58a6ff" }}>${parseFloat(prod.precio).toFixed(2)}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#8b949e", margin: "0 0 16px 0", minHeight: "36px" }}>{prod.descripcion}</p>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontSize: "12px" }}>
                      <span style={{ color: "#8b949e" }}>Disponibilidad:</span>
                      <span style={{ fontWeight: "600", color: prod.stock > 0 ? "#3fb950" : "#f85149" }}>
                        {prod.stock > 0 ? `${prod.stock} disponibles` : "Agotado"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="number"
                        min="1"
                        max={prod.stock}
                        disabled={prod.stock <= 0}
                        value={cantidadesSeleccionadas[prod.id] || 1}
                        onChange={(e) => setCantidadesSeleccionadas({ ...cantidadesSeleccionadas, [prod.id]: e.target.value })}
                        style={{ ...inputStyle, width: "65px", textAlign: "center", boxSizing: "border-box" }}
                      />
                      <button
                        onClick={() => handleComprarProducto(prod.id)}
                        disabled={prod.stock <= 0}
                        style={{
                          ...btnPrimary,
                          flex: 1,
                          justifyContent: "center",
                          background: prod.stock > 0 ? "#238636" : "#30363d",
                          cursor: prod.stock > 0 ? "pointer" : "not-allowed",
                        }}
                      >
                        {prod.stock > 0 ? "Comprar Ahora" : "Sin Stock"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VISTA COMPARTIDA: PEDIDOS (ADMIN = TODOS | CLIENTE = PROPIOS) */}
        {/* ========================================================= */}
        {pestana === "pedidos" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px 0", color: "#f0f6fc" }}>
                {usuarioActual.rol === "ADMIN" ? "Historial Global de Pedidos" : "Mis Compras Realizadas"}
              </h2>
              <p style={{ margin: 0, color: "#8b949e", fontSize: "14px" }}>
                {usuarioActual.rol === "ADMIN"
                  ? "Monitoreo de todas las compras ejecutadas por los clientes en PostgreSQL."
                  : "Listado de pedidos generados desde tu cuenta con confirmación de pago y fecha."}
              </p>
            </div>

            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#21262d", borderBottom: "1px solid #30363d", color: "#8b949e" }}>
                    <th style={{ padding: "12px 16px" }}>Folio</th>
                    <th style={{ padding: "12px 16px" }}>Cliente</th>
                    <th style={{ padding: "12px 16px" }}>Monto Facturado</th>
                    <th style={{ padding: "12px 16px" }}>Estado</th>
                    <th style={{ padding: "12px 16px" }}>Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((ped) => (
                    <tr key={ped.id} style={{ borderBottom: "1px solid #21262d" }}>
                      <td style={{ padding: "14px 16px", fontWeight: "600", color: "#58a6ff" }}>#{ped.id}</td>
                      <td style={{ padding: "14px 16px", color: "#f0f6fc" }}>{ped.cliente_nombre || `Usuario ID: ${ped.usuario_id}`}</td>
                      <td style={{ padding: "14px 16px", fontWeight: "700", color: "#3fb950" }}>${parseFloat(ped.total).toFixed(2)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", background: "rgba(46, 160, 67, 0.15)", color: "#3fb950" }}>
                          {ped.estado}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#8b949e" }}>{new Date(ped.creado_en).toLocaleString()}</td>
                    </tr>
                  ))}
                  {pedidos.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#8b949e" }}>
                        No se registran transacciones activas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;