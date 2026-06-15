import I_vCliente from "../interfaces/I_vCliente.js";
import sPedido from "../services/Cl_sPedido.js";
import sProducto from "../services/Cl_sProducto.js";
import Cl_mCarrito from "../models/Cl_mCarrito.js";

export default class Cl_cCliente {
    private vista: I_vCliente;
    private productos: any[] = [];
    private carrito: Cl_mCarrito;
    private filtroNombreProducto = "";
    private clientesPorCedula: Map<string, string> = new Map();

    constructor(vista: I_vCliente) {
        this.vista = vista;
        this.carrito = new Cl_mCarrito();
        this.vista.onAgregarProducto((codigo, cantidad) => this.agregarAlCarrito(codigo, cantidad));
        this.vista.onEliminarProducto((codigo) => this.eliminarDelCarrito(codigo));
        this.vista.onBuscarProducto((texto) => {
            this.filtroNombreProducto = texto.trim().toLowerCase();
            this.mostrarProductosFiltrados();
        });
        this.vista.onCedulaChange((cedula) => this.buscarClientePorCedula(cedula));
        this.vista.onEnviar(() => this.enviarPedido());
        this.cargarClientes();
        this.cargarProductos();
    }

    async cargarProductos() {
        const resultado = await sProducto.obtenerTodos();
        if (resultado.ok) {
            this.productos = resultado.data;
            this.mostrarProductosFiltrados();
        } else {
            this.vista.mostrarAlerta("danger", "Error al cargar productos");
        }
    }

    async cargarClientes() {
        const resultado = await sPedido.obtenerTodos();
        if (resultado.ok) {
            resultado.data.forEach((pedido: any) => {
                const cedula = pedido.Cedula?.trim();
                const nombre = pedido.NomCliente?.trim();
                if (cedula && nombre && !this.clientesPorCedula.has(cedula.toLowerCase())) {
                    this.clientesPorCedula.set(cedula.toLowerCase(), nombre);
                }
            });
        }
    }

    private buscarClientePorCedula(cedula: string) {
        const clave = cedula.trim().toLowerCase();
        if (!clave) return;
        const nombre = this.clientesPorCedula.get(clave);
        if (nombre) {
            if (!this.vista.nomCliente.trim()) {
                this.vista.setNombreCliente(nombre);
            }
        }
    }

    private mostrarProductosFiltrados() {
        const productosFiltrados = this.productos
            .filter(prod => prod.disponible !== false)
            .filter(prod => !this.filtroNombreProducto || prod.nombre.toLowerCase().includes(this.filtroNombreProducto));
        this.vista.mostrarProductos(productosFiltrados);
    }

    public agregarAlCarrito(codigo: string, cantidad: number) {
        const producto = this.productos.find(p => p.codigo === codigo);
        if (!producto) return;
        this.carrito.agregar(producto, cantidad);
        this.actualizarVistaCarrito();
    }

    public eliminarDelCarrito(codigo: string) {
        this.carrito.eliminar(codigo);
        this.actualizarVistaCarrito();
    }

    public actualizarVistaCarrito() {
        this.vista.mostrarCarrito(this.carrito.getItems());
        this.vista.mostrarTotal(this.carrito.calcularTotal());
    }

    async enviarPedido() {
        const nomCliente = this.vista.nomCliente;
        if (!nomCliente.trim()) {
            this.vista.mostrarAlerta("danger", "Ingrese su nombre");
            return;
        }
        const cedula = this.vista.cedulaCliente;
        if (!cedula.trim()) {
            this.vista.mostrarAlerta("danger", "Ingrese la cédula del cliente");
            return;
        }
        if (this.carrito.estaVacio()) {
            this.vista.mostrarAlerta("warning", "Agregue al menos un producto");
            return;
        }
        const metodoPago = this.vista.metodoPago;
        if (!metodoPago) {
            this.vista.mostrarAlerta("danger", "Seleccione un método de pago");
            return;
        }
        let detallesPago = "";
        if (metodoPago === "Pago Móvil") {
            const ref = this.vista.referenciaPago;
            if (!ref.trim()) {
                this.vista.mostrarAlerta("danger", "Ingrese referencia/número de teléfono para Pago Móvil");
                return;
            }
            detallesPago = ref;
        } else if (metodoPago === "Otro") {
            const desc = this.vista.descripcionOtro;
            if (!desc.trim()) {
                this.vista.mostrarAlerta("danger", "Ingrese una descripción para 'Otro'");
                return;
            }
            detallesPago = desc;
        } else if (metodoPago === "Efectivo Bs.") {
            const monto = this.vista.montoEfectivo;
            if (!monto.trim() || isNaN(Number(monto)) || Number(monto) <= 0) {
                this.vista.mostrarAlerta("danger", "Ingrese un monto válido para Efectivo");
                return;
            }
            detallesPago = `Bs. ${Number(monto).toFixed(2)}`;
        } else if (metodoPago === "Efectivo USD") {
            const monto = this.vista.montoEfectivoUSD;
            if (!monto.trim() || isNaN(Number(monto)) || Number(monto) <= 0) {
                this.vista.mostrarAlerta("danger", "Ingrese un monto válido para Efectivo USD");
                return;
            }
            detallesPago = `$ ${Number(monto).toFixed(2)}`;
        }

        const pedido = {
            NomCliente: nomCliente,
            Cedula: cedula,
            Items: this.carrito.getItemsParaEnvio(),
            Total: this.carrito.calcularTotal(),
            MetodoPago: metodoPago,
            MontoEfectivoBS: metodoPago === "Efectivo Bs." ? Number(this.vista.montoEfectivo) : 0,
            MontoEfectivoUSD: metodoPago === "Efectivo USD" ? Number(this.vista.montoEfectivoUSD) : 0,
            DetallesPago: detallesPago,
            Fecha: new Date().toISOString().split("T")[0],
            estado: "Pendiente"
        };

        const resultado = await sPedido.agregar(pedido);
        this.vista.mostrarAlerta(resultado.ok ? "success" : "danger", resultado.mensaje);
        if (resultado.ok) {
            this.carrito.vaciar();
            this.vista.limpiar();
            this.actualizarVistaCarrito();
        }
    }
}