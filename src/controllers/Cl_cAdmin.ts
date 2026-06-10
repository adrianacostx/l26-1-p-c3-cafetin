import I_vAdmin from "../interfaces/I_vAdmin.js";
import sPedido from "../services/Cl_sPedido.js";
import sProducto from "../services/Cl_sProducto.js";
import Cl_mPedido from "../models/Cl_mPedido.js";
import Cl_mProducto from "../models/Cl_mProducto.js";

export default class Cl_cAdmin {
    private vista: I_vAdmin;
    private pedidos: Cl_mPedido[] = [];
    private productos: any[] = [];
    private filtros = { estado: "Todos", metodoPago: "Todos", fecha: "", producto: "Todos" };
    private filtroNombreProducto = "";

    constructor(vista: I_vAdmin) {
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
            this.pedidos = res.data.map((p: any) => new Cl_mPedido({
                id: p.id,
                nomCliente: p.NomCliente,
                items: p.Items,
                metodoPago: p.MetodoPago,
                detallesPago: p.DetallesPago,
                fecha: p.Fecha || (p.createdAt ? p.createdAt.split("T")[0] : ""),
                estado: p.estado
            }));
            this.vista.mostrarPedidos(this.obtenerPedidosFiltrados());
            this.vista.mostrarProductos(this.obtenerEstadisticasProductos());
        }
    }

    obtenerEstadisticasProductos() {
        const productosFiltrados = this.filtroNombreProducto
            ? this.productos.filter(producto => producto.nombre.toLowerCase().includes(this.filtroNombreProducto))
            : this.productos;

        return Cl_mProducto.calcularEstadisticas(productosFiltrados, this.pedidos);
    }

    obtenerPedidosFiltrados() {
        return this.pedidos.filter(pedido => pedido.coincideConFiltros(this.filtros));
    }

    async procesarPedido(id: string) {
        const res = await sPedido.actualizarEstado(id, "Procesado");
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.ok ? "Pedido procesado" : res.mensaje);
        if (res.ok) await this.cargarPedidos();
    }

    async cancelarPedido(id: string) {
        const res = await sPedido.actualizarEstado(id, "Cancelado");
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.ok ? "Pedido cancelado" : res.mensaje);
        if (res.ok) await this.cargarPedidos();
    }

    async guardarProducto(producto: any) {
        let res;
        if (producto.id) {
            res = await sProducto.actualizar(producto.id, producto);
        } else {
            res = await sProducto.agregar(producto);
        }
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.mensaje);
        if (res.ok) await this.cargarProductos();
    }

    async eliminarProducto(id: string) {
        const res = await sProducto.eliminar(id);
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.mensaje);
        if (res.ok) await this.cargarProductos();
    }
}