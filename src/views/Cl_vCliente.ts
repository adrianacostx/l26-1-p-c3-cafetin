import I_vCliente from "../interfaces/I_vCliente.js";

export default class Cl_vCliente implements I_vCliente {
    private inNomCliente: HTMLInputElement;
    private divProductos: HTMLElement;
    private tablaCarrito: HTMLTableSectionElement;
    private spTotalPedido: HTMLSpanElement;
    private selectMetodoPago: HTMLSelectElement;
    private divPagoMovil: HTMLElement;
    private divOtro: HTMLElement;
    private inRefPago: HTMLInputElement;
    private inDescOtro: HTMLInputElement;
    private btEnviar: HTMLButtonElement;
    private alertContainer: HTMLElement;
    private agregarCallback?: (codigo: string, cantidad: number) => void;
    private eliminarCallback?: (codigo: string) => void;
    private enviarCallback?: () => void;

    constructor() {
        this.inNomCliente = document.getElementById("inNomCliente") as HTMLInputElement;
        this.divProductos = document.getElementById("listaProductos") as HTMLElement;
        this.tablaCarrito = document.getElementById("tablaCarrito") as HTMLTableSectionElement;
        this.spTotalPedido = document.getElementById("spTotalPedido") as HTMLSpanElement;
        this.selectMetodoPago = document.getElementById("metodoPago") as HTMLSelectElement;
        this.divPagoMovil = document.getElementById("divPagoMovil") as HTMLElement;
        this.divOtro = document.getElementById("divOtro") as HTMLElement;
        this.inRefPago = document.getElementById("refPagoMovil") as HTMLInputElement;
        this.inDescOtro = document.getElementById("descOtro") as HTMLInputElement;
        this.btEnviar = document.getElementById("btEnviar") as HTMLButtonElement;
        this.alertContainer = document.getElementById("clienteAlertContainer") as HTMLElement;

        this.selectMetodoPago.addEventListener("change", () => this.cambiarMetodoPago());
        this.btEnviar.onclick = () => this.enviarCallback?.();
        this.cambiarMetodoPago();
    }

    cambiarMetodoPago() {
        const value = this.selectMetodoPago.value;
        this.divPagoMovil.style.display = value === "Pago Móvil" ? "block" : "none";
        this.divOtro.style.display = value === "Otro" ? "block" : "none";
    }

    get nomCliente(): string { return this.inNomCliente.value; }
    get metodoPago(): string { return this.selectMetodoPago.value; }
    get referenciaPago(): string { return this.inRefPago.value; }
    get descripcionOtro(): string { return this.inDescOtro.value; }

    onAgregarProducto(callback: (codigo: string, cantidad: number) => void): void {
        this.agregarCallback = callback;
    }

    onEliminarProducto(callback: (codigo: string) => void): void {
        this.eliminarCallback = callback;
    }

    onEnviar(callback: () => void): void {
        this.enviarCallback = callback;
    }

    mostrarProductos(productos: any[]): void {
        this.divProductos.innerHTML = "";
        productos.forEach(prod => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-3";
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${prod.nombre}</h5>
                        <p class="card-text"><small>Categoría: ${prod.categoria}</small><br><strong>$${prod.precio.toFixed(2)}</strong></p>
                        <div class="input-group input-group-sm mb-2">
                            <input type="number" id="cant-${prod.codigo}" class="form-control" value="1" min="1">
                            <button class="btn btn-primary btn-agregar" data-codigo="${prod.codigo}">Agregar</button>
                        </div>
                    </div>
                </div>
            `;
            const btn = card.querySelector(".btn-agregar") as HTMLButtonElement;
            btn.onclick = () => {
                const input = document.getElementById(`cant-${prod.codigo}`) as HTMLInputElement;
                const cantidad = parseInt(input.value) || 1;
                this.agregarCallback?.(prod.codigo, cantidad);
            };
            this.divProductos.appendChild(card);
        });
    }

    mostrarCarrito(items: { codigo: string; nombre: string; precio: number; cantidad: number }[]): void {
        this.tablaCarrito.innerHTML = "";
        items.forEach(item => {
            const fila = this.tablaCarrito.insertRow();
            fila.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger btn-eliminar" data-codigo="${item.codigo}">Eliminar</button></td>
            `;
            const btnEliminar = fila.querySelector(".btn-eliminar") as HTMLButtonElement;
            btnEliminar.onclick = () => this.eliminarCallback?.(item.codigo);
        });
    }

    mostrarTotal(total: number): void {
        this.spTotalPedido.textContent = `$${total.toFixed(2)}`;
    }

    mostrarAlerta(tipo: "success" | "danger" | "warning", mensaje: string): void {
        const id = `alert-${Date.now()}`;
        this.alertContainer.innerHTML = `<div id="${id}" class="alert alert-${tipo} alert-dismissible fade show">${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.remove();
        }, 3000);
    }

    limpiar(): void {
        this.inNomCliente.value = "";
        this.selectMetodoPago.value = "";
        this.inRefPago.value = "";
        this.inDescOtro.value = "";
        this.cambiarMetodoPago();
    }
}