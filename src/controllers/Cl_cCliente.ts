import I_vCliente from "../interfaces/I_vCliente.js";
import sPedido from "../services/Cl_sPedido.js";
import sProducto from "../services/Cl_sProducto.js";
import Cl_mCarrito from "../models/Cl_mCarrito.js";
import Cl_mPedido from "../models/Cl_mPedido.js";
import Cl_sDolar from "../services/Cl_sDolar.js";

export default class Cl_cCliente {
    private vista: I_vCliente;
    private productos: any[] = [];
    private carrito: Cl_mCarrito;
    private clientesPorCedula: Map<string, string> = new Map();
    private filtroNombreProducto = "";
    private filtroCategoriaProducto = "Todas";

    constructor(vista: I_vCliente) {
        this.vista = vista;
        this.carrito = new Cl_mCarrito();

        this.vista.onAgregarProducto((codigo, cantidad) => this.agregarAlCarrito(codigo, cantidad));
        this.vista.onEliminarProducto((codigo) => this.eliminarDelCarrito(codigo));
        this.vista.onBuscarProducto((texto) => {
            this.filtroNombreProducto = texto.trim().toLowerCase();
            this.mostrarProductosFiltrados();
        });
        this.vista.onBuscarPorCategoria((categoria) => {
            this.filtroCategoriaProducto = categoria;
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
            const pedidos = resultado.data.map((p: any) => new Cl_mPedido({
                id: p.id,
                nomCliente: p.NomCliente,
                items: p.Items || [],
                metodoPago: p.MetodoPago,
                montoEfectivoBS: p.MontoEfectivoBS || 0,
                montoEfectivoUSD: p.MontoEfectivoUSD || 0,
                cedula: p.Cedula,
                detallesPago: p.DetallesPago,
                fecha: p.Fecha || (p.createdAt ? p.createdAt.split("T")[0] : ""),
                estado: p.estado || "Pendiente",
            }));
            this.clientesPorCedula = Cl_mPedido.obtenerClientesUnicos(pedidos);
        }
    }

    private buscarClientePorCedula(cedula: string) {
        const clave = cedula.trim().toLowerCase();
        if (!clave) return;
        const nombre = this.clientesPorCedula.get(clave);
        if (nombre && !this.vista.nomCliente.trim()) {
            this.vista.setNombreCliente(nombre);
        }
    }

    private mostrarProductosFiltrados() {
        const productosFiltrados = this.productos
            .filter(prod => prod.disponible !== false)
            .filter(prod => !this.filtroNombreProducto || prod.nombre.toLowerCase().includes(this.filtroNombreProducto))
            .filter(prod => this.filtroCategoriaProducto === "Todas" || prod.categoria === this.filtroCategoriaProducto);
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

    public async actualizarVistaCarrito() {
    try {
        const totalUSD = this.carrito.calcularTotal();
        const tasa = await Cl_sDolar.obtenerTasa();
        const totalBs = totalUSD * tasa;
        this.vista.mostrarCarrito(this.carrito.getItems());
        this.vista.mostrarTotal(totalUSD, totalBs);
    } catch (error) {
        console.error("Error al actualizar el carrito:", error);
        // Si falla la tasa, mostrar solo USD y Bs. 0
        const totalUSD = this.carrito.calcularTotal();
        this.vista.mostrarCarrito(this.carrito.getItems());
        this.vista.mostrarTotal(totalUSD, 0);
    }
}

    async enviarPedido() {
        try {
            const cedula = this.vista.cedulaCliente.trim();
            const nombre = this.vista.nomCliente.trim();

            if (cedula) {
                const clave = cedula.toLowerCase();
                const nombreRegistrado = this.clientesPorCedula.get(clave);
                if (nombreRegistrado && nombreRegistrado.toLowerCase() !== nombre.toLowerCase()) {
                    throw new Error(`La cédula ${cedula} se encuentra registrada con otro cliente. Ingrese una cédula diferente.`);
                }
            }

            const datos = {
                nomCliente: nombre,
                cedula: cedula,
                metodoPago: this.vista.metodoPago,
                referenciaPago: this.vista.referenciaPago,
                descripcionOtro: this.vista.descripcionOtro,
                montoEfectivo: this.vista.montoEfectivo,
                montoEfectivoUSD: this.vista.montoEfectivoUSD,
            };

            const pedidoPreparado = this.carrito.validarYPrepararPedido(datos);

            const pedidoParaEnviar = {
                NomCliente: pedidoPreparado.nomCliente,
                Cedula: pedidoPreparado.cedula,
                Items: pedidoPreparado.items,
                Total: this.carrito.calcularTotal(),
                MetodoPago: pedidoPreparado.metodoPago,
                MontoEfectivoBS: pedidoPreparado.montoEfectivoBS,
                MontoEfectivoUSD: pedidoPreparado.montoEfectivoUSD,
                DetallesPago: pedidoPreparado.detallesPago,
                estado: "Pendiente",
            };

            const resultado = await sPedido.agregar(pedidoParaEnviar);
            this.vista.mostrarAlerta(resultado.ok ? "success" : "danger", resultado.mensaje);

            if (resultado.ok) {
                if (cedula) {
                    const clave = cedula.toLowerCase();
                    if (!this.clientesPorCedula.has(clave)) {
                        this.clientesPorCedula.set(clave, nombre);
                    }
                }
                this.carrito.vaciar();
                this.vista.limpiar();
                this.actualizarVistaCarrito();
            }
        } catch (error: any) {
            this.vista.mostrarAlerta("danger", error.message);
        }
    }
}