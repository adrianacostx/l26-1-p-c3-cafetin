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
    validarYPrepararPedido(datos) {
        // validaciones
        if (!datos.cedula.trim())
            throw new Error("Ingrese la cédula del cliente");
        if (!datos.nomCliente.trim())
            throw new Error("Ingrese su nombre");
        if (this.estaVacio())
            throw new Error("Agregue al menos un producto");
        if (!datos.metodoPago)
            throw new Error("Seleccione un método de pago");
        let detallesPago = "";
        let montoEfectivoBS = 0;
        let montoEfectivoUSD = 0;
        switch (datos.metodoPago) {
            case "Pago Móvil":
                if (!datos.referenciaPago?.trim()) {
                    throw new Error("Ingrese referencia/número de teléfono para Pago Móvil");
                }
                detallesPago = datos.referenciaPago.trim();
                break;
            case "Otro":
                if (!datos.descripcionOtro?.trim()) {
                    throw new Error("Ingrese una descripción para 'Otro'");
                }
                detallesPago = datos.descripcionOtro.trim();
                break;
            case "Efectivo Bs.":
                const monto = parseFloat(datos.montoEfectivo || "");
                if (isNaN(monto) || monto <= 0) {
                    throw new Error("Ingrese un monto válido para Efectivo Bs.");
                }
                montoEfectivoBS = monto;
                detallesPago = `Bs. ${monto.toFixed(2)}`;
                break;
            case "Efectivo USD":
                const montoUsd = parseFloat(datos.montoEfectivoUSD || "");
                if (isNaN(montoUsd) || montoUsd <= 0) {
                    throw new Error("Ingrese un monto válido para Efectivo USD");
                }
                montoEfectivoUSD = montoUsd;
                detallesPago = `$ ${montoUsd.toFixed(2)}`;
                break;
            default:
                throw new Error("Método de pago no reconocido");
        }
        return {
            cedula: datos.cedula.trim(),
            nomCliente: datos.nomCliente.trim(),
            items: this.getItemsParaEnvio(),
            metodoPago: datos.metodoPago,
            detallesPago,
            montoEfectivoBS,
            montoEfectivoUSD,
        };
    }
}
//# sourceMappingURL=Cl_mCarrito.js.map