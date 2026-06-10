import Cl_mPedido from "./Cl_mPedido.js";

export default class Cl_mProducto {
    private _id?: string;
    private _codigo: string = "";
    private _nombre: string = "";
    private _categoria: string = "";
    private _precio: number = 0;

    constructor({ id, codigo, nombre, categoria, precio }: 
                { id?: string; codigo: string; nombre: string; categoria: string; precio: number }) {
        this._id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
    }

    get id(): string | undefined { return this._id; }
    set codigo(value: string) { this._codigo = value; }
    get codigo(): string { return this._codigo; }
    set nombre(value: string) { this._nombre = value; }
    get nombre(): string { return this._nombre; }
    set categoria(value: string) { this._categoria = value; }
    get categoria(): string { return this._categoria; }
    set precio(value: number) { this._precio = value; }
    get precio(): number { return this._precio; }

    static calcularEstadisticas(productos: any[], pedidos: Cl_mPedido[]): any[] {
        const totalUnidadesSolicitadas = pedidos.reduce((total, pedido) => total + pedido.cantidadTotal(), 0);
        return productos.map(producto => {
            const cantidadSolicitada = pedidos.reduce((total, pedido) => 
                total + pedido.calcularUnidadesSolicitadasDeProducto(producto.codigo, producto.nombre), 0);
            const porcentajeSolicitado = totalUnidadesSolicitadas > 0 
                ? (cantidadSolicitada / totalUnidadesSolicitadas) * 100 
                : 0;
            return { ...producto, cantidadSolicitada, porcentajeSolicitado };
        });
    }

    toJSON() {
        return {
            tabla: "producto",
            codigo: this.codigo,
            nombre: this.nombre,
            categoria: this.categoria,
            precio: this.precio
        };
    }
}