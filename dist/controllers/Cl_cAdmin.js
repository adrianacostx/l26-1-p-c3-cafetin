import sPedido from "../services/Cl_sPedido.js";
import sProducto from "../services/Cl_sProducto.js";
import Cl_mPedido from "../models/Cl_mPedido.js";
export default class Cl_cAdmin {
    vista;
    pedidos = [];
    productos = [];
    filtros = { estado: "Todos", metodoPago: "Todos", fecha: "", producto: "Todos" };
    constructor(vista) {
        this.vista = vista;
        this.vista.onProcesarPedido((id) => this.procesarPedido(id));
        this.vista.onCancelarPedido((id) => this.cancelarPedido(id));
        this.vista.onFiltrarPedidos((filtros) => {
            this.filtros = filtros;
            this.vista.mostrarPedidos(this.filtrarPedidos());
        });
        this.vista.onGuardarProducto(async (producto) => await this.guardarProducto(producto));
        this.vista.onEliminarProducto(async (id) => await this.eliminarProducto(id));
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
            this.vista.mostrarProductos(this.productos);
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
                detallesPago: p.DetallesPago,
                fecha: p.Fecha || (p.createdAt ? p.createdAt.split("T")[0] : ""),
                estado: p.estado
            }));
            this.vista.mostrarPedidos(this.filtrarPedidos());
        }
    }
    filtrarPedidos() {
        return this.pedidos.filter(p => {
            const estadoMatch = this.filtros.estado === "Todos" || p.estado === this.filtros.estado;
            const pagoMatch = this.filtros.metodoPago === "Todos" || p.metodoPago === this.filtros.metodoPago;
            const fechaMatch = !this.filtros.fecha || p.fecha === this.filtros.fecha;
            const productoMatch = this.filtros.producto === "Todos" || p.items.some((item) => item.nombre === this.filtros.producto);
            return estadoMatch && pagoMatch && fechaMatch && productoMatch;
        });
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
    async eliminarProducto(id) {
        const res = await sProducto.eliminar(id);
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.mensaje);
        if (res.ok)
            await this.cargarProductos();
    }
}
//# sourceMappingURL=Cl_cAdmin.js.map