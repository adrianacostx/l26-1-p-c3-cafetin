import sPedido from "../services/Cl_sPedido.js";
import sProducto from "../services/Cl_sProducto.js";
import Cl_mPedido from "../models/Cl_mPedido.js";
import Cl_mProducto from "../models/Cl_mProducto.js";
export default class Cl_cAdmin {
    vista;
    pedidos = [];
    productos = [];
    filtros = { estado: "Todos", metodoPago: "Todos", fecha: "", producto: "Todos" };
    filtroNombreProducto = "";
    filtroPorCodigo = "";
    filtroCedula = "";
    constructor(vista) {
        this.vista = vista;
        this.vista.onProcesarPedido((id) => this.procesarPedido(id));
        this.vista.onCancelarPedido((id) => this.cancelarPedido(id));
        this.vista.onFiltrarPedidos((filtros) => {
            this.filtros = filtros;
            this.vista.mostrarPedidos(this.obtenerPedidosFiltrados());
        });
        this.vista.onBuscarProducto((texto) => {
            this.filtroNombreProducto = texto.trim().toLowerCase();
            this.vista.mostrarProductos(this.obtenerEstadisticasProductos());
        });
        this.vista.onBuscarPorCodigo((codigo) => {
            this.filtroPorCodigo = codigo.trim().toLowerCase();
            this.vista.mostrarProductos(this.obtenerEstadisticasProductos());
        });
        this.vista.onBuscarCedula((cedula) => {
            this.filtroCedula = cedula.trim();
            this.vista.mostrarPedidos(this.obtenerPedidosFiltrados());
            const total = Cl_mPedido.totalPorCedula(this.pedidos, cedula);
            this.vista.mostrarTotalPagadoCliente(total);
        });
        this.vista.onGuardarProducto(async (producto) => await this.guardarProducto(producto));
        this.vista.onEliminarProducto(async (id, accion) => await this.eliminarProducto(id, accion));
        this.vista.onAnalisisProducto((codigo) => this.mostrarAnalisisProducto(codigo));
        this.cargarDatos();
        setInterval(() => this.cargarPedidos(), 5000);
    }
    async cargarDatos() {
        await Promise.all([this.cargarProductos(), this.cargarPedidos()]);
    }
    async cargarProductos() {
        const res = await sProducto.obtenerTodos();
        if (res.ok) {
            this.productos = res.data;
            this.vista.mostrarProductos(this.obtenerEstadisticasProductos());
            const resNombres = await sProducto.obtenerNombresUnicos();
            if (resNombres.ok) {
                this.vista.poblarFiltroProductos(resNombres.nombres);
            }
            this.vista.poblarSelectAnalisisProducto(this.productos);
        }
    }
    async cargarPedidos() {
        const res = await sPedido.obtenerTodos();
        if (res.ok) {
            this.pedidos = res.data.map((p) => new Cl_mPedido({
                id: p.id,
                nomCliente: p.NomCliente,
                items: p.Items || [],
                metodoPago: p.MetodoPago,
                montoEfectivoBS: p.MontoEfectivoBS || 0,
                montoEfectivoUSD: p.MontoEfectivoUSD || 0,
                cedula: p.Cedula,
                detallesPago: p.DetallesPago,
                fecha: p.createdAt ? p.createdAt.split("T")[0] : (p.Fecha || ""),
                estado: p.estado || "Pendiente",
            }));
            this.vista.mostrarPedidos(this.obtenerPedidosFiltrados());
            this.vista.mostrarProductos(this.obtenerEstadisticasProductos());
            const totalBS = Cl_mPedido.totalEfectivoBS(this.pedidos);
            this.vista.mostrarTotalEfectivoBS(totalBS);
            this.mostrarEstadisticas();
        }
    }
    mostrarEstadisticas() {
        const totalHoy = Cl_mPedido.totalRecaudadoEnFecha(this.pedidos);
        this.vista.mostrarTotalRecaudadoHoy(totalHoy);
        const masVendido = Cl_mProducto.obtenerProductoMasVendido(this.productos, this.pedidos);
        if (masVendido) {
            this.vista.mostrarProductoMasVendido(masVendido.producto, masVendido.unidades, masVendido.ingreso);
        }
        else {
            this.vista.mostrarProductoMasVendido(null, 0, 0);
        }
        const mayorIngreso = Cl_mProducto.obtenerProductoMayorIngreso(this.productos, this.pedidos);
        if (mayorIngreso) {
            this.vista.mostrarProductoMayorIngreso(mayorIngreso.producto, mayorIngreso.ingreso);
        }
        else {
            this.vista.mostrarProductoMayorIngreso(null, 0);
        }
    }
    mostrarAnalisisProducto(codigo) {
        const producto = this.productos.find(p => p.codigo === codigo);
        if (!producto) {
            this.vista.mostrarEstadisticasProducto(0, 0);
            return;
        }
        const stats = Cl_mProducto.obtenerEstadisticasPorCodigo(codigo, this.pedidos);
        if (stats) {
            this.vista.mostrarEstadisticasProducto(stats.unidades, stats.ingreso);
        }
        else {
            this.vista.mostrarEstadisticasProducto(0, 0);
        }
    }
    obtenerEstadisticasProductos() {
        const productosFiltrados = this.filtroNombreProducto
            ? this.productos.filter(producto => producto.nombre.toLowerCase().includes(this.filtroNombreProducto))
            : this.productos;
        const productosFiltradosPorCodigo = this.filtroPorCodigo
            ? productosFiltrados.filter(producto => producto.codigo.toLowerCase().includes(this.filtroPorCodigo))
            : productosFiltrados;
        return Cl_mProducto.calcularEstadisticas(productosFiltradosPorCodigo, this.pedidos);
    }
    obtenerPedidosFiltrados() {
        let filtrados = Cl_mPedido.filtrar(this.pedidos, this.filtros);
        const cedulaNormalizada = this.filtroCedula.trim().toLowerCase();
        if (cedulaNormalizada) {
            filtrados = filtrados.filter(p => p.cedula.toLowerCase().includes(cedulaNormalizada));
        }
        return filtrados;
    }
    async procesarPedido(id) {
        const res = await sPedido.actualizarEstado(id, "Procesado");
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.ok ? "Pedido procesado" : res.mensaje);
        if (res.ok)
            await this.cargarPedidos();
    }
    async cancelarPedido(id) {
        const res = await sPedido.actualizarEstado(id, "Cancelado");
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.ok ? "Pedido cancelado" : res.mensaje);
        if (res.ok)
            await this.cargarPedidos();
    }
    async guardarProducto(producto) {
        let res;
        if (producto.id) {
            res = await sProducto.actualizar(producto.id, producto);
        }
        else {
            res = await sProducto.agregar(producto);
        }
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.mensaje);
        if (res.ok)
            await this.cargarProductos();
    }
    async eliminarProducto(id, accion) {
        if (accion === "disable") {
            const producto = this.productos.find(p => p.id === id);
            if (!producto) {
                this.vista.mostrarModal("danger", "No se encontró el producto");
                return;
            }
            if (producto.disponible === false) {
                this.vista.mostrarModal("warning", "El producto ya está marcado como no disponible");
                return;
            }
            const res = await sProducto.actualizar(id, { ...producto, disponible: false });
            this.vista.mostrarModal(res.ok ? "success" : "danger", res.mensaje);
            if (res.ok)
                await this.cargarProductos();
            return;
        }
        if (accion === "enable") {
            const producto = this.productos.find(p => p.id === id);
            if (!producto) {
                this.vista.mostrarModal("danger", "No se encontró el producto");
                return;
            }
            if (producto.disponible === true) {
                this.vista.mostrarModal("warning", "El producto ya está marcado como disponible");
                return;
            }
            const res = await sProducto.actualizar(id, { ...producto, disponible: true });
            this.vista.mostrarModal(res.ok ? "success" : "danger", res.mensaje);
            if (res.ok)
                await this.cargarProductos();
            return;
        }
        const res = await sProducto.eliminar(id);
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.mensaje);
        if (res.ok)
            await this.cargarProductos();
    }
}
//# sourceMappingURL=Cl_cAdmin.js.map