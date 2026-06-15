export default class Cl_mPedido {
    private _id?: string;
    private _nomCliente: string = "";
    private _items: { codigo: string; nombre: string; precio: number; cantidad: number }[] = [];
    private _metodoPago: string = "";
    private _montoEntregado: number = 0;
    private _montoEfectivoBS: number = 0;
    private _montoEfectivoUSD: number = 0;
    private _cedula: string = "";
    private _detallesPago: string = "";
    private _fecha: string = "";
    private _estado: string = "Pendiente";

    constructor({ id, nomCliente, items, metodoPago, detallesPago, fecha, estado, montoEntregado, montoEfectivoBS, montoEfectivoUSD, cedula }: 
                { id?: string; nomCliente: string; items: any[]; metodoPago: string; detallesPago: string; estado?: string; fecha?: string; montoEntregado?: number; montoEfectivoBS?: number; montoEfectivoUSD?: number; cedula?: string }) {
        this._id = id;
        this.nomCliente = nomCliente;
        this.items = items;
        this.metodoPago = metodoPago;
        this.montoEfectivoBS = Number(montoEfectivoBS) || 0;
        this.montoEfectivoUSD = Number(montoEfectivoUSD) || 0;
        this.montoEntregado = montoEntregado ?? (this._montoEfectivoBS + this._montoEfectivoUSD);
        this.cedula = cedula || "";
        this.detallesPago = detallesPago;
        this._fecha = fecha && fecha.trim() ? fecha : new Date().toISOString().split("T")[0];
        if (estado) this.estado = estado;
    }

    get id(): string | undefined { return this._id; }
    set nomCliente(value: string) { this._nomCliente = value; }
    get nomCliente(): string { return this._nomCliente; }
    set items(value: any[]) { this._items = value ?? []; }
    get items(): any[] { return this._items; }
    set metodoPago(value: string) { this._metodoPago = value; }
    get metodoPago(): string { return this._metodoPago; }
    set montoEntregado(value: number) { this._montoEntregado = value; }
    get montoEntregado(): number { return this._montoEntregado; }
    set montoEfectivoBS(value: number) { this._montoEfectivoBS = value; }
    get montoEfectivoBS(): number { return this._montoEfectivoBS; }
    set montoEfectivoUSD(value: number) { this._montoEfectivoUSD = value; }
    get montoEfectivoUSD(): number { return this._montoEfectivoUSD; }
    set cedula(value: string) { this._cedula = value.trim(); }
    get cedula(): string { return this._cedula; }
    set detallesPago(value: string) { this._detallesPago = value; }
    get detallesPago(): string { return this._detallesPago; }
    set fecha(value: string) { this._fecha = value; }
    get fecha(): string { return this._fecha; }
    set estado(value: string) { this._estado = value; }
    get estado(): string { return this._estado; }

    total(): number {
        return this.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    }

    cantidadTotal(): number {
        return this.items.reduce((sum, item) => sum + item.cantidad, 0);
    }

    coincideConFiltros(filtros: { estado: string; metodoPago: string; fecha: string; producto: string }): boolean {
        const estadoMatch = filtros.estado === "Todos" || this.estado === filtros.estado;
        const pagoMatch = filtros.metodoPago === "Todos" || this.metodoPago === filtros.metodoPago;
        const fechaMatch = !filtros.fecha || this.fecha === filtros.fecha;
        const productoMatch = filtros.producto === "Todos" || this.items.some(item => item.nombre === filtros.producto);
        return estadoMatch && pagoMatch && fechaMatch && productoMatch;
    }

    calcularUnidadesSolicitadasDeProducto(codigo: string, nombre: string): number {
        return this.items
            .filter(item => item.codigo === codigo || item.nombre === nombre)
            .reduce((sum, item) => sum + (Number(item.cantidad) || 1), 0);
    }

    toJSON() {
        return {
            NomCliente: this.nomCliente,
            Cedula: this.cedula,
            Items: this.items,
            Total: this.total(),
            MetodoPago: this.metodoPago,
            MontoEfectivoBS: this._montoEfectivoBS,
            MontoEfectivoUSD: this._montoEfectivoUSD,
            DetallesPago: this.detallesPago,
            Fecha: this.fecha,
            estado: this.estado
        };
    }
}