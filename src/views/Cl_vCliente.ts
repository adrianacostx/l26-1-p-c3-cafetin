import I_vCliente from "../interfaces/I_vCliente.js";
import Cl_sDolar from "../services/Cl_sDolar.js";

export default class Cl_vCliente implements I_vCliente {
    private container: HTMLElement;
    private inNomCliente: HTMLInputElement;
    private divProductos: HTMLElement;
    private inputBuscarProducto: HTMLInputElement;
    private selectCategoria: HTMLSelectElement;
    private tablaCarrito: HTMLTableSectionElement;
    private spTotalPedido: HTMLSpanElement;
    private spTotalPedidoBs: HTMLSpanElement;
    private selectMetodoPago: HTMLSelectElement;
    private divPagoMovil: HTMLElement;
    private divEfectivo: HTMLElement;
    private divEfectivoUSD: HTMLElement;
    private divOtro: HTMLElement;
    private inMontoEfectivo: HTMLInputElement;
    private inMontoEfectivoUSD: HTMLInputElement;
    private inRefPago: HTMLInputElement;
    private inDescOtro: HTMLInputElement;
    private inCedulaCliente: HTMLInputElement;
    private btEnviar: HTMLButtonElement;
    private alertContainer: HTMLElement;

    private agregarCallback?: (codigo: string, cantidad: number) => void;
    private eliminarCallback?: (codigo: string) => void;
    private buscarProductoCallback?: (texto: string) => void;
    private buscarPorCategoriaCallback?: (categoria: string) => void;
    private cedulaChangeCallback?: (cedula: string) => void;
    private enviarCallback?: () => void;

    constructor() {
        this.container = document.getElementById("clientePanel") as HTMLElement;
        this.inNomCliente = document.getElementById("inNomCliente") as HTMLInputElement;
        this.divProductos = document.getElementById("listaProductos") as HTMLElement;
        this.inputBuscarProducto = document.getElementById("inBuscarProductoCliente") as HTMLInputElement;
        this.selectCategoria = document.getElementById("selectCategoria") as HTMLSelectElement;
        this.tablaCarrito = document.getElementById("tablaCarrito") as HTMLTableSectionElement;
        this.spTotalPedido = document.getElementById("spTotalPedido") as HTMLSpanElement;
        this.spTotalPedidoBs = document.getElementById("spTotalPedidoBs") as HTMLSpanElement;
        this.selectMetodoPago = document.getElementById("metodoPago") as HTMLSelectElement;
        this.divEfectivo = document.getElementById("divEfectivo") as HTMLElement;
        this.divEfectivoUSD = document.getElementById("divEfectivoUSD") as HTMLElement;
        this.divPagoMovil = document.getElementById("divPagoMovil") as HTMLElement;
        this.divOtro = document.getElementById("divOtro") as HTMLElement;
        this.inMontoEfectivo = document.getElementById("montoEfectivo") as HTMLInputElement;
        this.inMontoEfectivoUSD = document.getElementById("montoEfectivoUSD") as HTMLInputElement;
        this.inRefPago = document.getElementById("refPagoMovil") as HTMLInputElement;
        this.inDescOtro = document.getElementById("descOtro") as HTMLInputElement;
        this.inCedulaCliente = document.getElementById("inCedulaCliente") as HTMLInputElement;
        this.btEnviar = document.getElementById("btEnviar") as HTMLButtonElement;
        this.alertContainer = document.getElementById("clienteAlertContainer") as HTMLElement;

        // Eventos
        this.selectMetodoPago.addEventListener("change", () => this.cambiarMetodoPago());
        this.inputBuscarProducto.addEventListener("input", () => this.buscarProductoCallback?.(this.inputBuscarProducto.value));
        this.selectCategoria.addEventListener("change", () => {
            if (this.buscarPorCategoriaCallback) {
                this.buscarPorCategoriaCallback(this.selectCategoria.value);
            }
        });
        this.inCedulaCliente.addEventListener("input", () => this.cedulaChangeCallback?.(this.inCedulaCliente.value));
        this.btEnviar.addEventListener("click", () => this.enviarCallback?.());
        this.cambiarMetodoPago();
    }

    private cambiarMetodoPago(): void {
        const value = this.selectMetodoPago.value;
        this.divPagoMovil.style.display = value === "Pago Móvil" ? "block" : "none";
        this.divOtro.style.display = value === "Otro" ? "block" : "none";
        this.divEfectivo.style.display = value === "Efectivo Bs." ? "block" : "none";
        this.divEfectivoUSD.style.display = value === "Efectivo USD" ? "block" : "none";
    }

    get nomCliente(): string { return this.inNomCliente.value; }
    get cedulaCliente(): string { return this.inCedulaCliente.value; }
    get metodoPago(): string { return this.selectMetodoPago.value; }
    get referenciaPago(): string { return this.inRefPago.value; }
    get descripcionOtro(): string { return this.inDescOtro.value; }
    get montoEfectivo(): string { return this.inMontoEfectivo.value; }
    get montoEfectivoUSD(): string { return this.inMontoEfectivoUSD.value; }

    setNombreCliente(nombre: string): void {
        this.inNomCliente.value = nombre;
    }

    mostrarProductos(productos: any[]): void {
        this.divProductos.innerHTML = "";
        productos.forEach(prod => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-3";
            const imgSrc = prod.imagen ? `./resources/img/${prod.imagen}` : 'https://via.placeholder.com/150';
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${prod.nombre}</h5>
                        <div class="mb-2 d-flex justify-content-center">
                            <img src="${imgSrc}" alt="${prod.nombre}" class="img-fluid product-image" style="max-height: 150px; object-fit: contain;">
                        </div>
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

    mostrarTotal(totalUSD: number, totalBs: number): void {
    if (this.spTotalPedido) {
        this.spTotalPedido.textContent = `$${totalUSD.toFixed(2)}`;
    }
    if (this.spTotalPedidoBs) {
        this.spTotalPedidoBs.textContent = `Bs. ${totalBs.toFixed(2)}`;
    }
}

    mostrarAlerta(tipo: "success" | "danger" | "warning", mensaje: string): void {
        const id = `alert-${Date.now()}`;
        this.alertContainer.innerHTML = `<div id="${id}" class="alert alert-${tipo} alert-dismissible fade show">${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.remove();
        }, 3000);
    }

    onAgregarProducto(callback: (codigo: string, cantidad: number) => void): void {
        this.agregarCallback = callback;
    }
    onEliminarProducto(callback: (codigo: string) => void): void {
        this.eliminarCallback = callback;
    }
    onBuscarProducto(callback: (texto: string) => void): void {
        this.buscarProductoCallback = callback;
    }
    onBuscarPorCategoria(callback: (categoria: string) => void): void {
        this.buscarPorCategoriaCallback = callback;
    }
    onCedulaChange(callback: (cedula: string) => void): void {
        this.cedulaChangeCallback = callback;
    }
    onEnviar(callback: () => void): void {
        this.enviarCallback = callback;
    }

    limpiar(): void {
        this.inNomCliente.value = "";
        this.inCedulaCliente.value = "";
        this.selectMetodoPago.value = "";
        this.inRefPago.value = "";
        this.inDescOtro.value = "";
        this.inMontoEfectivo.value = "";
        this.inMontoEfectivoUSD.value = "";
        this.cambiarMetodoPago();
    }

    mostrar(): void { this.container.removeAttribute("hidden"); }
    ocultar(): void { this.container.setAttribute("hidden", "true"); }
}