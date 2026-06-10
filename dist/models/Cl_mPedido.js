export default class Cl_mPedido {
    _id;
    _nomCliente = "";
    _items = [];
    _metodoPago = "";
    _detallesPago = "";
    _fecha = "";
    _estado = "Pendiente";
    constructor({ id, nomCliente, items, metodoPago, detallesPago, fecha, estado }) {
        this._id = id;
        this.nomCliente = nomCliente;
        this.items = items;
        this.metodoPago = metodoPago;
        this.detallesPago = detallesPago;
        this._fecha = fecha && fecha.trim() ? fecha : new Date().toISOString().split("T")[0];
        if (estado)
            this.estado = estado;
    }
    get id() { return this._id; }
    set nomCliente(value) { this._nomCliente = value; }
    get nomCliente() { return this._nomCliente; }
    set items(value) { this._items = value ?? []; }
    get items() { return this._items; }
    set metodoPago(value) { this._metodoPago = value; }
    get metodoPago() { return this._metodoPago; }
    set detallesPago(value) { this._detallesPago = value; }
    get detallesPago() { return this._detallesPago; }
    set fecha(value) { this._fecha = value; }
    get fecha() { return this._fecha; }
    set estado(value) { this._estado = value; }
    get estado() { return this._estado; }
    total() {
        return this.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    }
    cantidadTotal() {
        return this.items.reduce((sum, item) => sum + item.cantidad, 0);
    }
    coincideConFiltros(filtros) {
        const estadoMatch = filtros.estado === "Todos" || this.estado === filtros.estado;
        const pagoMatch = filtros.metodoPago === "Todos" || this.metodoPago === filtros.metodoPago;
        const fechaMatch = !filtros.fecha || this.fecha === filtros.fecha;
        const productoMatch = filtros.producto === "Todos" || this.items.some(item => item.nombre === filtros.producto);
        return estadoMatch && pagoMatch && fechaMatch && productoMatch;
    }
    calcularUnidadesSolicitadasDeProducto(codigo, nombre) {
        return this.items
            .filter(item => item.codigo === codigo || item.nombre === nombre)
            .reduce((sum, item) => sum + (Number(item.cantidad) || 1), 0);
    }
    toJSON() {
        return {
            NomCliente: this.nomCliente,
            Items: this.items,
            Total: this.total,
            MetodoPago: this.metodoPago,
            DetallesPago: this.detallesPago,
            Fecha: this.fecha,
            estado: this.estado
        };
    }
}
//# sourceMappingURL=Cl_mPedido.js.map