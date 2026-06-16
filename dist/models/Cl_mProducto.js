export default class Cl_mProducto {
    _id;
    _codigo = "";
    _nombre = "";
    _categoria = "";
    _precio = 0;
    _disponible = true;
    constructor({ id, codigo, nombre, categoria, precio, disponible = true, }) {
        this._id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.disponible = disponible;
    }
    get id() {
        return this._id;
    }
    set codigo(value) {
        this._codigo = value;
    }
    get codigo() {
        return this._codigo;
    }
    set nombre(value) {
        this._nombre = value;
    }
    get nombre() {
        return this._nombre;
    }
    set categoria(value) {
        this._categoria = value;
    }
    get categoria() {
        return this._categoria;
    }
    set precio(value) {
        this._precio = value;
    }
    get precio() {
        return this._precio;
    }
    set disponible(value) {
        this._disponible = value;
    }
    get disponible() {
        return this._disponible;
    }
    static obtenerEstadisticasPorCodigo(codigo, pedidos) {
        let unidades = 0;
        let ingreso = 0;
        for (const pedido of pedidos) {
            for (const item of pedido.items) {
                if (item.codigo === codigo) {
                    unidades += item.cantidad;
                    ingreso += item.precio * item.cantidad;
                }
            }
        }
        if (unidades === 0 && ingreso === 0)
            return null;
        return { unidades, ingreso };
    }
    static obtenerProductoMasVendido(productos, pedidos) {
        if (pedidos.length === 0 || productos.length === 0)
            return null;
        let maxUnidades = 0;
        let productoMasVendido = null;
        let ingresoMax = 0;
        for (const producto of productos) {
            const stats = this.obtenerEstadisticasPorCodigo(producto.codigo, pedidos);
            if (stats && stats.unidades > maxUnidades) {
                maxUnidades = stats.unidades;
                ingresoMax = stats.ingreso;
                productoMasVendido = producto;
            }
        }
        if (!productoMasVendido)
            return null;
        return {
            producto: productoMasVendido,
            unidades: maxUnidades,
            ingreso: ingresoMax,
        };
    }
    static calcularEstadisticas(productos, pedidos) {
        const totalUnidadesSolicitadas = pedidos.reduce((total, pedido) => total + pedido.cantidadTotal(), 0);
        return productos.map(producto => {
            const stats = this.obtenerEstadisticasPorCodigo(producto.codigo, pedidos);
            const cantidadSolicitada = stats ? stats.unidades : 0;
            const ingresoTotal = stats ? stats.ingreso : 0;
            const porcentajeSolicitado = totalUnidadesSolicitadas > 0
                ? (cantidadSolicitada / totalUnidadesSolicitadas) * 100
                : 0;
            return {
                ...producto,
                cantidadSolicitada,
                porcentajeSolicitado,
                ingresoTotal,
            };
        });
    }
    toJSON() {
        return {
            tabla: "producto",
            codigo: this.codigo,
            nombre: this.nombre,
            categoria: this.categoria,
            precio: this.precio,
            disponible: this.disponible,
        };
    }
}
//# sourceMappingURL=Cl_mProducto.js.map