# HexaCommerce - Plataforma E-Commerce con Arquitectura Hexagonal

Sistema full-stack de comercio electrónico desarrollado con separación estricta de responsabilidades bajo los principios de Arquitectura Hexagonal (Puertos y Adaptadores), desplegado y validado en infraestructura de nube Amazon Web Services (AWS EC2).

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, Vite, CSS modular responsivo, Iconografía web.
- **Backend:** Node.js, Express.js (Arquitectura Hexagonal).
- **Base de Datos:** PostgreSQL 15 (Relacional con claves foráneas e integridad referencial).
- **Seguridad:** Encriptación de contraseñas mediante algoritmo `bcryptjs`, autenticación y control de acceso basado en roles (RBAC: `ADMIN` / `CLIENTE`).
- **DevOps & Cloud:** AWS EC2 (Amazon Linux 2023), PM2 (Process Manager), Git/GitHub.

---

## 🏛️ Arquitectura del Sistema (Hexagonal)

El backend desacopla por completo las reglas de negocio del framework y los motores externos:

```text
backend/
├── src/
│   ├── domain/               # Núcleo del dominio (Entidades y reglas de negocio puras)
│   │   ├── entities/         # Usuario, Producto, Pedido
│   │   └── ports/            # Interfaces abstractas de persistencia y seguridad
│   ├── application/          # Casos de uso
│   │   └── usecases/         # Lógica aplicativa (autenticación, inventario, pedidos)
│   └── infrastructure/       # Adaptadores externos y configuración
│       ├── adapters/
│       │   ├── repositories/ # Adaptador de persistencia PostgreSQL (Pool pg)
│       │   └── security/     # Adaptador de hashing criptográfico (BcryptAdapter)
│       ├── http/             # Controladores y endpoints REST Express
│       └── config/           # Parámetros de entorno y conexión a base de datos
└── server.js                 # Punto de entrada e inyección de dependencias
