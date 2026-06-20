import Cl_mPedido from "./Cl_mPedido.js";

export default class Cl_mProducto {
    private _id?: string;
    private _codigo: string = "";
    private _nombre: string = "";
    private _categoria: string = "";
    private _precio: number = 0;
    private _imagen: string = "";
    private _disponible: boolean = true;

    constructor({
        id,
        codigo,
        nombre,
        categoria,
        precio,
        imagen = "",
        disponible = true,
    }: {
        id?: string;
        codigo: string;
        nombre: string;
        categoria: string;
        precio: number;
        imagen?: string;
        disponible?: boolean;
    }) {
        this._id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.imagen = imagen;
        this.disponible = disponible;
    }

    get id(): string | undefined {
        return this._id;
    }

    set codigo(value: string) {
        this._codigo = value;
    }
    get codigo(): string {
        return this._codigo;
    }

    set nombre(value: string) {
        this._nombre = value;
    }
    get nombre(): string {
        return this._nombre;
    }

    set categoria(value: string) {
        this._categoria = value;
    }
    get categoria(): string {
        return this._categoria;
    }

    set precio(value: number) {
        this._precio = value;
    }
    get precio(): number {
        return this._precio;
    }

    set imagen(value: string) {
        this._imagen = value;
    }
    get imagen(): string {
        return this._imagen;
    }

    set disponible(value: boolean) {
        this._disponible = value;
    }
    get disponible(): boolean {
        return this._disponible;
    }

    static obtenerEstadisticasPorCodigo(codigo: string, pedidos: Cl_mPedido[]): { unidades: number; ingreso: number } | null {
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

        if (unidades === 0 && ingreso === 0) return null;
        return { unidades, ingreso };
    }

    static obtenerProductoMasVendido(productos: any[], pedidos: Cl_mPedido[]): { producto: any; unidades: number; ingreso: number } | null {
        if (pedidos.length === 0 || productos.length === 0) return null;

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

        if (!productoMasVendido) return null;

        return {
            producto: productoMasVendido,
            unidades: maxUnidades,
            ingreso: ingresoMax,
        };
    }

    static obtenerProductoMayorIngreso(productos: any[], pedidos: Cl_mPedido[]): { producto: any; ingreso: number } | null {
        if (pedidos.length === 0 || productos.length === 0) return null;
        let maxIngreso = 0;
        let productoMayor = null;
        for (const producto of productos) {
            const stats = this.obtenerEstadisticasPorCodigo(producto.codigo, pedidos);
            if (stats && stats.ingreso > maxIngreso) {
                maxIngreso = stats.ingreso;
                productoMayor = producto;
            }
        }
        if (!productoMayor) return null;
        return { producto: productoMayor, ingreso: maxIngreso };
    }

    static calcularEstadisticas(productos: any[], pedidos: Cl_mPedido[]): any[] {
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
            imagen: this.imagen,
            precio: this.precio,
            disponible: this.disponible,
        };
    }
}