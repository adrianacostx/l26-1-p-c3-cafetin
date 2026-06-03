export default class Cl_vCliente {
    inNomCliente;
    divProductos;
    tablaCarrito;
    spTotalPedido;
    selectMetodoPago;
    divPagoMovil;
    divOtro;
    inRefPago;
    inDescOtro;
    btEnviar;
    alertContainer;
    agregarCallback;
    eliminarCallback;
    enviarCallback;
    constructor() {
        this.inNomCliente = document.getElementById("inNomCliente");
        this.divProductos = document.getElementById("listaProductos");
        this.tablaCarrito = document.getElementById("tablaCarrito");
        this.spTotalPedido = document.getElementById("spTotalPedido");
        this.selectMetodoPago = document.getElementById("metodoPago");
        this.divPagoMovil = document.getElementById("divPagoMovil");
        this.divOtro = document.getElementById("divOtro");
        this.inRefPago = document.getElementById("refPagoMovil");
        this.inDescOtro = document.getElementById("descOtro");
        this.btEnviar = document.getElementById("btEnviar");
        this.alertContainer = document.getElementById("clienteAlertContainer");
        this.selectMetodoPago.addEventListener("change", () => this.cambiarMetodoPago());
        this.btEnviar.onclick = () => this.enviarCallback?.();
        this.cambiarMetodoPago();
    }
    cambiarMetodoPago() {
        const value = this.selectMetodoPago.value;
        this.divPagoMovil.style.display = value === "Pago Móvil" ? "block" : "none";
        this.divOtro.style.display = value === "Otro" ? "block" : "none";
    }
    get nomCliente() { return this.inNomCliente.value; }
    get metodoPago() { return this.selectMetodoPago.value; }
    get referenciaPago() { return this.inRefPago.value; }
    get descripcionOtro() { return this.inDescOtro.value; }
    onAgregarProducto(callback) {
        this.agregarCallback = callback;
    }
    onEliminarProducto(callback) {
        this.eliminarCallback = callback;
    }
    onEnviar(callback) {
        this.enviarCallback = callback;
    }
    mostrarProductos(productos) {
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
            const btn = card.querySelector(".btn-agregar");
            btn.onclick = () => {
                const input = document.getElementById(`cant-${prod.codigo}`);
                const cantidad = parseInt(input.value) || 1;
                this.agregarCallback?.(prod.codigo, cantidad);
            };
            this.divProductos.appendChild(card);
        });
    }
    mostrarCarrito(items) {
        this.tablaCarrito.innerHTML = "";
        items.forEach(item => {
            const fila = this.tablaCarrito.insertRow();
            fila.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger btn-eliminar" data-codigo="${item.codigo}">Eliminar</button></td>
            `;
            const btnEliminar = fila.querySelector(".btn-eliminar");
            btnEliminar.onclick = () => this.eliminarCallback?.(item.codigo);
        });
    }
    mostrarTotal(total) {
        this.spTotalPedido.textContent = `$${total.toFixed(2)}`;
    }
    mostrarAlerta(tipo, mensaje) {
        const id = `alert-${Date.now()}`;
        this.alertContainer.innerHTML = `<div id="${id}" class="alert alert-${tipo} alert-dismissible fade show">${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el)
                el.remove();
        }, 3000);
    }
    limpiar() {
        this.inNomCliente.value = "";
        this.selectMetodoPago.value = "";
        this.inRefPago.value = "";
        this.inDescOtro.value = "";
        this.cambiarMetodoPago();
    }
}
//# sourceMappingURL=Cl_vCliente.js.map