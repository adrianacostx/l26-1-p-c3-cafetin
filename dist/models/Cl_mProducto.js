export default class Cl_mProducto {
    _id;
    _codigo = "";
    _nombre = "";
    _categoria = "";
    _precio = 0;
    constructor({ id, codigo, nombre, categoria, precio }) {
        this._id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
    }
    get id() { return this._id; }
    set codigo(value) { this._codigo = value; }
    get codigo() { return this._codigo; }
    set nombre(value) { this._nombre = value; }
    get nombre() { return this._nombre; }
    set categoria(value) { this._categoria = value; }
    get categoria() { return this._categoria; }
    set precio(value) { this._precio = value; }
    get precio() { return this._precio; }
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
//# sourceMappingURL=Cl_mProducto.js.map