# Sistema de Pedidos - Cafetín

Este proyecto implementa un sistema web de pedidos para un cafetín. Incluye una sección de cliente para navegar productos, generar pedidos y un módulo administrativo para gestionar pedidos, productos y obtener reportes.

---

## Qué hace?

- Permite al cliente ver productos con imagen, categoría y precio.
- Filtra productos por nombre y categoría.
- Administra un carrito dinámico con subtotales y totales en USD y Bs.
- Obtiene la tasa de cambio desde 've.dolarapi.com' para convertir montos a bolívares.
- Guarda pedidos en una API simulada ('MockAPI').
- Administra pedidos y productos desde un panel administrativo.

---

## Módulo Cliente

- Visualiza productos disponibles con categoría, precio e imagen.
- Busca productos por nombre.
- Filtra por categorías.
- Agrega productos al carrito con cantidad.
- Registra cédula de cliente y autocompleta nombre si ya existe en pedidos previos.
- Elige método de pago:
  - Efectivo Bs.
  - Efectivo USD
  - Pago Móvil
  - Otro
- Calcula totales en USD y en Bs. automáticamente.
- Envía pedidos a la API simulada.

---

## Módulo Administración

- Lista todos los pedidos.
- Filtra pedidos por:
  - estado
  - método de pago
  - fecha
  - producto
- Busca pedidos por cédula de cliente.
- Permite procesar o cancelar pedidos pendientes.
- Gestiona productos con operaciones CRUD.
- Incluye reporte de producto más vendido y de mayor ingreso.
- Muestra totales de recaudación diaria en USD y Bs.
- Permite análisis individual de producto con unidades vendidas e ingresos.
- Actualiza el estado de pedidos periódicamente.

---

## Tecnologías

- TypeScript
- JavaScript compilado en 'dist/'
- HTML5
- CSS3
- Bootstrap 5
- MockAPI
- API de dólar ('ve.dolarapi.com')
- PlantUML para documentación de clases

---

## Estructura del proyecto

/
├── src/
│   ├── controllers/       # Cl_cAdmin.ts, Cl_cCliente.ts
│   ├── models/            # Cl_mPedido.ts, Cl_mProducto.ts, Cl_mCarrito.ts
│   ├── views/             # Cl_vAdmin.ts, Cl_vCliente.ts
│   ├── interfaces/        # I_vAdmin.ts, I_vCliente.ts
│   └── services/          # Cl_sPedido.ts, Cl_sProducto.ts, Cl_sMockApi.ts, Cl_sDolar.ts
├── dist/                  # Código JavaScript compilado
├── resources/
│   └── img/               # Imágenes de productos
├── admin.html             # Vista administrativa
├── cliente.html           # Vista de cliente
├── index.html             # Landing / inicio
├── tsconfig.json          # Configuración de TypeScript
└── README.md              # Documentación del proyecto