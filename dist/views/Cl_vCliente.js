export default class Cl_vCliente {
    container;
    inNomCliente;
    divProductos;
    inputBuscarProducto;
    selectCategoria;
    tablaCarrito;
    spTotalPedido;
    selectMetodoPago;
    divPagoMovil;
    divEfectivo;
    divEfectivoUSD;
    divOtro;
    inMontoEfectivo;
    inMontoEfectivoUSD;
    inRefPago;
    inDescOtro;
    inCedulaCliente;
    btEnviar;
    alertContainer;
    agregarCallback;
    eliminarCallback;
    buscarProductoCallback;
    buscarPorCategoriaCallback;
    cedulaChangeCallback;
    enviarCallback;
    constructor() {
        this.container = document.getElementById("clientePanel");
        this.inNomCliente = document.getElementById("inNomCliente");
        this.divProductos = document.getElementById("listaProductos");
        this.inputBuscarProducto = document.getElementById("inBuscarProductoCliente");
        this.selectCategoria = document.getElementById("selectCategoria");
        this.tablaCarrito = document.getElementById("tablaCarrito");
        this.spTotalPedido = document.getElementById("spTotalPedido");
        this.selectMetodoPago = document.getElementById("metodoPago");
        this.divEfectivo = document.getElementById("divEfectivo");
        this.divEfectivoUSD = document.getElementById("divEfectivoUSD");
        this.divPagoMovil = document.getElementById("divPagoMovil");
        this.divOtro = document.getElementById("divOtro");
        this.inMontoEfectivo = document.getElementById("montoEfectivo");
        this.inMontoEfectivoUSD = document.getElementById("montoEfectivoUSD");
        this.inRefPago = document.getElementById("refPagoMovil");
        this.inDescOtro = document.getElementById("descOtro");
        this.inCedulaCliente = document.getElementById("inCedulaCliente");
        this.btEnviar = document.getElementById("btEnviar");
        this.alertContainer = document.getElementById("clienteAlertContainer");
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
    cambiarMetodoPago() {
        const value = this.selectMetodoPago.value;
        this.divPagoMovil.style.display = value === "Pago Móvil" ? "block" : "none";
        this.divOtro.style.display = value === "Otro" ? "block" : "none";
        this.divEfectivo.style.display = value === "Efectivo Bs." ? "block" : "none";
        this.divEfectivoUSD.style.display = value === "Efectivo USD" ? "block" : "none";
    }
    get nomCliente() { return this.inNomCliente.value; }
    get cedulaCliente() { return this.inCedulaCliente.value; }
    get metodoPago() { return this.selectMetodoPago.value; }
    get referenciaPago() { return this.inRefPago.value; }
    get descripcionOtro() { return this.inDescOtro.value; }
    get montoEfectivo() { return this.inMontoEfectivo.value; }
    get montoEfectivoUSD() { return this.inMontoEfectivoUSD.value; }
    setNombreCliente(nombre) {
        this.inNomCliente.value = nombre;
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
                        <div class="mb-2 d-flex justify-content-center">
                            <img src="${prod.imagen || 'https://via.placeholder.com/150'}" alt="${prod.nombre}" class="img-fluid">
                        </div>
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
    onAgregarProducto(callback) {
        this.agregarCallback = callback;
    }
    onEliminarProducto(callback) {
        this.eliminarCallback = callback;
    }
    onBuscarProducto(callback) {
        this.buscarProductoCallback = callback;
    }
    onBuscarPorCategoria(callback) {
        this.buscarPorCategoriaCallback = callback;
    }
    onCedulaChange(callback) {
        this.cedulaChangeCallback = callback;
    }
    onEnviar(callback) {
        this.enviarCallback = callback;
    }
    limpiar() {
        this.inNomCliente.value = "";
        this.inCedulaCliente.value = "";
        this.selectMetodoPago.value = "";
        this.inRefPago.value = "";
        this.inDescOtro.value = "";
        this.inMontoEfectivo.value = "";
        this.inMontoEfectivoUSD.value = "";
        this.cambiarMetodoPago();
    }
    mostrar() { this.container.removeAttribute("hidden"); }
    ocultar() { this.container.setAttribute("hidden", "true"); }
}
//# sourceMappingURL=Cl_vCliente.js.map