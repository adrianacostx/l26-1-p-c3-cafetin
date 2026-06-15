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
        this.vista.onBuscarCedula((cedula) => {
            this.filtroCedula = cedula.trim();
            this.vista.mostrarPedidos(this.obtenerPedidosFiltrados());
            this.vista.mostrarTotalPagadoCliente(this.totalPagadoPorCedula(cedula));
        });
        this.vista.onGuardarProducto(async (producto) => await this.guardarProducto(producto));
        this.vista.onEliminarProducto(async (id, accion) => await this.eliminarProducto(id, accion));
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
        }
    }
    async cargarPedidos() {
        const res = await sPedido.obtenerTodos();
        if (res.ok) {
            this.pedidos = res.data.map((p) => new Cl_mPedido({
                id: p.id,
                nomCliente: p.NomCliente,
                items: p.Items,
                metodoPago: p.MetodoPago,
                montoEfectivoBS: p.MontoEfectivoBS,
                cedula: p.Cedula,
                detallesPago: p.DetallesPago,
                fecha: p.Fecha || (p.createdAt ? p.createdAt.split("T")[0] : ""),
                estado: p.estado
            }));
            this.vista.mostrarPedidos(this.obtenerPedidosFiltrados());
            this.vista.mostrarProductos(this.obtenerEstadisticasProductos());
            this.vista.mostrarTotalEfectivoBS(this.totalIngresadoEfectivoBS());
        }
    }
    obtenerEstadisticasProductos() {
        const productosFiltrados = this.filtroNombreProducto
            ? this.productos.filter(producto => producto.nombre.toLowerCase().includes(this.filtroNombreProducto))
            : this.productos;
        return Cl_mProducto.calcularEstadisticas(productosFiltrados, this.pedidos);
    }
    obtenerPedidosFiltrados() {
        const cedulaNormalizada = this.filtroCedula.trim().toLowerCase();
        return this.pedidos.filter(pedido => {
            const cedulaMatch = !cedulaNormalizada || pedido.cedula.toLowerCase().includes(cedulaNormalizada);
            return cedulaMatch && pedido.coincideConFiltros(this.filtros);
        });
    }
    totalIngresadoEfectivoBS() {
        return this.pedidos.reduce((sum, pedido) => sum + pedido.montoEfectivoBS, 0);
    }
    totalPagadoPorCedula(cedula) {
        const cedulaNormalizada = cedula.trim().toLowerCase();
        return this.pedidos
            .filter(pedido => pedido.cedula.toLowerCase() === cedulaNormalizada)
            .reduce((sum, pedido) => sum + pedido.total(), 0);
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