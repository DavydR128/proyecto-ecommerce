const API_BASE = "http://localhost:3000/api";

export const usuarioService = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res;
  },
  registrar: async (datos) => {
    const res = await fetch(`${API_BASE}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    return res;
  },
  listar: async () => {
    const res = await fetch(`${API_BASE}/usuarios`);
    return await res.json();
  },
  actualizar: async (id, datos) => {
    const res = await fetch(`${API_BASE}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    return res;
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_BASE}/usuarios/${id}`, { method: "DELETE" });
    return res;
  }
};

export const productoService = {
  listar: async () => {
    const res = await fetch(`${API_BASE}/productos`);
    return await res.json();
  },
  guardar: async (id, datos) => {
    const url = id ? `${API_BASE}/productos/${id}` : `${API_BASE}/productos`;
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    return res;
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_BASE}/productos/${id}`, { method: "DELETE" });
    return res;
  }
};

export const pedidoService = {
  listar: async () => {
    const res = await fetch(`${API_BASE}/pedidos`);
    return await res.json();
  },
  crear: async (usuario_id, items) => {
    const res = await fetch(`${API_BASE}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_id, items }),
    });
    return res;
  }
};
