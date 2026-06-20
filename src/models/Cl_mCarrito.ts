export type CarritoItem = {
    codigo: string;
    nombre: string;
    precio: number;
    cantidad: number;
};

export default class Cl_mCarrito {
    private items: CarritoItem[] = [];

    getItems(): CarritoItem[] {
        return [...this.items];
    }

    agregar(producto: { codigo: string; nombre: string; precio: number }, cantidad: number): void {
        if (cantidad <= 0) return;
        const existente = this.items.find(item => item.codigo === producto.codigo);
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            this.items.push({
                codigo: producto.codigo,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad
            });
        }
    }

    eliminar(codigo: string): void {
        this.items = this.items.filter(item => item.codigo !== codigo);
    }

    vaciar(): void {
        this.items = [];
    }

    calcularTotal(): number {
        return this.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    }

    estaVacio(): boolean {
        return this.items.length === 0;
    }

    getItemsParaEnvio(): CarritoItem[] {
        return this.items.map(item => ({ ...item }));
    }

    validarYPrepararPedido(datos: {
        nomCliente: string;
        cedula: string;
        metodoPago: string;
        referenciaPago?: string;
        descripcionOtro?: string;
        montoEfectivo?: string;
        montoEfectivoUSD?: string;
    }): {
        nomCliente: string;
        cedula: string;
        items: CarritoItem[];
        metodoPago: string;
        detallesPago: string;
        montoEfectivoBS: number;
        montoEfectivoUSD: number;
    } {
        // validaciones
        if (!datos.cedula.trim() || isNaN(parseInt(datos.cedula))) throw new Error("Ingrese la cédula del cliente");
        if (datos.cedula.length < 7) throw new Error("La cédula debe tener al menos 7 dígitos");
        if (!datos.nomCliente.trim()) throw new Error("Ingrese su nombre");
        if (this.estaVacio()) throw new Error("Agregue al menos un producto");
        if (!datos.metodoPago) throw new Error("Seleccione un método de pago");

        let detallesPago = "";
        let montoEfectivoBS = 0;
        let montoEfectivoUSD = 0;

        switch (datos.metodoPago) {
            case "Pago Móvil":
                if (!datos.referenciaPago?.trim()) {
                    throw new Error("Ingrese referencia/número de teléfono para Pago Móvil");
                } else if (datos.referenciaPago.length < 4) {
                    throw new Error("La referencia/número de teléfono debe contener al menos 4 digitos");
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