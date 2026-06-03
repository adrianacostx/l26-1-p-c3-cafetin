export default class Cl_mCarrito {
    items = [];
    getItems() {
        return [...this.items];
    }
    agregar(producto, cantidad) {
        if (cantidad <= 0)
            return;
        const existente = this.items.find(item => item.codigo === producto.codigo);
        if (existente) {
            existente.cantidad += cantidad;
        }
        else {
            this.items.push({
                codigo: producto.codigo,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad
            });
        }
    }
    eliminar(codigo) {
        this.items = this.items.filter(item => item.codigo !== codigo);
    }
    vaciar() {
        this.items = [];
    }
    calcularTotal() {
        return this.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    }
    estaVacio() {
        return this.items.length === 0;
    }
    getItemsParaEnvio() {
        return this.items.map(item => ({ ...item }));
    }
}
//# sourceMappingURL=Cl_mCarrito.js.map