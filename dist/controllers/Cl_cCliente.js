import sPedido from "../services/Cl_sPedido.js";
import sProducto from "../services/Cl_sProducto.js";
export default class Cl_cCliente {
    vista;
    productos = [];
    carrito = [];
    constructor(vista) {
        this.vista = vista;
        this.vista.onAgregarProducto((codigo, cantidad) => this.agregarAlCarrito(codigo, cantidad));
        this.vista.onEliminarProducto((codigo) => this.eliminarDelCarrito(codigo));
        this.vista.onEnviar(() => this.enviarPedido());
        this.cargarProductos();
    }
    async cargarProductos() {
        const resultado = await sProducto.obtenerTodos();
        if (resultado.ok) {
            this.productos = resultado.data;
            this.vista.mostrarProductos(this.productos);
        }
        else {
            this.vista.mostrarAlerta("danger", "Error al cargar productos");
        }
    }
    agregarAlCarrito(codigo, cantidad) {
        const producto = this.productos.find(p => p.codigo === codigo);
        if (!producto || cantidad < 1)
            return;
        const existente = this.carrito.find(item => item.codigo === codigo);
        if (existente) {
            existente.cantidad += cantidad;
        }
        else {
            this.carrito.push({
                codigo: producto.codigo,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad
            });
        }
        this.actualizarVistaCarrito();
    }
    eliminarDelCarrito(codigo) {
        this.carrito = this.carrito.filter(item => item.codigo !== codigo);
        this.actualizarVistaCarrito();
    }
    actualizarVistaCarrito() {
        this.vista.mostrarCarrito(this.carrito);
        this.vista.mostrarTotal(this.calcularTotal());
    }
    calcularTotal() {
        return this.carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    }
    async enviarPedido() {
        const nomCliente = this.vista.nomCliente;
        if (!nomCliente.trim()) {
            this.vista.mostrarAlerta("danger", "Ingrese su nombre");
            return;
        }
        if (this.carrito.length === 0) {
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
        }
        else if (metodoPago === "Otro") {
            const desc = this.vista.descripcionOtro;
            if (!desc.trim()) {
                this.vista.mostrarAlerta("danger", "Ingrese una descripción para 'Otro'");
                return;
            }
            detallesPago = desc;
        }
        const pedido = {
            NomCliente: nomCliente,
            Items: this.carrito,
            Total: this.calcularTotal(),
            MetodoPago: metodoPago,
            DetallesPago: detallesPago,
            estado: "Pendiente"
        };
        const resultado = await sPedido.agregar(pedido);
        this.vista.mostrarAlerta(resultado.ok ? "success" : "danger", resultado.mensaje);
        if (resultado.ok) {
            this.carrito = [];
            this.vista.limpiar();
            this.actualizarVistaCarrito();
        }
    }
}
//# sourceMappingURL=Cl_cCliente.js.map